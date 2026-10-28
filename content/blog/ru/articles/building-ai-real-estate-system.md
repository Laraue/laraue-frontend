---
title: Парсинг JavaScript-сайтов недвижимости и оценка фото с Ollama на C#
type: article
tags: [dotnet, ai, crawling, real-estate]
projects: [real-estate, crawler]
description: Как построить агрегатор недвижимости на .NET — парсинг через PuppeteerSharp с ранним завершением, интеграция Ollama vision model для оценки фото, штрафная формула ранжирования и уведомления в Telegram. Исходный код на GitHub.
seoTitle: Парсинг сайтов недвижимости и оценка фото с Ollama на C#
seoDescription: Агрегатор недвижимости на .NET: парсинг через PuppeteerSharp, Ollama vision для оценки фото, штрафная формула ранжирования и уведомления в Telegram.
createdAt: 2026-04-16
updatedAt: 2026-10-28
---
**Парсинг JavaScript-сайтов с объявлениями о недвижимости на C#, оценка квартиры по её фото локальной vision-моделью и ранжирование результатов по качеству ремонта** — звучит как задача на выходные, пока не наткнёшься на реальные проблемы: редиректы для защиты от ботов, инференс на GPU, который тормозит краулер, и модели TensorFlow, которые так и не выходят на полезную точность. В статье разбираем, как [Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate) решает каждую из них, на реальном коде из репозитория.

Приложение с уже собранными объявлениями доступно на [apartments.laraue.com](https://apartments.laraue.com). Краулер мы время от времени запускали на локальной машине, сейчас не запускаем, поэтому новые объявления не появляются. Если интересно, что оно делает для пользователя, а не как устроено внутри, — см. [описание продукта](../projects/real-estate).

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

Самое важное архитектурное решение — разделение `CrawlingHost`, `GpuWorkerHost` и `WorkerHost`. Инференс изображений идёт на GPU и работает медленно: оценка фотографий одной квартиры может занимать несколько секунд. Если запускать его в процессе краулера, краулер будет простаивать в ожидании предсказаний. Когда части разделены, каждую можно запускать, перезапускать и масштабировать отдельно, а машине с GPU не обязательно быть той, что обходит сайты.

`ApiHost` — обычный ASP.NET Core без интересной архитектуры, а `TelegramHost` — бот поверх тех же данных. Вся сложность сосредоточена в трёх остальных хостах.

---

## Краулер: PuppeteerSharp + извлечение на основе схем

Циан (основной российский агрегатор недвижимости) рендерит страницы объявлений через JavaScript. AngleSharp хорошо работает со статическим HTML, но отрендеренного DOM не видит. Поэтому краулер использует **PuppeteerSharp** — обёртку над headless Chromium: она открывает страницы и достаёт данные уже после выполнения JavaScript.

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

**Повторные попытки Polly с растущей задержкой.** Если страница не открылась — сетевая ошибка, блокировка бота, rate limit — парсер ждёт `i * 100` секунд (100 с, потом 200 с и так далее) и пробует снова, до 10 раз. Так временные сбои проходят без участия человека.

**Случайная задержка между страницами.** Перед каждой страницей парсер ждёт случайное время между `MinTimeoutBeforeSwitchToNextPage` и `MaxTimeoutBeforeSwitchToNextPage` (настраивается для каждого источника). Так он ведёт себя похоже на живого пользователя, и антибот-защите труднее его распознать.

**Обнаружение редиректа как сигнал завершения.** Циан перенаправляет на другой URL, когда результаты заканчиваются. Парсер замечает это и бросает `SessionInterruptedException`, а задача перехватывает исключение и спокойно завершает парсинг:

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

В схеме есть привязки трёх уровней сложности:

**Простые привязки** — CSS-селектор напрямую связан с типизированным свойством. Проверки на null и приведение типов библиотека берёт на себя.

**Привязки с преобразованием** — селектор плюс `.Map()`. Для цены `GetOnlyDigits()` убирает символ валюты, прежде чем значение разбирается в `long`.

**Ручные привязки** — `BindManually` даёт прямой доступ к `IElementHandle`, когда одного селектора мало. Например, для блока со станцией метро нужно прочитать два соседних элемента и собрать из них запись `TransportStop`:

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

Даты тоже разбираются в схеме: относительные даты Циана («сегодня», «вчера», «24 сен») превращаются в значения `DateTime` в UTC.

### Раннее завершение: инкрементальный краулинг

Краулер запрашивает объявления от новых к старым. При каждом запуске `BaseRealEstateCrawlerJob` добавляет новые записи, пока не встретит ID, который уже есть в базе, и на этом останавливается. Обходить всю выдачу не нужно: каждый запуск обрабатывает только то, что появилось с прошлого. С запуском раз в 4 часа база остаётся актуальной без лишних запросов.

---

## Инференс изображений: Ollama и vision-модель

### EstimateImagesRenovationJob

`EstimateImagesRenovationJob` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.GpuWorkerHost/Jobs/EstimateImagesRenovationJob.cs)) запускается в `GpuWorkerHost` раз в минуту. В ней есть приём, о котором стоит рассказать отдельно: **вложенный интерфейс `IRepository`** держит контракт доступа к данным рядом с задачей, которой он нужен:

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

