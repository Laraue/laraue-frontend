---
title: Сохраняем медиа из Telegram-бота — храним превью, стримим оригинал
description: Часть 11 цикла о разработке Telegram-таск-трекера небольшой командой. Учим бота работать с фото и видео и разбираем, как мы храним файлы: маленькие превью — в локальном хранилище, большие файлы — стримим прямо из Telegram, без буферизации в памяти.
seoTitle: Медиа в Telegram-боте: храним превью, стримим оригинал
seoDescription: Часть 11: фото и видео в боте — маленькие превью в локальном хранилище, большие файлы стримятся из Telegram по запросу через nginx без буферизации.
type: article
series: architecture-first
part: 11
createdAt: 2026-06-26 09:00
updatedAt: 2026-10-28
projects: [boards]
tags: [devlog, dotnet, telegram]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 11.
> [Предыдущая статья](telegram-saved-messages-bot-lesson) закончилась тем, что реальный пользователь сломал нашего бота, отправив ему картинку вместо обычного сообщения. В этой статье мы это исправляем: учим бота сохранять изображения и решаем, как хранить присланные ему файлы.

Предыдущая статья закончилась ошибкой `500` в логах: кто-то попробовал сохранить картинку, а бот, который до этого умел работать только с текстом, не смог обработать запрос. Этот сбой и подсказал нам первую функцию приложения — сохранять не только текст, но и фото и видео. Обработать и сохранить фото, которое присылает Telegram, оказалось ненамного сложнее, чем текстовое сообщение. А вот над тем, как хранить файлы и не занять ими всё место на сервере, пришлось долго думать.

## Процесс сохранения должен быть максимально простым

Изображение должно сохраняться так же, как текст в прошлой статье: пользователь отправляет картинку в чат, бот сохраняет её и ставит реакцию 👍. Для пользователя сохранение медиа ничем не отличается от сохранения текста.

## Маппинг сообщений Telegram в сервисные DTO

