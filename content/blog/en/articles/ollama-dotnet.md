---
title: Using Ollama in C# and .NET — Local LLM Integration With Structured Output
type: article
featured: true
tags: [dotnet, ai, open-source]
projects: [real-estate, learn-language]
description: How to call Ollama from C# and .NET: HttpClient with text and image input, structured JSON output, a typed NuGet adapter that generates the schema from a C# class, and how it compares with OllamaSharp and Microsoft.Extensions.AI. No cloud API required.
seoTitle: Ollama in C# and .NET: Local LLMs with Structured Output
seoDescription: Call Ollama from C# and .NET: HttpClient with image input, structured JSON output, the Laraue.Ollama.NET adapter, OllamaSharp and Microsoft.Extensions.AI.
createdAt: 2025-12-26
updatedAt: 2026-10-03 18:28
---
**Integrating Ollama with C# and .NET** lets you run open-source language and vision models locally — no cloud API keys, no per-call costs, no data leaving your server. This article covers the native Ollama HTTP API, structured output with JSON Schema, vision model image analysis, and a typed .NET adapter library that generates request schemas automatically from C# classes.

Two of our projects use this approach: the [real estate aggregator](https://apartments.laraue.com) used Ollama to score apartment photos by renovation quality (it no longer collects new listings); the [language learning bot](../projects/learn-language) uses it for vocabulary generation. Both run inference locally with no third-party API dependency.

## The short version

To call a local Ollama model from C#:

1. Start Ollama. It listens on `http://localhost:11434` by default.
2. Send a `POST` to `/api/generate` with `HttpClient`: `model`, `prompt` and `stream: false`. For a vision model add `images`, an array of base64 strings. For structured output add `format`, a JSON Schema.
3. The answer is in the `response` field. With structured output it is a JSON string that you deserialize yourself.
4. Or let a library do that plumbing: this article shows our typed adapter, `Laraue.Ollama.NET`, which builds the schema from a C# class, and compares it with OllamaSharp and Microsoft.Extensions.AI.

---

## Why Use Ollama Instead of a Cloud API

Cloud APIs (ChatGPT, DeepSeek, Gemini) are the obvious first choice — until they aren't. Common reasons to run locally:

| Situation                          | Why cloud doesn't work                                                        |
|------------------------------------|-------------------------------------------------------------------------------|
| Processing personal data           | Sending user data to external providers may violate GDPR or other regulations |
| High availability requirements     | Your uptime can't depend on a third-party API's SLA                           |
| Export-restricted countries        | Some AI providers don't operate in certain regions                            |
| Cost-sensitive workloads           | Per-call API pricing becomes expensive at volume                              |
| Offline or air-gapped environments | No internet access by definition                                              |

For MVPs and hypothesis testing, **pre-trained open-source models via Ollama** are the fastest path: swap a model by changing one config string, no retraining required. If the MVP proves viable, you can replace the model with a fine-tuned version later — the integration code stays the same.

[Ollama](https://ollama.com) provides a universal HTTP API over different models. When you start Ollama, it runs a local service on port **11434** by default. Any HTTP client can call it — no SDK required.

---

## The Native Ollama HTTP API

### Text Generation

Send a `POST` to `/api/generate`:

```json
{
  "model": "gemma3:12b",
  "prompt": "Translate the following text to French: 'The apartment has two rooms and a large balcony.'",
  "stream": false
}
```

The response:

```json
{
  "model": "gemma3:12b",
  "response": "L'appartement a deux pièces et un grand balcon."
}
```

To include an image, add the `images` field with a base64-encoded string. Only vision-capable models use it — for text-only models the field is ignored:

```json
{
  "model": "qwen2.5vl:3b",
  "prompt": "Describe what you see in this photo.",
  "stream": false,
  "images": ["<base64EncodedImageBytes>"]
}
```

The response:

```json
{
  "model": "qwen2.5vl:3b",
  "response": "The photo shows a bright living room with white walls, laminate flooring, and large windows."
}
```

### Calling the API from C# with HttpClient

Ollama has no official .NET client (its official libraries are for Python and JavaScript), but the API is plain JSON over HTTP, so `HttpClient` is enough. This calls a vision model with an image:

```csharp
using System.Net.Http.Json;

var client = new HttpClient { BaseAddress = new Uri("http://localhost:11434/") };

var imageBase64 = Convert.ToBase64String(await File.ReadAllBytesAsync("photo.jpg"));

var response = await client.PostAsJsonAsync("api/generate", new
{
    model = "qwen2.5vl:7b",
    prompt = "Describe what you see in this photo.",
    images = new[] { imageBase64 },
    stream = false,
});
response.EnsureSuccessStatusCode();

var result = await response.Content.ReadFromJsonAsync<GenerateResponse>();
Console.WriteLine(result!.Response);

record GenerateResponse(string Response);
```

Leave `images` out for a text-only request. `stream = false` makes Ollama return one JSON object instead of a stream of chunks, which is simpler to read.

### Structured Output With JSON Schema

The `format` field enables **structured output** — the model returns a JSON object matching your schema instead of free text. This is critical for any use case where you need to parse the response programmatically:

```json
{
  "model": "qwen2.5vl:3b",
  "prompt": "Analyze this apartment photo and return your assessment.",
  "stream": false,
  "images": ["<base64EncodedImageBytes>"],
  "format": {
    "type": ["object"],
    "properties": {
      "RenovationRating": {
        "type": ["number"]
      },
      "Tags": {
        "type": ["array"],
        "items": { "type": ["string"] }
      },
      "Description": {
        "type": ["string"]
      }
    },
    "required": ["RenovationRating", "Tags", "Description"]
  }
}
```

The `required` list matters. When we ran a schema with one property and no `required` against `gemma3:4b`, the model answered with an empty object (`{ }`) both times; with `"required": ["RenovationRating"]` it returned `{ "RenovationRating": 7 }` both times. The schema constrains the shape, but without `required` an empty object is a valid answer.

The structured answer comes back inside the `response` field as a **JSON string**, which your code has to parse:

```json
{
  "model": "qwen2.5vl:3b",
  "response": "{ \"RenovationRating\": 0.82, \"Tags\": [\"clean\", \"bright\", \"new_windows\", \"modern_kitchen\"], \"Description\": \"Well-maintained apartment with recent renovation, good natural light, and updated fixtures.\" }"
}
```

In C#, deserialize `response` with `JsonSerializer.Deserialize<T>(...)`.

---

## The Problem With the Native API in Practice

Writing the `format` JSON Schema by hand for every response type is tedious and error-prone. A missing `"type"` wrapper, a misspelled property name, or a wrong nesting level silently produces a response that doesn't match your C# class — and you find out at deserialization time, not at the call site.

The other pain point is boilerplate: every call needs HTTP client setup, JSON serialization, base64 encoding, error handling, and response parsing. None of that is interesting code.

---

## Laraue.Ollama.NET: A Typed .NET Adapter

The [`Laraue.Ollama.NET`](https://github.com/win7user10/Laraue.Ollama.NET) NuGet package wraps the native API with a typed interface. It generates the JSON Schema automatically from your C# class using reflection — so schema changes are picked up automatically without touching any request code.

> **Note:** this package was previously published as `Laraue.Core.Ollama`. It was renamed to `Laraue.Ollama.NET`; update your `PackageReference`/`dotnet add package` command and namespace usings if you're upgrading from the old name.

|           |                                                                      |
|-----------|----------------------------------------------------------------------|
| NuGet     | ![latest version](https://img.shields.io/nuget/v/Laraue.Ollama.NET)  |
| Downloads | ![downloads](https://img.shields.io/nuget/dt/Laraue.Ollama.NET)      |
| GitHub    | [Laraue.Ollama.NET](https://github.com/win7user10/Laraue.Ollama.NET) |

### The Interface

[`IOllamaPredictor`](https://github.com/win7user10/Laraue.Ollama.NET/blob/main/src/Laraue.Ollama.NET/IOllamaPredictor.cs) (namespace `Laraue.Ollama.NET`) exposes three overloads:

```csharp
public interface IOllamaPredictor
{
    // Vision model: structured output + image
    Task<TModel> PredictAsync<TModel>(
        string modelName,
        string prompt,
        string base64EncodedImage,
        Dictionary<string, object>? additionalParameters = null,
        CancellationToken ct = default)
        where TModel : class;

    // Text model: structured output, no image
    Task<TModel> PredictAsync<TModel>(
        string modelName,
        string prompt,
        Dictionary<string, object>? additionalParameters = null,
        CancellationToken ct = default)
        where TModel : class;

    // Raw string response — no schema, no deserialization
    Task<string> PredictAsync(
        string modelName,
        string prompt,
        Dictionary<string, object>? additionalParameters = null,
        CancellationToken ct = default);
}
```

Use the generic overloads when you need structured output parsed into a C# type. Use the raw overload when you want the model's text response directly — useful for freeform generation or when you handle parsing yourself. `additionalParameters` adds fields to the top level of the Ollama request, so you can pass things the adapter does not model, such as `options` or `keep_alive`, without dropping to the native HTTP API. Model options like `temperature` or `top_p` belong inside `options`: `new Dictionary<string, object> { ["options"] = new Dictionary<string, object> { ["temperature"] = 0.2 } }`. Do not pass `temperature` itself as a key: the adapter already writes that key, and adding it a second time throws.

### Installation

```
dotnet add package Laraue.Ollama.NET
```

### Setup

Register the predictor in your DI container:

```csharp
services.AddHttpClient<IOllamaPredictor, OllamaPredictor>((serviceProvider, client) =>
{
    client.BaseAddress = new Uri("http://localhost:11434/");
    // Replace with your Ollama host if running on a separate machine
});
```

### Define Your Response Contract

Any C# class or record works. Properties map to the generated JSON Schema:

```csharp
public record PredictionResult
{
    public required double RenovationRating { get; set; }  // maps to "number"
    public required string[] Tags { get; set; }            // maps to "array" of "string"
    public required string Description { get; set; }       // maps to "string"
}
```

The adapter reflects over `PredictionResult` at call time, builds the `format` JSON Schema, sends the request, and deserializes the response back into `PredictionResult`. Adding a new property to the record immediately affects the next request — no manual schema editing.

### What the Generated Schema Contains

The adapter reads the public properties of your class and maps their types:

| C# type | JSON Schema type |
|---|---|
| `string`, `DateTime` | `string` |
| `int`, `long`, `float`, `double`, `decimal` | `number` |
| `bool` | `boolean` |
| arrays and lists | `array` (of the mapped element type, nested classes included) |
| other classes, dictionaries | `object` with their properties |

Two limits to know about. The generated schema has no `required` list, so the model is allowed to omit properties, and a missing one deserializes to the default value (a rating of `0`, for example). As the `gemma3:4b` run above shows, that can happen for real, so validate the result, or call the native API with your own `required`. Enums are not mapped to strings; use a `string` property instead.

### Text Analysis

```csharp
var result = await ollamaPredictor.PredictAsync<PredictionResult>(
    modelName: "gemma3:12b",
    prompt: "Classify the following text and return structured output.",
    ct: ct);

Console.WriteLine(result.RenovationRating); // 0.74
Console.WriteLine(string.Join(", ", result.Tags)); // "clean, bright, good_location"
```

### Image Analysis

```csharp
var imageBytes = File.ReadAllBytes("apartment.jpg");
var base64Image = Convert.ToBase64String(imageBytes);

var result = await ollamaPredictor.PredictAsync<PredictionResult>(
    modelName: "qwen2.5vl:3b",
    prompt: "Rate the renovation quality visible in this apartment photo.",
    base64EncodedImage: base64Image,
    ct: ct);
```

---

## Other .NET Options

`Laraue.Ollama.NET` is small on purpose. These are the other common ways to call Ollama from .NET:

- **OllamaSharp.** The community .NET SDK that Ollama's own README lists for .NET. It covers chat and generate calls, streaming, images and structured output, and it implements Microsoft's `IChatClient` and `IEmbeddingGenerator`.
- **Microsoft.Extensions.AI.** Microsoft's abstraction (`IChatClient`) that lets you switch between providers. Its separate `Microsoft.Extensions.AI.Ollama` package is deprecated, and NuGet points to OllamaSharp as the replacement: use OllamaSharp as the Ollama implementation behind `IChatClient`.
- **Plain `HttpClient`**, as shown above, when you need one or two calls and no extra dependency.

We wrote our own adapter for one narrow job: structured output with a schema generated from a C# class. If you want streaming, chat history or a provider-neutral interface, use OllamaSharp.

---

## Model Selection Notes

- **For text tasks:** `gemma3:12b` and `qwen2.5:7b` are good starting points. Larger parameter counts produce better reasoning; smaller ones run faster.
- **For vision tasks:** `qwen2.5vl:3b` handles image analysis well at modest hardware requirements. Check the model's page on [ollama.com/library](https://ollama.com/library) to confirm vision support before downloading.
- **First call latency:** Ollama downloads the model on first use if it's not already cached locally. Subsequent calls within the default 5-minute idle window load the model from memory and are significantly faster.
- **Model switching:** Change the `model` parameter string — nothing else in your code changes. This is the main reason to use Ollama over fine-tuned model hosting: zero-cost model comparison.

---

## Real-World Usage

The [real estate aggregator](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/OllamaRealEstatePredictor.cs) uses `IOllamaPredictor` with `qwen2.5vl:7b`. All the photos of a flat are merged into one collage and sent in a single request, and the model returns a renovation rating from 0 to 10, a `HasNoRenovation` flag and a list of positive and negative features. The features are stored for prompt debugging. [How the pipeline and the ranking formula work](../articles/building-ai-real-estate-system).
