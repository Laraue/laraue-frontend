---
title: DeepSeek API in .NET — an OpenAI-compatible client without an SDK, Ollama for development and AI that tidies up notes
description: Part 26 of the series about building a Telegram task tracker in a tiny team. How Boards got AI that turns a stream of thoughts from a chat into a neat task: DeepSeek in production, Ollama for local development, our own OpenAI-compatible client on HttpClient and the /aisave command in Telegram.
seoTitle: DeepSeek API in .NET: OpenAI-Compatible Client Without SDK
seoDescription: Part 26: the DeepSeek API in .NET via the OpenAI-compatible API — our own HttpClient client, Ollama for development, a prompt for notes and the /aisave command.
type: article
series: architecture-first
part: 26
createdAt: 2026-10-13 13:39
updatedAt: 2026-10-13 13:39
projects: [boards]
tags: [devlog, dotnet, ai, telegram, task-tracker]
---

> **Architecture First: Building a Jira Alternative in a Tiny Team, AI-Assisted** — Part 26.
> In the [previous article](telegram-group-chat-bot-dotnet) the bot learned to work in group chats. Now Boards got AI: it turns chat messages into neatly formatted tasks.

## The short version

How we added AI to Boards:

1. AI takes the text of a task, a batch of ideas or ordinary speech from a chat, and turns it into a neat message: a title and formatted text without repetition. It adds no new facts.
2. In production we use DeepSeek: it has the lowest price with quality that is enough for this task. For local development we use Ollama, the simplest cross-platform option.
3. Both DeepSeek and Ollama support the OpenAI-compatible API, so there is one client, and the provider is switched in the settings.
4. The client is a plain `HttpClient` without an SDK: Microsoft has its own AI packages, but they do not look stable yet.
5. In Telegram there is the `/aisave` command for it, and in the web app an "Improve with AI" button in the task editor.
6. If AI is unavailable, the user gets a clear message, and the original text does not go anywhere.

## Why tasks need AI

In Boards, tasks often come from Telegram messages. But chat messages rarely look like a finished task: it may be a stream of ideas jotted down on the go, or ordinary conversational speech from a discussion. Such a message can be saved as is, but it is inconvenient to read later.

We wanted AI to turn such text into a properly formatted message: with a title, fixed mistakes and a clear structure.

## What the model does

The model's whole job is described in the system prompt:

```text
Beautify these task notes: fix grammar, spelling, formatting and structure, remove
duplicate statements. Never add facts or content not already present; never change
meaning - wording only.
Output markdown only, shape: title line, then a line with only "---", then the
beautified content. Keep an existing title as-is (beautified only); else derive a
short title from the notes. No code block, no extra commentary.
```

The key part is the ban on adding anything of its own: the model may fix mistakes, remove repetition and break the text into points, but it may not invent new facts or change the meaning. The answer comes in a fixed shape: a title line, a `---` separator and the formatted text.

## Why DeepSeek and Ollama

The model's task is not hard: it does not need to reason or write code, only to rephrase text carefully. So in production we chose DeepSeek, which has the lowest price with quality that is enough for this task.

For local development we use Ollama. It is the simplest cross-platform way to run a model on your own machine: install Ollama and pull the model with one command.

```bash
ollama pull gemma3:12b
```

We wrote more about working with Ollama from .NET in a [separate article](ollama-dotnet).

## One client for any provider

Both DeepSeek and Ollama support the OpenAI-compatible API: the same `POST /chat/completions` request with the same format. So we have one client, and the settings decide the provider:

```csharp
public class AiSummarizerOptions
{
    /// <summary>
    /// API key sent as a bearer token.
    /// </summary>
    public required string ApiKey { get; set; }

    /// <summary>
    /// API base address.
    /// </summary>
    public required string BaseUrl { get; set; }

    /// <summary>
    /// Model to use for chat completions.
    /// </summary>
    public required string Model { get; set; }

    /// <summary>
    /// Whether to let the model "think" (extended chain-of-thought) before answering.
    /// This task doesn't need it, and it substantially slows down responses on models
    /// that support toggling it - defaults to disabled.
    /// </summary>
    public bool Thinking { get; set; }
}
```

By default `appsettings.json` points to a local Ollama, and in production these values are overridden with DeepSeek's address, model and key:

