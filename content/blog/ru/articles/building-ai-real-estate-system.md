---
title: Парсинг JavaScript-сайтов недвижимости и оценка фото с Ollama на C#
type: article
tags: [dotnet, ai, crawling, real-estate]
projects: [real-estate, crawler]
description: Как построить агрегатор недвижимости на .NET — парсинг через PuppeteerSharp с ранним завершением, интеграция Ollama vision model для оценки фото, штрафная формула ранжирования и уведомления в Telegram. Исходный код на GitHub.
seoTitle: Парсинг сайтов недвижимости и оценка фото с Ollama на C#
seoDescription: Агрегатор недвижимости на .NET: парсинг через PuppeteerSharp, Ollama vision для оценки фото, штрафная формула ранжирования и уведомления в Telegram.
createdAt: 2026-04-16
updatedAt: 2026-10-03 18:15
---
**Парсинг JavaScript-сайтов с объявлениями о недвижимости на C#, оценка квартиры по её фото локальной vision-моделью и ранжирование результатов по качеству ремонта** — звучит как задача на выходные, пока не наткнёшься на реальные проблемы: редиректы для защиты от ботов, GPU-зависимый инференс, блокирующий краулер, и TensorFlow-модели, которые застревают на бесполезной точности. Эта статья разбирает, как [Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate) решает каждую из этих проблем — с реальным кодом из репозитория.

Приложение доступно на [apartments.laraue.com](https://apartments.laraue.com) с собранными на данный момент объявлениями. Краулер мы время от времени запускали на локальной машине, сейчас не запускаем, поэтому новые объявления не появляются. Если вас интересует, что оно делает с точки зрения пользователя, а не как устроено внутри — смотрите [описание продукта](../projects/real-estate).

---

## Архитектура: пять хостов, один конвейер

```
CrawlingHost     → обходит сайты объявлений и сохраняет новые объявления
GpuWorkerHost    → запускает задачи инференса Ollama
WorkerHost       → считает поля для ранжирования, помечает объявления готовыми, шлёт сообщения в Telegram, чистит данные
ApiHost          → отдаёт данные фронтенду и API-запросам
TelegramHost     → Telegram-бот: персональные подборки и навигация inline-кнопками
```

Все они работают с одной базой PostgreSQL, а объявление проходит по ней по стадиям. Краулер сохраняет объявление с адресами его фотографий. `GpuWorkerHost` берёт объявление, у которого ещё нет предсказания, и оценивает его. `WorkerHost` берёт объявления, у которых предсказание есть, а готовности ещё нет, считает для них цену и идеальность и помечает готовыми. Только после этого `ApiHost` их отдаёт.

Самое важное архитектурное решение — разделение `CrawlingHost`, `GpuWorkerHost` и `WorkerHost`. Инференс изображений привязан к GPU и медленный: оценка фотографий одной квартиры может занимать несколько секунд. Если запускать его в процессе краулера, краулер будет простаивать в ожидании предсказаний. Когда части разделены, каждую можно запускать, перезапускать и масштабировать отдельно, а машине с GPU не обязательно быть той, что обходит сайты.

`ApiHost` — обычный ASP.NET Core без интересной архитектуры, а `TelegramHost` — бот поверх тех же данных. Вся сложность сосредоточена в трёх остальных хостах.

---

## Краулер: PuppeteerSharp + извлечение на основе схем

Циан (основной российский агрегатор недвижимости) рендерит страницы объявлений через JavaScript. AngleSharp, хорошо работающий со статическим HTML, не видит отрендеренный DOM. Краулер использует **PuppeteerSharp** — обёртку над headless Chromium — для навигации по страницам и извлечения данных после выполнения JavaScript.

### BaseCrawlingSchemaParser: повторные попытки, рандомизация, защита от блокировок

`BaseCrawlingSchemaParser` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Crawling.AppServices/BaseCrawlingSchemaParser.cs)) управляет жизненным циклом браузера и навигацией по страницам:

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

Три важных момента:

**Повторные попытки Polly с растущей задержкой.** Если страница не открылась — сетевая ошибка, блокировка бота, rate limit — парсер ждёт `i * 100` секунд (100 с, потом 200 с и так далее) и пробует снова, до 10 раз. Так временные сбои обрабатываются без участия человека.

