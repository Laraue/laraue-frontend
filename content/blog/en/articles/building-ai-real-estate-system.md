---
title: Building an AI-Powered Real Estate Ranking System with C#, Ollama, and a Custom Crawler
type: article
tags: [dotnet, ai, crawling, real-estate]
projects: [real-estate, crawler]
description: A technical deep-dive into an open-source real estate aggregator for Saint Petersburg — covering the C# / .NET 10 architecture, Ollama vision model integration, custom crawler design, and the ideality scoring formula.
seoTitle: AI Real Estate Ranking with C#, Ollama and a Custom Crawler
seoDescription: How an open-source apartment aggregator ranks listings by renovation quality: .NET 10 architecture, Ollama vision models, a custom crawler and scoring.
createdAt: 2026-04-16
updatedAt: 2026-10-03 18:15
---
**Scraping JavaScript-rendered real estate listings in C#, rating every flat from its photos with a local vision model, and ranking results by renovation quality** sounds like a weekend project until you hit the real problems: anti-bot redirects, GPU-bound inference blocking your crawler, and TensorFlow models that plateau at useless accuracy. This article walks through how [Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate) solves each of these — with real code from the repo.

The application is online at [apartments.laraue.com](https://apartments.laraue.com) with the listings collected so far. We launched the crawler on a local machine from time to time and do not launch it now, so no new listings appear. If you want to understand what it does from a user perspective rather than how it was built, see the [product overview](../projects/real-estate).

---

## Architecture: Five Hosts, One Pipeline

```
CrawlingHost     → crawls the listing sites and stores new listings
GpuWorkerHost    → runs the Ollama image inference jobs
WorkerHost       → computes the ranking fields, marks listings ready, sends Telegram messages, cleans up
ApiHost          → serves the frontend and the API requests
TelegramHost     → the Telegram bot: personal selections and inline navigation
```

All of them share one PostgreSQL database, and a listing moves through it in stages. The crawler stores a listing with the addresses of its photos. `GpuWorkerHost` picks a listing that has no prediction yet and rates it. `WorkerHost` picks the listings that have a prediction but are not ready yet, computes their price and ideality fields, and marks them ready. Only then does `ApiHost` serve them.

The split between `CrawlingHost`, `GpuWorkerHost` and `WorkerHost` is the most important architectural decision. Image inference is GPU-bound and slow: rating the photos of one flat can take several seconds. Running it in the same process as the crawler would mean the crawler stalls waiting for predictions. Separated, each part can run, restart and scale on its own, and the GPU machine does not have to be the one that crawls.

`ApiHost` is standard ASP.NET Core with no interesting architecture, and `TelegramHost` is a bot on top of the same data. The complexity lives in the other three hosts.

---

## The Crawler: PuppeteerSharp + Schema-Based Extraction

Cian (the primary Russian real estate aggregator) renders its listing pages with JavaScript. AngleSharp, which works well for static HTML, can't see the rendered DOM. The crawler uses **PuppeteerSharp** — a headless Chromium wrapper — to navigate pages and extract data after JavaScript execution.

### BaseCrawlingSchemaParser: Retry, Randomization, Anti-Bot

`BaseCrawlingSchemaParser` ([source](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Crawling.AppServices/BaseCrawlingSchemaParser.cs)) handles the browser lifecycle and page navigation:

```csharp
public Task<CrawlingResult> ParseLinkAsync(string link, CancellationToken cancellationToken = default)
{
    return Policy.Handle<PageOpenException>()
        .WaitAndRetryAsync(
            10,
            i => TimeSpan.FromSeconds(i * 100),
            (ex, timeSpan) => _logger.LogError(ex, "The page scheduled to be opened again in {Time}", timeSpan))
        .ExecuteAsync(ct => ParseLinkInternalAsync(link, ct), cancellationToken);
}
```

Three things worth noting:

**Polly retry with a growing delay.** If a page fails to open — network error, bot detection, rate limit — the parser waits `i * 100` seconds (100 s, then 200 s, and so on) and tries again, up to 10 times. This handles transient failures without human intervention.

**Randomized delay between pages.** Before extracting each page, the parser sleeps for a random interval between `MinTimeoutBeforeSwitchToNextPage` and `MaxTimeoutBeforeSwitchToNextPage` (configured per source). This mimics human browsing patterns and reduces the fingerprint that bot-detection systems target.

**Redirect detection as termination signal.** Cian redirects to a different URL when there are no more results to show. The parser detects this and throws `SessionInterruptedException` — the job catches it and stops crawling cleanly:

```csharp
if (result?.Url != link)
{
    throw new SessionInterruptedException($"Redirect to {result?.Url} received. All pages have been parsed.");
}
```

### CianCrawlingSchema: Declarative DOM Extraction

`CianCrawlingSchema` ([source](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Crawling.AppServices/Cian/CianCrawlingSchema.cs)) defines the extraction logic declaratively using the `PuppeterSharpSchemaBuilder` fluent API from the [Laraue.Crawling](https://github.com/win7user10/Laraue.Crawling) library:

```csharp
return new PuppeterSharpSchemaBuilder<CrawlingResult>()
    .HasArrayProperty(x => x.Advertisements, "article", pageBuilder =>
    {
        // Simple CSS selector → property binding
        pageBuilder.HasProperty(
            x => x.ShortDescription,
            "div[data-name=Description]");

        // Selector + transform: extract digits from price string
        pageBuilder.HasProperty(
            x => x.TotalPrice,
            builder => builder
                .UseSelector("span[data-mark=MainPrice]")
                .Map(s => long.Parse(s.GetOnlyDigits())));

        // Manual binding: resolve href, extract listing ID from URL path
        pageBuilder.BindManually(async (e, b) =>
        {
            var linkElement = await e.QuerySelectorAsync("div[data-name=LinkArea] a");
            var href = await linkElement.GetAttributeValueAsync("href");
            if (href is null || !Uri.TryCreate(href, UriKind.Absolute, out var url))
                return;

            b.BindProperty(x => x.Id, url.AbsolutePath.GetIntOrDefault().ToString());
            b.BindProperty(x => x.Link, new Uri(href).LocalPath);
        });

        // Array property: all gallery image src attributes
        pageBuilder.HasArrayProperty(
            x => x.ImageLinks,
            "div[data-name=Gallery] img",
            el => el!.GetAttributeValueAsync("src"));
    })
    .Build()
    .BindingExpression;
```

The schema handles three levels of complexity:

**Simple bindings** — a CSS selector maps directly to a typed property. The library handles null safety and type coercion.

**Mapped bindings** — a selector plus a `.Map()` transform. The price field uses `GetOnlyDigits()` to strip the currency symbol before parsing to `long`.

**Manual bindings** — `BindManually` gives raw access to the `IElementHandle` for cases that don't fit a selector pattern. The metro station block, for example, requires reading two sibling elements and combining them into a `TransportStop` record:

```csharp
pageBuilder.BindManually(async (element, modelBinder) =>
{
    var name = await element
        .QuerySelectorAsync("div[data-name=SpecialGeo] a")
        .AwaitAndModify(x => x.GetInnerTextAsync());

    // "7 минут пешком" or "5 минут на транспорте"
    var title = await subElement.GetInnerTextAsync();
    var titleParts = title?.Split(' ') ?? Array.Empty<string>();

    var minutesToMetro = titleParts[0].GetIntOrDefault();
    var distanceType = titleParts.Last() == "пешком"
        ? DistanceType.Foot
        : DistanceType.Car;

    modelBinder.BindProperty(x => x.TransportStops, new[]
    {
        transportStop with { Minutes = minutesToMetro, DistanceType = distanceType }
    });
});
```

Date parsing is also handled in the schema, converting Cian's Russian-language relative dates ("сегодня", "вчера", "24 сен") into UTC `DateTime` values.

### Early Termination: Delta Crawling

The crawler requests listings sorted by newest first. On each run, `BaseRealEstateCrawlerJob` inserts new records until it encounters a listing ID that already exists in the database — at which point it stops. No need to crawl the full result set: each run processes only the delta since the last run. Combined with the 4-hour schedule, this keeps the database current without excessive requests.

---

## Image Inference: Ollama and a Vision Model

### EstimateImagesRenovationJob

`EstimateImagesRenovationJob` ([source](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.GpuWorkerHost/Jobs/EstimateImagesRenovationJob.cs)) runs in `GpuWorkerHost` on a 1-minute schedule. The job design follows a pattern worth highlighting: the **inner `IRepository` interface** co-locates the data access contract with the job that owns it:

```csharp
public class EstimateImagesRenovationJob(...) : BaseJob
{
    public interface IRepository
    {
        Task<AdvertisementPredictionData?> GetNextUnpredictedAdvertisement(CancellationToken ct);
        Task UpdatePrediction(long id, PredictionResult prediction, CancellationToken ct);
    }

    public class Repository(AdvertisementsDbContext dbContext, ...) : IRepository
    {
        public Task<AdvertisementPredictionData?> GetNextUnpredictedAdvertisement(CancellationToken ct)
        {
            return dbContext.Advertisements
                .Where(x => x.PredictedAt == null)
                .Select(x => new AdvertisementPredictionData
                {
                    Id = x.Id,
                    ImageUrls = x.LinkedImages.Select(y => y.Image.Url).ToArray()
                })
                .FirstOrDefaultAsyncEF(ct);
        }

        public async Task UpdatePrediction(long id, PredictionResult prediction, CancellationToken ct)
        {
            await dbContext.Advertisements
                .Where(x => x.Id == id)
                .ExecuteUpdateAsync(upd => upd
                    .SetProperty(x => x.PredictedAt, dateTimeProvider.UtcNow)
                    .SetProperty(x => x.RenovationRating, prediction.RenovationRating)
                    .SetProperty(x => x.Advantages, prediction.Advantages)
                    .SetProperty(x => x.Problems, prediction.Problems), ct);
        }
    }
}
```

The `IRepository` interface is nested inside the job class. This is intentional: the interface is only meaningful in the context of this job, and nesting it makes that dependency relationship explicit in code rather than just by convention. The `Repository` implementation is also nested, so all three — job, interface, and implementation — live in the same file. Testing the job means mocking one focused interface rather than a broad shared repository.

The execution loop is simple: pull the next unscored listing, run inference, write back the result, repeat until the queue is empty, then sleep for 1 minute:

```csharp
while (!stoppingToken.IsCancellationRequested)
{
    var dataToPredict = await repository.GetNextUnpredictedAdvertisement(stoppingToken);
    if (dataToPredict is null)
        return WaitUntilNextFire; // queue empty, sleep

    var prediction = await imagesPredictor.PredictAsync(dataToPredict.ImageUrls, stoppingToken);
    await repository.UpdatePrediction(dataToPredict.Id, prediction, stoppingToken);
}
```

### RemoteImagesPredictor: one collage, one rating

A flat is rated in one request, not photo by photo. `RemoteImagesPredictor` ([source](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/RemoteImagesPredictor.cs)) downloads all the photos of a listing, skips the ones that fail to load, and merges the rest into **one wide PNG collage** with 2-pixel black lines between the photos (SkiaSharp). The code logs the size of the merged image in MB, because a flat with many photos makes a big file. If no photo could be loaded, the rating is 0.

The collage goes to `OllamaRealEstatePredictor`, which asks a locally hosted vision model (`qwen2.5vl:7b` by default; the repository says it uses about 8 GB of memory, preferably on a GPU) to rate **the whole flat**. The prompt is written as a realtor's task and contains a scale:

| Rating | Meaning in the prompt |
|---|---|
| 10 | Luxury |
| 8–9 | Very good flat, ready to live in |
| 6–7 | Needs non-capital renovation |
| 5 | Above normal: abrasions, cheap or very old materials, but clean enough to live in |
| 3–4 | Needs strong renovation, not ready to live in |
| 1–2 | Damaged, almost without renovation |
| 0 | The interior cannot be determined, or the photos have too few details |

The prompt also asks the model to return `HasNoRenovation = true` when the interior looks like it is being renovated or built, to look at the photos of the house (a panel house is worse than a brick one), and to list 1–10 short features of up to 100 characters, each marked as positive or negative. The answer is JSON:

```csharp
public record OllamaPredictionResult
{
    public bool HasNoRenovation { get; init; }
    public double RenovationRating { get; init; }
    public Feature[] Features { get; init; } = [];
}
```

The service turns it into an integer from 0 to 10: the rating is rounded up, and a listing marked `HasNoRenovation` gets 0:

```csharp
RenovationRating = predictionResult.HasNoRenovation
    ? 0
    : (int)Math.Ceiling(predictionResult.RenovationRating)
```

The positive and negative features become the `Advantages` and `Problems` arrays of the result. They don't feed into the ranking formula; they are stored for prompt tuning and debugging. When a listing gets a surprisingly low or high score, the stored arrays show what the model reacted to without running inference again.

### Why Not a Cloud API

All inference runs on the local machine. No images leave the server, no per-call API costs, and the model can be swapped by changing one configuration value. The `qwen2.5vl:7b` vision model runs at acceptable throughput on consumer GPU hardware for this use case.

### Why Not a Custom-Trained TensorFlow Model

The original implementation (October 2023) used three custom-trained TensorFlow models with ~22M parameters total. It was fast but produced poor results. The fundamental problem wasn't model architecture — it was **data**. Collecting a large, consistently annotated dataset of apartment photos is genuinely hard:

- What counts as "good renovation" is subjective and varies by price bracket
- Photos of the same apartment taken differently score differently
- Labelling hundreds of thousands of photos accurately is impractical without a team

The models plateaued early and never reached accuracy useful for ranking. Switching to Ollama eliminated the dataset problem entirely: the pre-trained vision model already understands what "clean", "bright", "damaged" look like from its training data. The tradeoff is slower inference — offset by isolating it in the dedicated `GpuWorkerHost`.

---

## Ranking: A Price Fine Model

Once a flat has a rating, `UpdateAdvertisementsPredictionJob` in `WorkerHost` takes the listings that have a prediction but are not ready yet, computes their fields with `AdvertisementComputedFieldsCalculator` ([source](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/AdvertisementComputedFieldsCalculator.cs)), and marks them ready for the API.

The idea is to ask what the price per square meter would be if the flat's problems were added to it as fines. The **ideality** is the real price divided by that fined price: close to 1 means there was nothing to fine, and lower means more fines.

```csharp
var squareMeterPredictedPrice = squareMeterPrice + fine * squareMeterPrice;
var ideality = squareMeterPrice / squareMeterPredictedPrice; // that is 1 / (1 + fine)
```

The fine is the sum of three parts:

| Part | Fine |
|---|---|
| Renovation | `1 - rating / 10`: rating 10 gives 0, rating 5 gives 0.5. A rating of 0 (no renovation, or not enough details) gets a flat 0.3 instead of the worst fine |
| Floor | 0.2 for the first and the last floor, otherwise 0 |
| Transport | The best of the nearby stops: 0.01 per minute over a 5-minute walk (a ride counts double), plus 0.1 for each priority level below the best station. 1.0 when there is no stop nearby |

A fine model is easier to reason about and tune than a weighted sum. Each part has an isolated, readable effect: if you want the metro to matter less, change that part, and you don't have to rebalance the others at the same time.

---

## Telegram Integration

The system sends ranked apartment listings to Telegram via `AdvertisementsTelegramSender` ([source](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Telegram.AppServices/AdvertisementsTelegramSender.cs)). There are two delivery modes:

**Personal selections.** Users configure a `Selection` with custom criteria — price range, number of rooms, metro stations, minimum AI score, notification interval. The sender queries the database using those criteria and pushes results on the configured schedule. Pagination is handled via inline keyboard buttons with stateful callback routes, so users can navigate through results inside the same Telegram message thread.

**Public channel.** A scheduled job posts to a public channel with hardcoded filters: listings scored ≥ 7 renovation rating, price 5–9M rubles, updated in the last delivery interval. The message includes a prompt to use the personal bot for custom filtering:

```csharp
messageBuilder.AppendRow($"<i>Индивидуальная настройка подборки объявлений в боте {botUsername}</i>");
```

The sender uses edit-vs-send logic: if a `messageId` is provided, it edits the existing message (for paginated navigation within a session); otherwise it sends a new message (for initial delivery and scheduled notifications).

---

## Source Code

- **Main repo:** [github.com/Laraue/Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate)
- **Crawler library:** [Laraue.Crawling](../projects/crawler) ([GitHub](https://github.com/win7user10/Laraue.Crawling))
- **The app with the collected data:** [apartments.laraue.com](https://apartments.laraue.com)
