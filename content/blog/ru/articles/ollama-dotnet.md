---
title: Интеграция Ollama с C# и .NET — локальные LLM, структурированный вывод и vision-модели
type: article
featured: true
tags: [dotnet, ai, open-source]
projects: [real-estate, learn-language]
description: Как вызвать Ollama из C# и .NET: HttpClient с текстом и изображением, структурированный JSON-вывод, типизированный NuGet-адаптер со схемой из C# класса и сравнение с OllamaSharp и Microsoft.Extensions.AI. Без облачного API.
seoTitle: Ollama в C# и .NET: локальные LLM и структурированный вывод
seoDescription: Ollama из C# и .NET: HttpClient с изображением, структурированный JSON-вывод, адаптер Laraue.Ollama.NET, OllamaSharp и Microsoft.Extensions.AI.
createdAt: 2025-12-26
updatedAt: 2026-10-03 18:29
---
**Интеграция Ollama с C# и .NET** позволяет запускать open-source языковые и vision-модели локально — без облачных API-ключей, без оплаты за каждый вызов, без передачи данных на внешние серверы. В этой статье разбирается нативный HTTP API Ollama, структурированный вывод через JSON Schema, анализ изображений vision-моделями и типизированный .NET-адаптер, который генерирует схемы запросов из C# классов автоматически.