**Случайная задержка между страницами.** Перед извлечением каждой страницы парсер спит случайный интервал между `MinTimeoutBeforeSwitchToNextPage` и `MaxTimeoutBeforeSwitchToNextPage` (настраивается для каждого источника). Это имитирует поведение живого пользователя и снижает fingerprint, на который нацелены системы антибот-защиты.

**Обнаружение редиректа как сигнал завершения.** Циан перенаправляет на другой URL, когда результаты заканчиваются. Парсер обнаруживает это и бросает `SessionInterruptedException` — задача перехватывает его и чисто завершает парсинг:

```csharp
if (result?.Url != link)
{
    throw new SessionInterruptedException($"Redirect to {result?.Url} received. All pages have been parsed.");
}
```

### CianCrawlingSchema: декларативное извлечение DOM

`CianCrawlingSchema` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Crawling.AppServices/Cian/CianCrawlingSchema.cs)) определяет логику извлечения декларативно через fluent API `PuppeterSharpSchemaBuilder` из библиотеки [Laraue.Crawling](https://github.com/win7user10/Laraue.Crawling):

```csharp
return new PuppeterSharpSchemaBuilder<CrawlingResult>()
    .HasArrayProperty(x => x.Advertisements, "article", pageBuilder =>
    {
        // Простой CSS-селектор → привязка свойства
        pageBuilder.HasProperty(
            x => x.ShortDescription,
            "div[data-name=Description]");

        // Селектор + трансформация: извлечение цифр из строки цены
        pageBuilder.HasProperty(
            x => x.TotalPrice,
            builder => builder
                .UseSelector("span[data-mark=MainPrice]")
                .Map(s => long.Parse(s.GetOnlyDigits())));

        // Ручная привязка: разрешение href, извлечение ID объявления из пути URL
        pageBuilder.BindManually(async (e, b) =>
        {
            var linkElement = await e.QuerySelectorAsync("div[data-name=LinkArea] a");
            var href = await linkElement.GetAttributeValueAsync("href");
            if (href is null || !Uri.TryCreate(href, UriKind.Absolute, out var url))
                return;

            b.BindProperty(x => x.Id, url.AbsolutePath.GetIntOrDefault().ToString());
            b.BindProperty(x => x.Link, new Uri(href).LocalPath);
        });

        // Массив свойств: все атрибуты src изображений галереи
        pageBuilder.HasArrayProperty(
            x => x.ImageLinks,
            "div[data-name=Gallery] img",
            el => el!.GetAttributeValueAsync("src"));
    })
    .Build()
    .BindingExpression;
```

Схема обрабатывает три уровня сложности:

**Простые привязки** — CSS-селектор напрямую маппится на типизированное свойство. Библиотека берёт на себя null-безопасность и приведение типов.

**Маппированные привязки** — селектор плюс трансформация `.Map()`. Поле цены использует `GetOnlyDigits()` для удаления символа валюты перед парсингом в `long`.

**Ручные привязки** — `BindManually` даёт прямой доступ к `IElementHandle` для случаев, не укладывающихся в паттерн селектора. Блок со станцией метро, например, требует чтения двух соседних элементов и объединения их в запись `TransportStop`:

```csharp
pageBuilder.BindManually(async (element, modelBinder) =>
{
    var name = await element
        .QuerySelectorAsync("div[data-name=SpecialGeo] a")
        .AwaitAndModify(x => x.GetInnerTextAsync());

    // "7 минут пешком" или "5 минут на транспорте"
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

Парсинг дат также реализован в схеме: русскоязычные относительные даты Циана («сегодня», «вчера», «24 сен») конвертируются в UTC-значения `DateTime`.

### Раннее завершение: инкрементальный краулинг

Краулер запрашивает объявления, отсортированные от новых к старым. На каждом запуске `BaseRealEstateCrawlerJob` вставляет новые записи, пока не встретит ID, уже присутствующий в базе — тогда останавливается. Не нужно обходить весь набор результатов: каждый запуск обрабатывает только дельту с момента последнего. В сочетании с расписанием раз в 4 часа это поддерживает базу актуальной без избыточных запросов.

---

## Инференс изображений: Ollama и vision-модель

### EstimateImagesRenovationJob

`EstimateImagesRenovationJob` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.GpuWorkerHost/Jobs/EstimateImagesRenovationJob.cs)) запускается в `GpuWorkerHost` по расписанию раз в минуту. Дизайн задачи использует паттерн, заслуживающий отдельного внимания: **вложенный интерфейс `IRepository`** размещает контракт доступа к данным рядом с задачей, которой он принадлежит:

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

Интерфейс `IRepository` вложен внутрь класса задачи намеренно: интерфейс имеет смысл только в контексте этой задачи, и вложение делает эту зависимость явной в коде, а не только по соглашению. Реализация `Repository` тоже вложена, так что все три — задача, интерфейс и реализация — живут в одном файле. Тестирование задачи означает мокирование одного сфокусированного интерфейса, а не широкого общего репозитория.

Цикл выполнения прост: взять следующее неоценённое объявление, запустить инференс, записать результат, повторить до опустошения очереди, затем спать минуту:

```csharp
while (!stoppingToken.IsCancellationRequested)
{
    var dataToPredict = await repository.GetNextUnpredictedAdvertisement(stoppingToken);
    if (dataToPredict is null)
        return WaitUntilNextFire; // очередь пуста, спим

    var prediction = await imagesPredictor.PredictAsync(dataToPredict.ImageUrls, stoppingToken);
    await repository.UpdatePrediction(dataToPredict.Id, prediction, stoppingToken);
}
```

### RemoteImagesPredictor: один коллаж, одна оценка

Квартира оценивается одним запросом, а не фото за фото. `RemoteImagesPredictor` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/RemoteImagesPredictor.cs)) скачивает все фотографии объявления, пропускает те, что не загрузились, и склеивает остальные в **один широкий PNG-коллаж** с чёрными линиями в 2 пикселя между фото (SkiaSharp). Код пишет в лог размер получившегося изображения в мегабайтах, потому что у квартиры со множеством фото файл получается большим. Если не загрузилось ни одно фото, оценка равна 0.

Коллаж уходит в `OllamaRealEstatePredictor`, который просит локально размещённую vision-модель (по умолчанию `qwen2.5vl:7b`; по README репозитория она занимает около 8 ГБ памяти, лучше на видеокарте) оценить **квартиру целиком**. Промпт сформулирован как задача для риелтора и содержит шкалу:

| Оценка | Смысл в промпте |
|---|---|
| 10 | Люкс |
| 8–9 | Очень хорошая квартира, готова для жизни |
| 6–7 | Нужен некапитальный ремонт |
| 5 | Выше нормы: потёртости, дешёвые или очень старые материалы, но достаточно чисто, чтобы жить |
| 3–4 | Нужен серьёзный ремонт, жить пока нельзя |
| 1–2 | Квартира повреждена, ремонта почти нет |
| 0 | Интерьер определить нельзя или на фото слишком мало деталей |

Ещё промпт просит вернуть `HasNoRenovation = true`, когда интерьер выглядит так, будто его ремонтируют или строят, посмотреть на фото дома (панельный дом хуже кирпичного) и перечислить от 1 до 10 коротких особенностей длиной до 100 символов, каждая с отметкой «плюс» или «минус». Ответ — JSON:

```csharp
public record OllamaPredictionResult
{
    public bool HasNoRenovation { get; init; }
    public double RenovationRating { get; init; }
    public Feature[] Features { get; init; } = [];
}
```

Сервис превращает его в целое число от 0 до 10: оценка округляется вверх, а объявление с `HasNoRenovation` получает 0:

```csharp
RenovationRating = predictionResult.HasNoRenovation
    ? 0
    : (int)Math.Ceiling(predictionResult.RenovationRating)
```

Положительные и отрицательные особенности становятся массивами `Advantages` и `Problems` результата. В формулу ранжирования они не входят; их хранят для настройки промпта и отладки. Если объявление получило неожиданно низкую или высокую оценку, сохранённые массивы показывают, на что отреагировала модель, без повторного инференса.

### Почему не облачный API

Весь инференс выполняется на локальной машине. Изображения не покидают сервер, нет затрат на API-вызовы, а модель можно заменить изменением одного параметра конфигурации. Vision-модель `qwen2.5vl:7b` показывает приемлемую производительность на потребительском GPU-железе для этой задачи.

### Почему не кастомная TensorFlow-модель

Первоначальная реализация (октябрь 2023) использовала три кастомных TensorFlow-модели с ~22M параметрами суммарно. Они работали быстро, но давали плохие результаты. Фундаментальная проблема была не в архитектуре — а в **данных**. Собрать большой, последовательно размеченный датасет фотографий квартир действительно сложно:

- Понятие «хороший ремонт» субъективно и меняется в зависимости от ценового сегмента
- Фото одной и той же квартиры, снятые по-разному, получают разные оценки
- Размечать сотни тысяч фото точно без команды непрактично

Модели рано достигли плато и так и не вышли на точность, пригодную для ранжирования. Переход на Ollama полностью устранил проблему датасета: предобученная vision-модель уже понимает, как выглядят «чистый», «светлый», «повреждённый» из своих обучающих данных. Компромисс — более медленный инференс, что компенсируется изоляцией в отдельном `GpuWorkerHost`.

---

## Ранжирование: модель штрафов к цене

Когда у квартиры есть оценка, `UpdateAdvertisementsPredictionJob` в `WorkerHost` берёт объявления, у которых есть предсказание, а готовности ещё нет, считает их поля через `AdvertisementComputedFieldsCalculator` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/AdvertisementComputedFieldsCalculator.cs)) и помечает готовыми для API.

Идея в том, чтобы спросить: какой была бы цена квадратного метра, если бы проблемы квартиры добавили к ней штрафами. **Идеальность** — это реальная цена, делённая на цену со штрафами: значение рядом с 1 значит, что штрафовать было не за что, чем ниже, тем больше штрафов.

```csharp
var squareMeterPredictedPrice = squareMeterPrice + fine * squareMeterPrice;
var ideality = squareMeterPrice / squareMeterPredictedPrice; // то есть 1 / (1 + fine)
```

Штраф — сумма трёх частей:

| Часть | Штраф |
|---|---|
| Ремонт | `1 - оценка / 10`: оценка 10 даёт 0, оценка 5 даёт 0,5. Оценка 0 (ремонта нет или деталей мало) получает фиксированные 0,3 вместо наихудшего штрафа |
| Этаж | 0,2 за первый и последний этаж, иначе 0 |
| Транспорт | Лучшая из ближайших остановок: 0,01 за каждую минуту сверх 5 минут пешком (поездка считается вдвое), плюс 0,1 за каждый уровень приоритета станции ниже лучшего. 1,0, если рядом нет остановки |

Штрафная модель проще для понимания и настройки, чем взвешенная сумма. У каждой части свой понятный эффект: если хочется, чтобы метро значило меньше, меняете эту часть и не пересчитываете остальные одновременно.

---

## Интеграция с Telegram

Система отправляет ранжированные объявления в Telegram через `AdvertisementsTelegramSender` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Telegram.AppServices/AdvertisementsTelegramSender.cs)). Есть два режима доставки:

**Персональные подборки.** Пользователи настраивают `Selection` с кастомными критериями — диапазон цен, количество комнат, станции метро, минимальный ИИ-рейтинг, интервал уведомлений. Отправитель запрашивает базу по этим критериям и пушит результаты по настроенному расписанию. Пагинация реализована через inline-кнопки со stateful callback-маршрутами, так что пользователи могут листать результаты внутри одной Telegram-переписки.

**Публичный канал.** По расписанию задача постит в публичный канал с захардкоженными фильтрами: объявления с рейтингом ремонта ≥ 7, ценой 5–9 млн рублей, обновлённые за последний интервал доставки. Сообщение включает предложение использовать персонального бота для кастомной фильтрации:

```csharp
messageBuilder.AppendRow($"<i>Индивидуальная настройка подборки объявлений в боте {botUsername}</i>");
```

Отправитель использует логику edit-vs-send: если передан `messageId`, он редактирует существующее сообщение (для пагинации в рамках сессии); иначе отправляет новое (для первичной доставки и плановых уведомлений).

---

## Исходный код

- **Основной репозиторий:** [github.com/Laraue/Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate)
- **Библиотека краулера:** [Laraue.Crawling](../projects/crawler) ([GitHub](https://github.com/win7user10/Laraue.Crawling))
- **Приложение с собранными данными:** [apartments.laraue.com](https://apartments.laraue.com)
