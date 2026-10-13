---
title: Telegram как хранилище файлов для веб-приложения — загрузка через бота и общая модель вложений
description: Часть 21 цикла о разработке Telegram-таск-трекера в одиночку. Как мы научили веб-приложение загружать картинки в задачи и хранить их в Telegram через бота и свели файлы из бота и из веба к одной модели вложений.
seoTitle: Telegram как хранилище файлов для веб-приложения
seoDescription: Часть 21: файлы из веб-приложения хранятся в Telegram — загрузка через бота в отдельный чат, превью локально, общая модель вложений и проверка загрузок.
type: article
series: architecture-first
part: 21
createdAt: 2026-10-14 14:00
updatedAt: 2026-10-14 14:00
projects: [boards]
tags: [devlog, dotnet, telegram, architecture, task-tracker]
---

> **Architecture First: как в одиночку с ИИ сделать альтернативу Jira** — Часть 21.
> В [предыдущей статье](audit-log-change-history-one-transaction) мы разобрали историю изменений задач. Незадолго до неё в веб-приложении появилась возможность прикреплять к задачам картинки.

## Краткое содержание

Как мы сделали вложения в веб-приложении:

1. Файлы, которые пользователь загружает в веб-приложении, бот отправляет в отдельный чат Telegram. Оригинал остаётся в Telegram, а маленькое превью сохраняется в локальное хранилище.
2. Так мы смогли отложить настройку S3 и пока бесплатно хранить файлы в Telegram, используя тот же путь, что и для медиа из бота.
3. Файлы из бота и из веба теперь описывает одна модель: вложение, файл и ссылка на файл в Telegram.
4. В первой версии можно загружать только JPEG и PNG размером до 3 МБ.
5. В ближайшее время мы перейдём на S3, чтобы не зависеть от правил и инфраструктуры Telegram.

## Откуда взялась идея

В [части 11](telegram-bot-file-storage-stream) мы разбирали, как бот сохраняет фото и видео из сообщений. Файлы при этом не копируются к нам целиком: маленькое превью мы храним в локальном хранилище, а оригинал по запросу стримим прямо из Telegram.

Когда пришло время загружать картинки из веб-приложения, у нас уже был готовый путь для файлов, которые лежат в Telegram. Оставалось сделать так, чтобы файл из браузера тоже оказался в Telegram. Тогда настройку S3 можно отложить, файлы пока бесплатно хранить в Telegram, а показывать их так же, как медиа из бота.

## Как файл из браузера попадает в Telegram

Для загруженных файлов у бота есть отдельный чат, его идентификатор хранится в настройках:

```csharp
public class TelegramOptions
{
    /// <summary>
    /// Telegram bot token.
    /// </summary>
    public required string Token { get; set; }

    /// <summary>
    /// The chat to store uploaded files originals.
    /// </summary>
    public required long FilesChatId { get; set; }
}
```

Чат мы создали вручную: добавили в него бота, сделали его администратором, а потом сами из чата вышли. Теперь в чате остался только бот, и доступ к загруженным файлам есть только у него — у людей, включая нас, его нет.

Когда пользователь прикрепляет картинку к задаче, бэкенд отправляет её в этот чат как обычное фото. Telegram сам сохраняет оригинал и делает несколько уменьшенных копий. Из ответа мы берём самую маленькую копию как превью и самую большую как оригинал:

```csharp
var message = await botClient.SendPhoto(
    options.Value.FilesChatId,
    new InputFileStream(stream, fileName),
    cancellationToken: cancellationToken);

var thumbnailPhoto = message.Photo![0];
var thumbnail = ToFile(thumbnailPhoto, fileName, contentType);

var originalPhoto = message.Photo![3];
var original = ToFile(originalPhoto, fileName, contentType);

// превью сохраняем в локальное хранилище
await DownloadToLocalStorage(thumbnail.FileId, contentType, cancellationToken);

// идентификаторы файлов — в базу
var thumbnailFileId = await UpsertDbFile(thumbnail, cancellationToken);
var originalFileId = await UpsertDbFile(original, cancellationToken);
```

