---
title: Telegram as file storage for a web app — uploads through a bot and one attachment model
description: Part 21 of the series about building a Telegram task tracker solo. How we let the web app upload images to tasks and store them in Telegram through a bot and brought files from the bot and from the web under one attachment model.
seoTitle: Telegram as File Storage for a Web App
seoDescription: Part 21: files from a web app stored in Telegram — uploads through a bot to a dedicated chat, local previews, one attachment model and upload validation.
type: article
series: architecture-first
part: 21
createdAt: 2026-10-14 14:00
updatedAt: 2026-10-14 14:00
projects: [boards]
tags: [devlog, dotnet, telegram, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 21.
> In the [previous article](audit-log-change-history-one-transaction) we went through the change history of tasks. Shortly before it, the web app got the ability to attach images to tasks.

## The short version

How we built attachments in the web app:

1. Files the user uploads in the web app are sent by the bot to a dedicated Telegram chat. The original stays in Telegram, and a small preview is saved to local storage.
2. This way we do not pay for file storage and reuse the same path as for media from the bot.
3. Files from the bot and from the web are now described by one model: an attachment, a file and a reference to the file in Telegram.
4. In the first version only JPEG and PNG up to 3 MB can be uploaded.
5. We will soon move to S3, so as not to depend on Telegram's rules and infrastructure.

## Where the idea came from

In [part 11](telegram-bot-file-storage-stream) we went through how the bot saves photos and videos from messages. Files are not copied to us in full: we keep a small preview in local storage, and the original is streamed straight from Telegram on request.

When it was time to upload images from the web app, we already had a working path for files that live in Telegram. All that was left was to get a file from the browser into Telegram as well. Then storage costs nothing, and such files can be shown the same way as media from the bot.

## How a file from the browser gets into Telegram

The bot has a dedicated chat for uploaded files, and its id is in the settings:

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

When a user attaches an image to a task, the backend sends it to that chat as a regular photo. Telegram stores the original itself and makes several smaller copies. From the response we take the smallest copy as the preview and the largest as the original:

```csharp
var message = await botClient.SendPhoto(
    options.Value.FilesChatId,
    new InputFileStream(stream, fileName),
    cancellationToken: cancellationToken);

var thumbnailPhoto = message.Photo![0];
var thumbnail = ToFile(thumbnailPhoto, fileName, contentType);

var originalPhoto = message.Photo![3];
var original = ToFile(originalPhoto, fileName, contentType);

// the preview goes to local storage
await DownloadToLocalStorage(thumbnail.FileId, contentType, cancellationToken);

// the file ids go to the database
var thumbnailFileId = await UpsertDbFile(thumbnail, cancellationToken);
var originalFileId = await UpsertDbFile(original, cancellationToken);
```

We did not have to generate previews ourselves: Telegram makes the smaller copies. From there everything works the same as with media from the bot: the preview is served from local storage, and the original is streamed from Telegram when the user opens it.

If the database already has such a file (Telegram provides a unique file id for that), no new record is created and the existing one is used.

## One model for files from the bot and from the web

Before this, media from Telegram had its own tables: separate ones for photos and for videos from messages. Files from the web did not fit them, so we reworked the model so that it does not depend on where a file came from.

A **file** is just a file: a name, a size and a MIME type. A file does not know where it is stored:

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

Where a file lives is described by a separate table. Today that is only Telegram:

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

An **attachment** is what the user sees: an image or a video with a preview and an original:

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

An attachment is linked to a task through a separate `IssueAttachment` table. The task knows nothing about whether an image came from a Telegram message or from a browser.

When we move to S3, a table for files in S3 will appear next to `TelegramFile`, and the attachment model and everything built on it will stay the same.

## Upload validation

In the first version we limited uploads: only JPEG and PNG and no more than 3 MB per file. This is not a Telegram limit but our own limit for the first iteration. The check runs in the host service before the file goes to Telegram:

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

Files arrive in a regular `multipart/form-data` request together with the task text, so a task with images can be created or updated in one request.

## What we risk

Keeping files in someone else's messenger is a temporary solution. We depend on Telegram's rules and infrastructure: if something changes, the files may become unavailable. For now the load is small, only a few files are uploaded a day, and the approach is justified. The next step is to move to S3 and migrate all files there. Thanks to the shared attachment model, that needs a new storage location, not a rework of everything that deals with files.

## Results

- **Telegram as free storage.** The bot sends files from the web app to a dedicated chat, and Telegram makes their previews itself.
- **One path for all files.** Files from the bot and from the web are stored and shown the same way.
- **The model does not depend on the storage location.** The file, where it is stored and the attachment are separate tables.
- **First-iteration limits.** Only JPEG and PNG up to 3 MB.
- **The solution is temporary.** We will soon move to S3 and migrate all files there.

## What comes next

Almost at the same time as attachments, tasks got comments, and they have attachments too. Comments are the subject of the next article.