Два наших проекта используют этот подход: [агрегатор недвижимости](https://apartments.laraue.com) применял Ollama для оценки фотографий квартир по качеству ремонта (новые объявления он больше не собирает); [бот для изучения языков](../projects/learn-language) — для генерации словарного запаса. Оба работают локально без зависимости от сторонних API. [Описание проекта агрегатора квартир](../projects/real-estate).

## Краткое содержание

Как вызвать локальную модель Ollama из C#:

1. Запустите Ollama. По умолчанию он слушает `http://localhost:11434`.
2. Отправьте `POST` на `/api/generate` через `HttpClient`: `model`, `prompt` и `stream: false`. Для vision-модели добавьте `images` — массив строк base64. Для структурированного вывода добавьте `format` — JSON Schema.
3. Ответ лежит в поле `response`. При структурированном выводе это JSON-строка, которую вы десериализуете сами.
4. Либо отдайте эту рутину библиотеке: в статье показан наш типизированный адаптер `Laraue.Ollama.NET`, который строит схему из C# класса, и его сравнение с OllamaSharp и Microsoft.Extensions.AI.

---

## Почему Ollama, а не облачный API

Облачные API (ChatGPT, DeepSeek, Gemini) — очевидный первый выбор, пока не сталкиваешься с ограничениями. Типичные причины запускать модели локально:

| Ситуация                         | Почему облако не подходит                                                                             |
|----------------------------------|-------------------------------------------------------------------------------------------------------|
| Обработка персональных данных    | Передача данных пользователей внешнему провайдеру может нарушать 152-ФЗ, GDPR или внутреннюю политику |
| Высокие требования к доступности | Uptime не может зависеть от SLA стороннего сервиса                                                    |
| Санкционные ограничения          | Часть AI-провайдеров недоступна в ряде стран из-за экспортных ограничений                             |
| Высокая нагрузка                 | Поцентрично-платная модель становится дорогой при большом объёме вызовов                              |
| Офлайн или изолированная среда   | Нет доступа в интернет по условиям инфраструктуры                                                     |

Для MVP и проверки гипотез **предобученные open-source модели через Ollama** — самый быстрый путь: смените модель изменением одной строки конфига, без переобучения. Если MVP докажет жизнеспособность, модель можно заменить на дообученную — интеграционный код не изменится.

[Ollama](https://ollama.com) предоставляет единый HTTP API для разных моделей. При запуске Ollama поднимает локальный сервис на порту **11434** по умолчанию. Любой HTTP-клиент может его вызвать — никакого SDK не требуется.

---

## Нативный HTTP API Ollama

### Генерация текста

Отправьте `POST` на `/api/generate`:

```json
{
  "model": "gemma3:12b",
  "prompt": "Переведи следующий текст на французский язык: 'Квартира имеет две комнаты и большой балкон.'",
  "stream": false
}
```

Ответ:

```json
{
  "model": "gemma3:12b",
  "response": "L'appartement a deux pièces et un grand balcon."
}
```

Для передачи изображения добавьте поле `images` с base64-строкой. Только vision-модели его обрабатывают — для текстовых моделей поле игнорируется:

```json
{
  "model": "qwen2.5vl:3b",
  "prompt": "Опиши, что изображено на фотографии.",
  "stream": false,
  "images": ["<base64EncodedImageBytes>"]
}
```

Ответ:

```json
{
  "model": "qwen2.5vl:3b",
  "response": "На фотографии изображена светлая гостиная с белыми стенами, ламинатом и большими окнами."
}
```

### Вызов API из C# через HttpClient

Официального .NET-клиента у Ollama нет (официальные библиотеки — для Python и JavaScript), но API — это обычный JSON поверх HTTP, так что `HttpClient` достаточно. Вот вызов vision-модели с изображением:

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

Для текстового запроса уберите `images`. `stream = false` заставляет Ollama вернуть один JSON-объект вместо потока частей, так читать проще.

### Структурированный вывод через JSON Schema

Поле `format` включает **структурированный вывод** — модель возвращает JSON-объект по вашей схеме вместо произвольного текста. Это необходимо в любом сценарии, где ответ нужно парсить программно:

```json
{
  "model": "qwen2.5vl:3b",
  "prompt": "Проанализируй фотографию квартиры и верни оценку.",
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

Список `required` важен. Когда мы запускали схему с одним свойством и без `required` на `gemma3:4b`, модель оба раза отвечала пустым объектом (`{ }`); с `"required": ["RenovationRating"]` оба раза возвращалось `{ "RenovationRating": 7 }`. Схема ограничивает форму ответа, но без `required` пустой объект тоже считается допустимым.

Структурированный ответ приходит в поле `response` как **JSON-строка**, которую ваш код должен разобрать:

```json
{
  "model": "qwen2.5vl:3b",
  "response": "{ \"RenovationRating\": 0.82, \"Tags\": [\"clean\", \"bright\", \"new_windows\", \"modern_kitchen\"], \"Description\": \"Ухоженная квартира с недавним ремонтом, хорошим естественным светом и обновлёнными элементами.\" }"
}
```

В C# десериализуйте `response` через `JsonSerializer.Deserialize<T>(...)`.

---

## Проблема нативного API на практике

Писать `format` JSON Schema вручную для каждого типа ответа утомительно и чревато ошибками. Пропущенная обёртка `"type"`, опечатка в имени свойства или неправильный уровень вложенности молча приводят к ответу, не совпадающему с вашим C# классом — и вы узнаёте об этом при десериализации, а не в точке вызова.

Вторая проблема — бойлерплейт: каждый вызов требует настройки HTTP-клиента, сериализации JSON, base64-кодирования, обработки ошибок и парсинга ответа. Ни одна из этих задач не является интересным кодом.

---

## Laraue.Ollama.NET: типизированный .NET-адаптер

Пакет [`Laraue.Ollama.NET`](https://github.com/win7user10/Laraue.Ollama.NET) оборачивает нативный API типизированным интерфейсом. JSON Schema генерируется автоматически из вашего C# класса через рефлексию — изменения схемы подхватываются автоматически без правки кода запроса.

> **Примечание:** ранее пакет публиковался как `Laraue.Core.Ollama`. Он был переименован в `Laraue.Ollama.NET` — обновите команду `dotnet add package`/`PackageReference` и using-директивы при обновлении со старой версии.

|          |                                                                       |
|----------|-----------------------------------------------------------------------|
| NuGet    | ![последняя версия](https://img.shields.io/nuget/v/Laraue.Ollama.NET) |
| Загрузки | ![загрузки](https://img.shields.io/nuget/dt/Laraue.Ollama.NET)        |
| GitHub   | [Laraue.Ollama.NET](https://github.com/win7user10/Laraue.Ollama.NET)  |

### Интерфейс

[`IOllamaPredictor`](https://github.com/win7user10/Laraue.Ollama.NET/blob/main/src/Laraue.Ollama.NET/IOllamaPredictor.cs) (пространство имён `Laraue.Ollama.NET`) предоставляет три перегрузки:

```csharp
public interface IOllamaPredictor
{
    // Vision-модель: структурированный вывод + изображение
    Task<TModel> PredictAsync<TModel>(
        string modelName,
        string prompt,
        string base64EncodedImage,
        Dictionary<string, object>? additionalParameters = null,
        CancellationToken ct = default)
        where TModel : class;

    // Текстовая модель: структурированный вывод без изображения
    Task<TModel> PredictAsync<TModel>(
        string modelName,
        string prompt,
        Dictionary<string, object>? additionalParameters = null,
        CancellationToken ct = default)
        where TModel : class;

    // Сырая строка ответа — без схемы и десериализации
    Task<string> PredictAsync(
        string modelName,
        string prompt,
        Dictionary<string, object>? additionalParameters = null,
        CancellationToken ct = default);
}
```

Используйте generic-перегрузки, когда нужен структурированный вывод, разобранный в C# тип. Используйте сырую перегрузку, когда нужен текстовый ответ напрямую — для свободной генерации или когда парсинг реализован самостоятельно. `additionalParameters` добавляет поля на верхний уровень запроса к Ollama, поэтому можно передать то, чего адаптер не моделирует, например `options` или `keep_alive`, не переходя на нативный HTTP API. Параметры модели вроде `temperature` или `top_p` нужно класть внутрь `options`: `new Dictionary<string, object> { ["options"] = new Dictionary<string, object> { ["temperature"] = 0.2 } }`. Сам ключ `temperature` передавать не нужно: адаптер уже записывает этот ключ, и повторное добавление выбросит исключение.

### Установка

```
dotnet add package Laraue.Ollama.NET
```

### Настройка

Зарегистрируйте предиктор в DI-контейнере:

```csharp
services.AddHttpClient<IOllamaPredictor, OllamaPredictor>((serviceProvider, client) =>
{
    client.BaseAddress = new Uri("http://localhost:11434/");
    // Замените на адрес вашего Ollama, если запущен на отдельной машине
});
```

### Определите контракт ответа

Подходит любой C# класс или record. Свойства маппятся в генерируемую JSON Schema:

```csharp
public record PredictionResult
{
    public required double RenovationRating { get; set; }  // → "number"
    public required string[] Tags { get; set; }            // → "array" of "string"
    public required string Description { get; set; }       // → "string"
}
```

Адаптер рефлектирует `PredictionResult` в момент вызова, строит `format` JSON Schema, отправляет запрос и десериализует ответ обратно в `PredictionResult`. Добавление нового свойства в record сразу влияет на следующий запрос — правки схемы вручную не требуется.

### Что содержит сгенерированная схема

Адаптер читает публичные свойства вашего класса и сопоставляет их типы:

| Тип C# | Тип JSON Schema |
|---|---|
| `string`, `DateTime` | `string` |
| `int`, `long`, `float`, `double`, `decimal` | `number` |
| `bool` | `boolean` |
| массивы и списки | `array` (с сопоставленным типом элемента, вложенные классы тоже) |
| остальные классы, словари | `object` с их свойствами |

Есть два ограничения, о которых нужно знать. В сгенерированной схеме нет списка `required`, поэтому модель вправе пропустить свойства, а отсутствующее свойство десериализуется в значение по умолчанию (например, оценка `0`). Прогон на `gemma3:4b` выше показывает, что так бывает на самом деле, поэтому проверяйте результат или вызывайте нативный API со своим `required`. Enum не превращаются в строки; используйте свойство типа `string`.

### Анализ текста

```csharp
var result = await ollamaPredictor.PredictAsync<PredictionResult>(
    modelName: "gemma3:12b",
    prompt: "Классифицируй следующий текст и верни структурированный результат.",
    ct: ct);

Console.WriteLine(result.RenovationRating); // 0.74
Console.WriteLine(string.Join(", ", result.Tags)); // "clean, bright, good_location"
```

### Анализ изображений

```csharp
var imageBytes = File.ReadAllBytes("apartment.jpg");
var base64Image = Convert.ToBase64String(imageBytes);

var result = await ollamaPredictor.PredictAsync<PredictionResult>(
    modelName: "qwen2.5vl:3b",
    prompt: "Оцени качество ремонта, видимое на фотографии квартиры.",
    base64EncodedImage: base64Image,
    ct: ct);
```

---

## Другие варианты для .NET

`Laraue.Ollama.NET` намеренно небольшая. Вот другие распространённые способы вызвать Ollama из .NET:

- **OllamaSharp.** Сообщественный .NET SDK, который указан для .NET в README самого Ollama. Он умеет chat и generate, потоковый вывод, изображения и структурированный вывод и реализует `IChatClient` и `IEmbeddingGenerator` от Microsoft.
- **Microsoft.Extensions.AI.** Абстракция от Microsoft (`IChatClient`), позволяющая менять провайдера. Отдельный пакет `Microsoft.Extensions.AI.Ollama` устарел, и NuGet указывает на OllamaSharp как замену: используйте OllamaSharp как реализацию Ollama за `IChatClient`.
- **Обычный `HttpClient`**, как показано выше, когда нужно один-два вызова и не нужна лишняя зависимость.

Свой адаптер мы написали под одну узкую задачу: структурированный вывод со схемой, сгенерированной из C# класса. Если вам нужны потоковый вывод, история чата или не привязанный к провайдеру интерфейс, берите OllamaSharp.

---

## Выбор модели

- **Для текстовых задач:** `gemma3:12b` и `qwen2.5:7b` — хорошие отправные точки. Больше параметров — лучше рассуждения, меньше — быстрее инференс.
- **Для vision-задач:** `qwen2.5vl:3b` хорошо справляется с анализом изображений при умеренных требованиях к железу. Проверьте поддержку vision на странице модели на [ollama.com/library](https://ollama.com/library) до загрузки.
- **Задержка первого вызова:** Ollama скачивает модель при первом использовании, если она не закэширована локально. Последующие вызовы в пределах стандартного 5-минутного окна простоя загружают модель из памяти и значительно быстрее.
- **Смена модели:** Измените строку параметра `model` — больше ничего в коде менять не нужно. Это главное преимущество Ollama перед хостингом дообученной модели: сравнение моделей без инфраструктурных затрат.

---

## Применение в реальных проектах

[Агрегатор недвижимости](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/OllamaRealEstatePredictor.cs) использует `IOllamaPredictor` с `qwen2.5vl:7b`. Все фото квартиры склеиваются в один коллаж и уходят одним запросом, а модель возвращает оценку ремонта от 0 до 10, флаг `HasNoRenovation` и список положительных и отрицательных особенностей. Особенности хранятся для отладки промптов. [Как работают конвейер и формула ранжирования](building-ai-real-estate-system).