Генерировать превью самим не пришлось: уменьшенные копии делает Telegram. Дальше всё работает так же, как с медиа из бота: превью отдаётся из локального хранилища, а оригинал стримится из Telegram, когда пользователь его открывает.

Если такой файл уже есть в базе (у Telegram для этого есть уникальный идентификатор файла), новая запись не создаётся, а используется существующая.

## Одна модель для файлов из бота и из веба

До этого у медиа из Telegram были свои таблицы: отдельно для фото и для видео из сообщений. Файлы из веба в них не вписывались, поэтому мы переделали модель так, чтобы она не зависела от того, откуда пришёл файл.

**Файл** — это просто файл: имя, размер и MIME-тип. Где он хранится, файл не знает:

```csharp
public class File
{
    public Guid Id { get; set; }

    public long? Size { get; set; }

    [MaxLength(255)]
    public string? Name { get; set; }

    [MaxLength(32)]
    public required string? MimeType { get; set; }

    public TelegramFile? TelegramFile { get; set; }
}
```

Где лежит файл, описывает отдельная таблица. Сейчас это только Telegram:

```csharp
public class TelegramFile
{
    public long Id { get; set; }

    public Guid FileId { get; set; }
    public File? File { get; set; }

    [MaxLength(255)]
    public required string ExternalFileId { get; set; }

    [MaxLength(64)]
    public required string ExternalFileUniqueId { get; set; }
}
```

**Вложение** — то, что видит пользователь: картинка или видео, у которых есть превью и оригинал:

```csharp
public class Attachment
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid OwnerId { get; set; }
    public User? Owner { get; set; }

    public Guid? PreviewFileId { get; set; }
    public File? PreviewFile { get; set; }

    public Guid FileId { get; set; }
    public File? File { get; set; }

    public AttachmentType Type { get; set; }
}
```

Вложение привязывается к задаче через отдельную таблицу `IssueAttachment`. Задача ничего не знает о том, пришла картинка из Telegram-сообщения или из браузера.

Когда мы перейдём на S3, рядом с `TelegramFile` появится таблица для файлов в S3, а модель вложений и всё, что на неё опирается, останется прежней.

## Проверка загрузок

В первой версии мы ограничили загрузки: только JPEG и PNG и не больше 3 МБ на файл. Это не ограничение Telegram, а наш предел для первой итерации. Проверка выполняется в сервисе хоста ещё до того, как файл уходит в Telegram:

```csharp
private static bool FilesHasError(IEnumerable<IFormFile> files, [NotNullWhen(true)] out string? error)
{
    foreach (var file in files)
    {
        if (file.Length > 3_000_000)
        {
            error = "File size is limited to 3MB";
            return true;
        }

        if (!SystemMimeTypes.Supported.Contains(file.ContentType))
        {
            error = $"Supported mime types are: {string.Join(", ", SystemMimeTypes.Supported)}";
            return true;
        }
    }

    error = null;
    return false;
}
```

Файлы приходят в обычном запросе `multipart/form-data` вместе с текстом задачи, поэтому задачу с картинками можно создать или изменить одним запросом.

## Чем рискуем

Хранение файлов в Telegram работает, но мы рассматриваем его как временное. Мы зависим от правил Telegram и его инфраструктуры: если что-то изменится, файлы могут стать недоступны. Пока нагрузка небольшая — в день загружается всего несколько файлов, — и это оправданно. Следующий шаг — перейти на S3 и перенести туда все файлы. Благодаря общей модели вложений для этого понадобится новое место хранения, а не переделка всего, что работает с файлами.

## Итоги

- **Telegram как временное бесплатное хранилище.** Файлы из веб-приложения бот отправляет в отдельный чат, а превью для них делает сам Telegram.
- **Один путь для всех файлов.** Файлы из бота и из веба хранятся и показываются одинаково.
- **Модель не зависит от места хранения.** Файл, место его хранения и вложение — это разные таблицы.
- **Ограничения первой итерации.** Только JPEG и PNG до 3 МБ.
- **Решение временное.** В ближайшее время перейдём на S3 и перенесём туда все файлы.

## Что дальше

Почти одновременно с вложениями у задач появились комментарии, и у них тоже есть вложения. О комментариях — следующая статья.