```json
"AiSummarizer": {
  "ApiKey": "ollama",
  "BaseUrl": "http://localhost:11434/v1/",
  "Model": "gemma3:12b"
}
```

The "thinking" mode is off by default: rephrasing text does not need it, and answers with it are noticeably slower.

## A client without an SDK

There are ready-made clients for OpenAI-compatible APIs, and Microsoft has also released its own AI packages. But they do not look stable yet, so we use a plain `HttpClient`: we only need one request. Once Microsoft's packages settle, we can switch to them.

The client is registered as a typed `HttpClient` that gets the provider's address and key right away:

```csharp
builder.Services
    .AddHttpClient<IAiContentSummarizer, OpenAiCompatibleContentSummarizer>((sp, client) =>
    {
        var aiOptions = sp.GetRequiredService<IOptions<AiSummarizerOptions>>().Value;
        client.BaseAddress = new Uri(aiOptions.BaseUrl);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            aiOptions.ApiKey);
    });
```

The request itself is a regular POST with the system prompt and the task text:

```csharp
public async Task<string> SummarizeAsync(string notes, CancellationToken cancellationToken)
{
    var request = new ChatCompletionRequest
    {
        Model = options.Value.Model,
        Messages =
        [
            new ChatMessage { Role = "system", Content = SystemPrompt },
            new ChatMessage { Role = "user", Content = notes },
        ],
        Thinking = new ChatCompletionThinking
        {
            Type = options.Value.Thinking ? "enabled" : "disabled",
        },
        MaxTokens = DefaultMaxTokens,
        Stream = false,
    };

    HttpResponseMessage response;
    try
    {
        response = await httpClient.PostAsJsonAsync("chat/completions", request, cancellationToken);
        response.EnsureSuccessStatusCode();
    }
    catch (HttpRequestException ex)
    {
        throw new AiContentSummarizationException("AI summarization API request failed.", ex);
    }

    var completion = await response.Content.ReadFromJsonAsync<ChatCompletionResponse>(cancellationToken)
        ?? throw new AiContentSummarizationException("AI summarization API returned an empty response.");

    var content = completion.Choices.FirstOrDefault()?.Message.Content;
    if (string.IsNullOrWhiteSpace(content))
        throw new AiContentSummarizationException("AI summarization API returned no completion content.");

    return content.Trim();
}
```

Any problem with the provider, whether a network error, a failed status or an empty answer, becomes one `AiContentSummarizationException`. The rest of the code does not care what exactly broke at the provider: it only knows that AI is unavailable right now.

The client is covered by tests without a real provider: instead of the network, an `HttpMessageHandler` returns a predefined answer. The tests check that the text is taken from the answer, that the thinking mode is passed in the request, and that a failed status or an answer without choices becomes an `AiContentSummarizationException`.

## /aisave in Telegram and a button in the web app

In Telegram the bot already had the `/save` command, which saves a message as a task. Next to it came `/aisave`: it does the same but runs the text through AI first. The command works both in the private chat and in groups.

If AI is unavailable, the bot does not silently save the raw text but briefly reports that processing is not working right now:

```csharp
catch (AiContentSummarizationException ex)
{
    logger.LogWarning(ex, "AI summarization failed for chat {ExternalChatId}", message.Chat.Id);
    await ephemeralReplySender.SendEphemeralNotice(message, Phrases.AiSummarizationUnavailable, cancellationToken);
    return;
}
```

The original message stays in the chat, so it can be saved with the regular `/save` command.

In the web app the task editor has an "Improve with AI" button. It sends the text to `POST /api/issues/summarize` and puts the answer into the editor, and whether to save the changes is up to the user.

## Results

- **AI tidies up notes.** A stream of ideas or conversational speech turns into a task with a title and clear text.
- **The model adds no facts.** That is the main constraint in the prompt.
- **DeepSeek in production, Ollama for local development.** The lowest price with sufficient quality, and the simplest cross-platform setup.
- **One client for all providers.** The OpenAI-compatible API lets us switch providers in the settings.
- **No SDK.** A plain `HttpClient` until Microsoft's AI packages look stable.
- **An AI failure does not lose the text.** The user sees a clear message, and the original text stays.

## What comes next

Next, Boards got separate services for accounts and payments. That is the subject of the next article.