Работа с медиа начинается там же, где обрабатываются все остальные сообщения бота, — в [`HandleAllMessagesMiddleware`](https://github.com/Laraue/Laraue.Apps.Boards/blob/31a490748edc7ad53aaf9a7ef7fe54d4a262e891/src/Laraue.Apps.Boards.TelegramHost/HandleAllMessagesMiddleware.cs) из [первой итерации бэкенда](clean-dotnet-telegram-bot-architecture). Теперь он ещё и превращает апдейты Telegram с фото и видео в запросы, которые понимает приложение:

```csharp
SaveMessageTelegramRequest? request = message.Type switch
{
    MessageType.Text => GetMessageRequest(message),
    MessageType.Photo => GetPhotoRequest(message),
    MessageType.Video => GetVideoRequest(message),
    MessageType.Animation => GetAnimationRequest(message),
    _ => null
};

if (request is not null)
{
    await telegramMessageService.HandleSaveMessage(request, ct);
    context.SetExecutedRoute(
        new ExecutedRouteInfo("HandleAllMessagesMiddleware", text));
}
else
{
    await botClient.SendMessage(
        context.Update.GetUserId(),
        string.Format(Phrases.MessageTypeIsNotAvailable, message.Type),
        cancellationToken: ct);
}
```

Именно здесь исправлен сбой, описанный в начале. Мы не стали обрабатывать все возможные типы апдейтов Telegram, а научили бота сообщать о *неподдерживаемом* сообщении. Если для апдейта нет маппинга (`_ => null`), бот больше не пишет в лог ошибку `500`, а отвечает пользователю, что такой тип сообщения не поддерживается. Надёжная обработка ввода — это не обязательно поддержка всех случаев, а аккуратная обработка непредусмотренных. Изображения приложение теперь поддерживает, но понятный ответ на неподдерживаемый формат — возможно, даже более важное изменение.

Здесь же принято архитектурное решение: **приложение определяет собственный набор типов медиа и переводит в них апдейты Telegram, а не повторяет контракты Telegram.** У Telegram разные типы апдейтов для видео и *анимации* (GIF) — это разные сообщения с разными полями. Приложению такое деление ни к чему: с анимацией мы работаем так же, как с видео. Поэтому и `GetAnimationRequest`, и `GetVideoRequest` превращаются в один и тот же `SaveVideoMessageTelegramRequest`. В слое маппинга сообщения Telegram разных типов переводятся в типы приложения, и на уровне сервисов GIF и MP4 — уже не разные типы, а просто видеофайл. Определять собственные контракты, а не пускать контракты внешнего API по всей системе, — важная привычка. Так контракты интеграции и сервисов чётко разделены, и при изменении внешнего API правок получается минимум.

Middleware передаёт готовый запрос в `HandleSaveMessage` сервиса [обработки Telegram-запросов](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramMessageService.cs). Тот сохраняет объект через метод `Save` отдельного сервиса [сохранения Telegram-запросов](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs) и сообщает о результате реакцией 👍 на сообщение. Эта реакция и есть подтверждение сохранения — никаких текстовых ответов, длинных диалогов или кнопок. Разделение на обработку и сохранение отделяет слой данных от интеграции с Telegram: слой данных сохраняет и возвращает результат, а слой, работающий с Telegram, сообщает о нём пользователю.

## Архитектурное решение: хранить копию медиафайла или ссылку на него?

Теперь о решении, на котором построена статья. Когда бот получает фото или видео, хранить их можно двумя способами.

**Хранить копию.** Скачать файл из Telegram целиком и положить в хранилище. Сделать это просто, но может выйти дорого: каждый файл занимает место на диске VPS, данных постоянно становится больше, а видео может весить сотни мегабайт. Держать такое на бюджетном сервере, где оно почти всё время лежит без дела, неоправданно.

**Хранить ссылку.** Отправленные боту файлы и так лежат в Telegram, значит, их можно загружать оттуда в тот момент, когда они понадобились. Но у Telegram есть лимиты, и бесконечно грузить файлы не получится.

В сервисе сохранения мы даже нашли комментарий разработчика, который хорошо подытоживает эту статью:

> Мы не можем постоянно ходить в Telegram — открытие доски с большим количеством медиа упрётся в лимиты. И не можем хранить все файлы — они занимают слишком много места.

В итоге мы выбрали нечто среднее: **скачиваем маленькие превью, а для оригиналов храним ссылки.** Работает это так: для изображения Telegram даёт ссылки на несколько файлов в разных разрешениях. Мы сохраняем в базу две записи [`TelegramFile`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Models/TelegramFile.cs) — ссылки на полноразмерный файл и на миниатюру. Миниатюру при этом сразу скачиваем в локальное хранилище. С видео то же самое: Telegram присылает ссылки на миниатюру и на сам файл, и мы сохраняем их так же, как для фото.

Реализацию сохранения можно посмотреть в методе `GetOrCreateMessageFileId`:

```csharp
/// <param name="saveFileToStorage">
/// Store the file directly to storage.
/// If false - then when requesting the file it will be requested directly from TG.
/// We can't request always from tg - static content will make too many calls.
/// And we can't store content always - it takes too much space.
/// </param>
private async Task<Guid> GetOrCreateMessageFileId(
    File file,
    bool saveFileToStorage,
    CancellationToken cancellationToken)
{
    var oldFileData = await context.TelegramFiles
        .Where(x => x.FileUniqueId == file.FileUniqueId)
        .Select(x => new { x.Id })
        .FirstOrDefaultAsync(cancellationToken);

    if (oldFileData is not null)
        return oldFileData.Id;

    if (saveFileToStorage)
    {
        var botFile = await botClient.GetFile(file.FileId, cancellationToken);

        var stream = new MemoryStream();
        await botClient.DownloadFile(botFile, stream, cancellationToken);

        var extension = ExtensionUtility.GetExtension(file.MimeType);
        var filePath = ShardedPathStrategy.GetPath(botFile.FileUniqueId, extension);

        stream.Position = 0;
        await fileStorage.WriteFile(filePath, stream, null, cancellationToken);
    }

    var telegramFile = new TelegramFile
    {
        FileId = file.FileId,
        FileUniqueId = file.FileUniqueId,
        Name = file.FileName,
        Size = file.FileSize,
        MimeType = file.MimeType,
    };

    context.Add(telegramFile);
    await context.SaveChangesAsync(cancellationToken);
    return telegramFile.Id;
}
```
Запись в локальное хранилище и чтение из него идут через абстракцию [`IFileStorage`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.Services/FileStorage.cs). У её настроек `FileStorageOptions` всего одно свойство — корневая папка для файлов:

```csharp
public interface IFileStorage
{
    Task<bool> FileExists(string path, CancellationToken cancellationToken = default);
    Task<FileStream> ReadFile(string path, CancellationToken cancellationToken = default);
    Task WriteFile(
        string path,
        Stream content,
        IDictionary<string, string>? metadata = null,
        CancellationToken cancellationToken = default);
}

public class FileStorageOptions
{
    public required string FilesDirectory { get; set; }
}
```

Реализация — тонкая обёртка над локальным диском: путь файла соединяется с `FilesDirectory`, и получается его физическое расположение; `WriteFile` при необходимости создаёт папку и копирует входящий стрим в файл (через `CopyToAsync`, чтобы не буферизовать его целиком), а `ReadFile` открывает файл как стрим. Сам интерфейс к локальному диску не привязан: если мы переедем в объектное хранилище вроде S3, поменяется только этот класс. А пока файлы лежат там, где для нас дешевле всего, — в файловой системе арендованного VPS.

Отдельно стоит сказать о модели [`TelegramFile`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Models/TelegramFile.cs), в которой хранятся ссылки на файлы в Telegram:
```csharp
public class TelegramFile
{
    public Guid Id { get; set; }

    [MaxLength(255)]
    public required string FileId { get; set; }
    
    [MaxLength(64)]
    public required string FileUniqueId { get; set; }
    
    public long? Size { get; set; }

    [MaxLength(255)]
    public string? Name { get; set; }
    
    [MaxLength(32)]
    public required string? MimeType { get; set; }
}
```

По `FileId` содержимое файла можно запросить у Telegram, а `FileUniqueId` нужен для дедупликации, чтобы одинаковые файлы хранились локально только один раз. Если переслать боту одну и ту же картинку несколько раз, её миниатюра сохранится в локальное хранилище под именем `FileUniqueId` только в первый раз. Остальная система ссылается на файлы по их `Guid`, а не по идентификаторам Telegram.

## Как отображаются сохраненные из Telegram медиафайлы

Как уже говорилось, превью и оригиналы хранятся и читаются по-разному, потому что и используются они по-разному.

**При загрузке доски** может понадобиться много превью изображений и видео. Если бы за каждым приходилось ходить в Telegram, мы бы упёрлись в ограничения API или просто получили медленную загрузку. Но миниатюры сохранены локально, поэтому читаются прямо из нашего хранилища — быстро и без внешних вызовов.

У каждой карточки issue, которую бэкенд возвращает фронтенду, есть набор ссылок на медиа:

```csharp
public record IssueListDto : ICanContainMedia
{
    // ...
    public List<MediaInfo> Media { get; set; } = [];
}

public class MediaInfo
{
    public Guid? PreviewFileId { get; set; }
    public Guid? OriginalFileId { get; set; }
    public MediaType Type { get; set; }
}

public enum MediaType
{
    Photo,
    Video,
}
```

В каждом `MediaInfo` две ссылки — `PreviewFileId` и `OriginalFileId`, обе указывают на строки `TelegramFile` по их `Guid`. По ссылкам на превью фронтенд показывает миниатюры на доске кодом вида `<img :src = BackendHost + '/api/telegram-files/' + PreviewFileId>` (бэкенд отдаёт стрим файла с локального диска в методе [`GetFileById`](https://github.com/Laraue/Laraue.Apps.Boards/blob/0d76cbe8ec0ec310d879c8225869f20c97380314/src/Laraue.Apps.Boards.WebApiHost/Controllers/TelegramFilesController.cs)). Если пользователь нажмёт на превью, бэкенд отдаст стрим оригинала, полученный через Telegram API, а фронтенд покажет его (или воспроизведёт, если это видео) в компоненте просмотра медиа.

Заметим, что список `Media` у `IssueListDto` не запрашивается из БД вместе с issues: медиа *добавляются* к уже полученным issues отдельно. Это сделано намеренно. Псевдокод из [исходного](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiServices/IssuesService.cs) файла:
```csharp
var issues = await GetIssues(request);
await EnrichMedia(issues);
```

Так в запросе issues меньше join'ов, а данные о файлах загружаются из БД отдельным методом. На принципе «лучше несколько простых запросов, чем один сложный» построен весь наш бэкенд: его масштабировать гораздо проще и дешевле, чем БД.

**Оригинал открывается** по нажатию на превью фото или видео. Фронтенд, как и для миниатюр, вызывает метод бэкенда [`GetFileById`](https://github.com/Laraue/Laraue.Apps.Boards/blob/0d76cbe8ec0ec310d879c8225869f20c97380314/src/Laraue.Apps.Boards.WebApiHost/Controllers/TelegramFilesController.cs), передаёт `OriginalFileId` и получает стрим с файлом. Только оригинала на диске нет, и бэкенд запрашивает его у Telegram.

Тут важны лимиты методов Bot API `GetFile`/`DownloadFile`, через которые выше *сохранялись* миниатюры: `DownloadFile` скачивает файлы не больше 20 МБ. Чтобы большие файлы не упирались в это ограничение, контроллер берёт содержимое по **прямому URL файла** в Telegram — `https://api.telegram.org/file/bot{botToken}/{filePath}`. Этот адрес ведёт в файловое хранилище Telegram, и такого ограничения у него нет.

## Возвращаем стрим оригинала файла из Telegram, не буферизируя его в памяти

Отдавать пользователю большие видео из Telegram — это ещё одна проблема: сервер не может загружать весь файл в память перед отправкой. Если несколько пользователей одновременно откроют видео по несколько сотен мегабайт, память на VPS закончится и сервер начнёт падать с `OutOfMemoryException`. Не говоря уже о том, что видео начнёт играть только после того, как скачается целиком. Правильное решение — *стриминг*: байты видео идут из Telegram через бэкенд к клиенту, и сервер никогда не держит файл целиком.

Для стриминга нужно поправить конфигурацию nginx в блоке `location`, который обслуживает маршрут файлов:

```nginx
location ^~ /api/notes-board/telegram-files {
    set $upstream http://structuredmessageswebapihost:5007;
    rewrite ^/api/notes-board/(.*)$ /api/$1 break;
    proxy_pass              $upstream;
    proxy_buffering         off;
    proxy_cache             off;
    proxy_set_header        Range $http_range;
    proxy_set_header        If-Range $http_if_range;
    proxy_pass_header       Content-Range;
    proxy_pass_header       Accept-Ranges;
    gzip                    off;
    proxy_read_timeout      10m;
    proxy_send_timeout      10m;
    proxy_next_upstream error timeout http_502 http_503 http_504;
    proxy_next_upstream_tries 5;
    proxy_next_upstream_timeout 30s;
}
```

Для стриминга здесь важны несколько строк. `proxy_buffering off` запрещает nginx копить ответ апстрима перед отправкой: байты уходят по мере поступления, и файл целиком в памяти nginx не оказывается. Заголовки `Range` и `If-Range` передаются в апстрим, а `Content-Range` и `Accept-Ranges` возвращаются обратно — благодаря этому работают **range-запросы**. Видеоплеер может запросить только ту часть файла, которая нужна для начала воспроизведения, или кусок из середины, не скачивая всё, что перед ним. Поэтому видео начинает играть почти сразу и подгружается по мере надобности, а не скачивается целиком. Большие `proxy_read_timeout` и `proxy_send_timeout` не дают длинной передаче оборваться на полпути, а `gzip off` избавляет nginx от попыток сжать и без того сжатое медиа.

Чтобы nginx мог передать range-заголовки, бэкенд должен их отдавать. [`TelegramFilesController`](https://github.com/Laraue/Laraue.Apps.Boards/blob/0d76cbe8ec0ec310d879c8225869f20c97380314/src/Laraue.Apps.Boards.WebApiHost/Controllers/TelegramFilesController.cs) сам диапазоны не обрабатывает: он передаёт заголовок `Range` браузера в Telegram, а ответ Telegram возвращает как есть, вместе со статус-кодом и заголовками диапазона байтов:

```csharp
Response.StatusCode = (int)telegramResponse.StatusCode;
Response.Headers.Append("Accept-Ranges", "bytes");

// Content-Length comes from content headers
if (telegramResponse.Content.Headers.ContentLength is { } contentLength)
    Response.Headers.ContentLength = contentLength;

// Content-Range is also a content header on 206 responses
if (telegramResponse.Content.Headers.ContentRange is { } contentRange)
    Response.Headers.Append("Content-Range", contentRange.ToString());

var stream = await telegramResponse.Content.ReadAsStreamAsync(cancellationToken);

// enableRangeProcessing: false — we've already handled the range manually
// by forwarding it to Telegram. ASP.NET Core must not try to slice again.
return File(stream, mimeType, enableRangeProcessing: false);
```

Здесь важны две детали. Первая: когда браузер запрашивает диапазон, Telegram отвечает `206 Partial Content` с заголовком `Content-Range`, где указано, какой кусок он отдал, и контроллер передаёт и то и другое без изменений. Браузер получает ровно тот статус-код и тот диапазон, которые вернул Telegram. Вторая, на которой легко ошибиться: `File(stream, mimeType, enableRangeProcessing: false)`. `File` в ASP.NET Core умеет сам обрабатывать диапазоны, но здесь этого делать *нельзя*: диапазон уже обработал Telegram, и обратно приходит нужный кусок. Если оставить обработку включённой, ASP.NET Core попытается нарезать уже нарезанный стрим и испортит ответ. Выключив её, мы просим фреймворк отдать байты как есть. Контроллер только передаёт ответ дальше, а не обрабатывает диапазоны второй раз. И поскольку он читает ответ Telegram как стрим и сразу его возвращает, на бэкенде файл тоже ни разу не буферизуется целиком.

В итоге большой оригинал проходит через всю цепочку — Telegram, бэкенд, nginx, браузер — и ни одно звено не держит его в памяти целиком. Превью сделали дешёвой загрузку доски, а стриминг — отдачу оригиналов, даже больших.

## Как фронтенд использует ссылки на превью и оригинал для отображения медиа

Фронтенд одинаково работает с `previewFileId` и `originalFileId`: для него это просто идентификаторы файлов, по которым можно получить ссылки. Для этого есть [`getImageUrl(guid)`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/composables/utils.ts), который возвращает ссылку на загрузку файла через [`TelegramFilesController`](https://github.com/Laraue/Laraue.Apps.Boards/blob/0d76cbe8ec0ec310d879c8225869f20c97380314/src/Laraue.Apps.Boards.WebApiHost/Controllers/TelegramFilesController.cs). Фронтенд не знает, лежит ли файл на сервере или будет загружен из Telegram: он запрашивает файл по `Guid`, а остальное — забота бэкенда.

В карточке на доске используются только превью. Компонент [`LnbCard`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/components/LnbCard.vue) показывает медиа каждого issue набором миниатюр: не больше четырёх, а если их больше — добавляет «+N». `src` каждой миниатюры — `getImageUrl(mediaInfo.previewFileId)`. Поверх превью видео рисуется иконка play. В итоге доска, полная карточек с медиа, отрисовывается без единого запроса к Telegram: все миниатюры лежат локально.

Клик по миниатюре вызывает `openMedia(media, index)` из общего стейта. Метод сохраняет в стейт список медиа и индекс открываемого элемента, а [`LnbMediaViewer`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/pages/organizations/%5BorgKey%5D.vue) показывает открытый элемент. Оригинал загружается по `originalFileId`: элементы image и video запрашивают его через `src`. У video есть ещё несколько атрибутов: `controls`, `playsinline`, `poster` с `previewFileId`, чтобы показывать миниатюру, пока видео грузится, и `preload="metadata"`, чтобы браузер скачивал только то, что нужно для начала воспроизведения. Когда `<video>` начинает играть, запускается описанный выше стриминг.

## Работа с файлами локального storage из контейнеров приложений

Чтобы приложения в контейнерах видели папку сервера, которая не зависит от контейнеров, нужно настроить volume в `docker-compose.yaml` из [статьи про деплой](deploying-dotnet-postgres-vps-docker-compose). Файлы будут лежать в папке `/home/laraue/storage` на VPS, и удаление контейнеров их не затронет.

В секции nginx файла `docker-compose.yaml` подключаем папку `storage` сервера:

```yaml
nginx:
  volumes:
    - storage:/home/laraue/storage
```

В том же файле задаём переменную окружения `FilesDirectory` для `FileStorageOptions`, показанного выше:

```yaml
structuredmessageswebapihost:
  environment:
    FileStorageOptions__FilesDirectory: "/home/storage/note-board"
```

Теперь все файлы, которые сохраняет приложение, попадают в папку `/home/laraue/storage` на сервере.

## Итоги

Сбоя из начала статьи больше нет. Пока мы его чинили, бот научился обрабатывать фото, видео и GIF так же просто, как текст. Ради этого внешне небольшого изменения пришлось продумать много деталей. Маленькие превью хранятся локально, чтобы доска с картинками быстро грузилась с нашего диска. Оригиналы остаются на серверах Telegram и стримятся по запросу, так что на хранении больших файлов мы экономим. А стриминг с range-запросами не даёт файлам оседать в памяти сервера.

## Что дальше

В логике сохранения остался открытый вопрос: что происходит, когда кто-то *редактирует* уже отправленное сообщение? Вообще-то код это уже учитывает. Но история о том, как обновляется сохранённое сообщение и какие сложности Telegram добавляет с отредактированными и сгруппированными сообщениями, тянет на отдельную статью. О ней и пойдёт речь дальше.