`IRepository` вложен в класс задачи намеренно: смысл у интерфейса есть только в рамках этой задачи, и вложенность делает эту связь явной в коде, а не только по договорённости. Реализация `Repository` тоже вложена, так что задача, интерфейс и реализация лежат в одном файле. Чтобы протестировать задачу, достаточно замокать один небольшой интерфейс, а не большой общий репозиторий.

Цикл простой: взять следующее неоценённое объявление, запустить инференс, записать результат, повторять, пока очередь не опустеет, а потом подождать минуту:

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

Квартира оценивается одним запросом, а не фото за фото. `RemoteImagesPredictor` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/RemoteImagesPredictor.cs)) скачивает все фотографии объявления, пропускает те, что не загрузились, и склеивает остальные в **один широкий PNG-коллаж** с чёрными линиями в 2 пикселя между фото (SkiaSharp). Размер получившегося изображения код пишет в лог в мегабайтах: у квартиры с большим количеством фото файл выходит тяжёлым. Если не загрузилось ни одно фото, оценка равна 0.

Коллаж уходит в `OllamaRealEstatePredictor`, который просит локальную vision-модель (по умолчанию `qwen2.5vl:7b`; по README репозитория она занимает около 8 ГБ памяти, лучше на видеокарте) оценить **квартиру целиком**. Промпт сформулирован как задача для риелтора и содержит шкалу:

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

Положительные и отрицательные особенности становятся массивами `Advantages` и `Problems` результата. В формулу ранжирования они не входят; их хранят для настройки промпта и отладки. Если объявление получило неожиданно низкую или высокую оценку, по сохранённым массивам видно, на что отреагировала модель, и повторять инференс не нужно.

### Почему не облачный API

Весь инференс выполняется на локальной машине. Изображения не покидают сервер, платить за вызовы API не нужно, а модель меняется одним параметром конфигурации. Для этой задачи `qwen2.5vl:7b` работает достаточно быстро на обычной домашней видеокарте.

### Почему не кастомная TensorFlow-модель

В первой версии (октябрь 2023) было три собственные модели TensorFlow, в сумме около 22 млн параметров. Работали они быстро, но результаты давали плохие. Главная проблема была не в архитектуре, а в **данных**: собрать большой и единообразно размеченный датасет фотографий квартир действительно трудно:

- «Хороший ремонт» — понятие субъективное и зависит от ценового сегмента.
- Фото одной и той же квартиры, снятые по-разному, получают разные оценки.
- Точно разметить сотни тысяч фото без команды нереально.

Модели быстро упёрлись в потолок и так и не дошли до точности, достаточной для ранжирования. С переходом на Ollama проблема датасета исчезла: предобученная vision-модель уже знает по своим обучающим данным, как выглядит «чисто», «светло» или «повреждено». Плата за это — более медленный инференс, но его вынесли в отдельный `GpuWorkerHost`.

---

## Ранжирование: модель штрафов к цене

Когда у квартиры есть оценка, `UpdateAdvertisementsPredictionJob` в `WorkerHost` берёт объявления, у которых есть предсказание, а готовности ещё нет, считает их поля через `AdvertisementComputedFieldsCalculator` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Prediction.AppServices/AdvertisementComputedFieldsCalculator.cs)) и помечает готовыми для API.

Идея такая: какой была бы цена квадратного метра, если бы недостатки квартиры добавили к ней в виде штрафов? **Идеальность** — это реальная цена, делённая на цену со штрафами: значение рядом с 1 значит, что штрафовать было не за что, чем ниже, тем больше штрафов.

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

Модель штрафов проще понять и настроить, чем взвешенную сумму. Влияние каждой части понятно: если хочется, чтобы метро значило меньше, меняешь только эту часть, а остальные пересчитывать не нужно.

---

## Интеграция с Telegram

Отранжированные объявления система отправляет в Telegram через `AdvertisementsTelegramSender` ([исходник](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Telegram.AppServices/AdvertisementsTelegramSender.cs)). Есть два режима доставки:

**Персональные подборки.** Пользователь настраивает `Selection` со своими критериями — диапазон цен, количество комнат, станции метро, минимальная оценка ИИ, интервал уведомлений. Отправитель выбирает из базы подходящие объявления и присылает их по заданному расписанию. Страницы листаются inline-кнопками с callback-маршрутами, которые хранят состояние, так что листать результаты можно в одном диалоге.

**Публичный канал.** По расписанию задача публикует в публичном канале объявления по фиксированным фильтрам: объявления с рейтингом ремонта ≥ 7, ценой 5–9 млн рублей, обновлённые за последний интервал доставки. В сообщении есть предложение настроить свои фильтры в персональном боте:

```csharp
messageBuilder.AppendRow($"<i>Индивидуальная настройка подборки объявлений в боте {botUsername}</i>");
```

Отправитель либо редактирует сообщение, либо шлёт новое: если передан `messageId`, он редактирует существующее (при листании страниц), иначе отправляет новое (при первой отправке и плановых уведомлениях).

---

## Исходный код

- **Основной репозиторий:** [github.com/Laraue/Laraue.Apps.RealEstate](https://github.com/Laraue/Laraue.Apps.RealEstate)
- **Библиотека краулера:** [Laraue.Crawling](../projects/crawler) ([GitHub](https://github.com/win7user10/Laraue.Crawling))
- **Приложение с собранными данными:** [apartments.laraue.com](https://apartments.laraue.com)
