---
title: DeepSeek API в .NET — OpenAI-совместимый клиент без SDK, Ollama для разработки и ИИ, который приводит заметки в порядок
description: Часть 26 цикла о разработке Telegram-таск-трекера небольшой командой. Как в Boards появился ИИ, который превращает поток мыслей из чата в аккуратную задачу: DeepSeek в продакшене, Ollama для локальной разработки, свой OpenAI-совместимый клиент на HttpClient и команда /aisave в Telegram.
seoTitle: DeepSeek API в .NET: OpenAI-совместимый клиент без SDK
seoDescription: Часть 26: DeepSeek API в .NET через OpenAI-совместимый API — свой клиент на HttpClient, Ollama для разработки, промпт для заметок и команда /aisave в Telegram.
type: article
series: architecture-first
part: 26
createdAt: 2026-10-13 13:39
updatedAt: 2026-10-13 14:04
projects: [boards]
tags: [devlog, dotnet, ai, telegram, task-tracker]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 26.
> В [предыдущей статье](telegram-group-chat-bot-dotnet) бот научился работать в групповых чатах. Теперь в Boards появился ИИ: он превращает сообщения из чата в аккуратно оформленные задачи.

## Краткое содержание

Как мы добавили в Boards ИИ:

1. ИИ берёт текст задачи — набор идей или обычную речь из чата — и превращает его в аккуратное сообщение: заголовок и оформленный текст без повторов. Новых фактов он не добавляет.
2. В продакшене работает DeepSeek: у него самая низкая цена при достаточном для этой задачи качестве. Для локальной разработки используется Ollama — это самый простой кроссплатформенный вариант.
3. И DeepSeek, и Ollama поддерживают OpenAI-совместимый API, поэтому клиент один, а провайдер меняется настройками.
4. Клиент — обычный `HttpClient` без SDK: у Microsoft есть свои пакеты для работы с ИИ, но пока они не выглядят стабильными.
5. В Telegram для этого есть команда `/aisave`, а в веб-приложении — кнопка «Улучшить с ИИ» в редакторе задачи.
6. Если ИИ недоступен, пользователь получает понятное сообщение, а исходный текст никуда не пропадает.

## Зачем задачам ИИ

В Boards задачи часто появляются из сообщений в Telegram. А сообщения в чате редко похожи на готовую задачу: это может быть поток идей, записанный на ходу, или обычная разговорная речь из обсуждения. Если сохранить его без изменений, потом такую задачу неудобно читать.

Мы хотели, чтобы ИИ превращал такой текст в нормально оформленное сообщение: с заголовком, исправленными ошибками и понятной структурой.

## Что делает модель

Вся задача модели описана в системном промпте:

```text
Beautify these task notes: fix grammar, spelling, formatting and structure, remove
duplicate statements. Never add facts or content not already present; never change
meaning - wording only.
Output markdown only, shape: title line, then a line with only "---", then the
beautified content. Keep an existing title as-is (beautified only); else derive a
short title from the notes. No code block, no extra commentary.
```

Главное в нём — запрет добавлять что-то от себя: модель может исправить ошибки, убрать повторы и разложить текст по пунктам, но не может придумывать новые факты и менять смысл. Ответ приходит в фиксированной форме: строка заголовка, разделитель `---` и оформленный текст.

## Почему DeepSeek и Ollama

Задача у модели несложная: не нужно рассуждать или писать код, нужно аккуратно переформулировать текст. Поэтому в продакшене мы выбрали DeepSeek — у него самая низкая цена при качестве, которого для этой задачи достаточно.

Для локальной разработки используется Ollama. Это самый простой кроссплатформенный способ запустить модель у себя: установить Ollama и скачать модель одной командой.

```bash
ollama pull gemma3:12b
```

Подробнее о работе с Ollama из .NET мы писали в [отдельной статье](ollama-dotnet).

## Один клиент для любого провайдера

И DeepSeek, и Ollama поддерживают OpenAI-совместимый API: один и тот же запрос `POST /chat/completions` с одинаковым форматом. Поэтому клиент у нас один, а провайдера определяют настройки:

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

По умолчанию в `appsettings.json` указана локальная Ollama, а в продакшене эти значения переопределяются на адрес, модель и ключ DeepSeek:

```json
"AiSummarizer": {
  "ApiKey": "ollama",
  "BaseUrl": "http://localhost:11434/v1/",
  "Model": "gemma3:12b"
}
```

Режим «размышления» (thinking) по умолчанию выключен: для переформулировки текста он не нужен, а ответы с ним заметно медленнее.

## Клиент без SDK

Для OpenAI-совместимых API есть готовые клиенты, и у Microsoft тоже появились свои пакеты для работы с ИИ. Но пока они не выглядят стабильными, поэтому мы используем обычный `HttpClient`: нам нужен всего один запрос. Когда они станут стабильнее, мы сможем на них перейти.

Клиент регистрируется как типизированный `HttpClient`, которому задаются адрес провайдера и ключ:

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

А сам запрос — это обычный POST с системным промптом и текстом задачи:

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

Любая проблема с провайдером — ошибка сети, неуспешный статус, пустой ответ — превращается в одно исключение `AiContentSummarizationException`. Остальной код не разбирается, что именно сломалось у провайдера: он знает только, что ИИ сейчас недоступен.

## /aisave в Telegram и кнопка в веб-приложении

В Telegram у бота уже была команда `/save`, которая сохраняет сообщение как задачу. Рядом появилась `/aisave`: она делает то же самое, но сначала прогоняет текст через ИИ. Команда работает и в личном чате, и в группах.

Если ИИ недоступен, бот не сохраняет сырой текст молча, а коротко сообщает, что обработка сейчас не работает:

```csharp
catch (AiContentSummarizationException ex)
{
    logger.LogWarning(ex, "AI summarization failed for chat {ExternalChatId}", message.Chat.Id);
    await ephemeralReplySender.SendEphemeralNotice(message, Phrases.AiSummarizationUnavailable, cancellationToken);
    return;
}
```

Исходное сообщение остаётся в чате, так что его можно сохранить обычной командой `/save`.

В веб-приложении в редакторе задачи есть кнопка «Улучшить с ИИ». Она отправляет текст в `POST /api/issues/summarize` и подставляет ответ в редактор, а сохранять ли изменения, решает пользователь.

## Итоги

- **ИИ приводит заметки в порядок.** Поток идей или разговорная речь превращаются в задачу с заголовком и понятным текстом.
- **Модель не добавляет фактов.** Это главное ограничение в промпте.
- **DeepSeek в продакшене, Ollama для локальной разработки.** Самая низкая цена при достаточном качестве и самый простой кроссплатформенный запуск.
- **Один клиент для всех провайдеров.** OpenAI-совместимый API позволяет менять провайдера настройками.
- **Без SDK.** Обычный `HttpClient`, пока пакеты Microsoft для ИИ не выглядят стабильными.
- **Исходный текст не пропадает.** Если ИИ недоступен, пользователь видит понятное сообщение, а его текст остаётся как был.

## Что дальше

Следующим шагом мы дали ИИ-агентам доступ к самим задачам: в Boards появился MCP-сервер. Об этом — [следующая статья](running-our-backlog-with-claude-code-mcp).
