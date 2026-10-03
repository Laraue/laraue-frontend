---
title: One card from a Telegram album — handling media groups and edits in a bot, without timeout hacks
description: Part 12 of building a Telegram task tracker solo. Telegram delivers an album as a burst of separate messages and an edit as a fresh update — here is how to turn a media group into a single record without the usual timeout accumulator, and how to treat an edit as an update instead of a duplicate.
seoTitle: Telegram Albums and Edits in a Bot: One Card, No Timeouts
seoDescription: Part 12: turn a Telegram media group into a single record without a timeout accumulator, and treat an edited message as an update, not a duplicate.
type: article
series: architecture-first
part: 12
createdAt: 2026-06-26 15:00
updatedAt: 2026-10-04 15:00
projects: [boards]
tags: [devlog, dotnet, telegram]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 12.
> The [previous article](telegram-bot-file-storage-stream) taught the bot to save single messages with media, but left a few threads open. A message can be edited — which should update the record that was already saved — or it can consist of several media at once, which should be saved into one issue. This article handles both cases.

Until now the save process assumed a message in the chat never changes after the user sends it. Because of that, issues on the board stayed exactly as they were first saved, even after the user edited them in the chat. On top of that, sending a group of images in one message created a separate card for each media element in the group, instead of merging all the media into one issue — a consequence of how Telegram delivers media groups.

In short, what we ended up with:

- an edit is handled by the same code as the first save: the record is looked up by the pair "message id + chat" and either created or updated (`upsert`);
- an album is assembled into one card without a timer: all the messages of the group are linked through a row in the database, and the card is created by the message of the group that reached processing first;
- the bot reports success with a reaction: 👍 for a new record, ❤ for an updated one;
- the bot cannot see a message deleted in the chat, so issues are deleted only in the web version.

## Handling the edited-message update

Start with the simpler case. When someone edits a message they already sent to the chat, the app receives an *edited message* update from Telegram and has to handle it as an `upsert` — `update` if the message was saved before, `insert` if not.

For that, the middleware from the [previous article](telegram-bot-file-storage-stream) ([`HandleAllMessagesMiddleware`](https://github.com/Laraue/Laraue.Apps.Boards/blob/31a490748edc7ad53aaf9a7ef7fe54d4a262e891/src/Laraue.Apps.Boards.TelegramHost/HandleAllMessagesMiddleware.cs)) allows reading two update types:

```csharp
private static readonly UpdateType[] AllowedUpdates =
[
    UpdateType.Message,
    UpdateType.EditedMessage,
];
```

The `Message` object is the same in both update types, so we read it like this:

```csharp
var message = context.Update.Message ?? context.Update.EditedMessage;
```

For the app there is no difference whether a message was edited or saved for the first time — its handling logic was built around `upsert` from the start: save if it was not there, update if it was. The reason is fault tolerance. When the system lags, any message can be processed more than once, and without `upsert` logic that would create phantom records. As a result, an edited photo is still mapped by `GetPhotoRequest`, an edited text by `GetMessageRequest`, and so on. The [middleware](https://github.com/Laraue/Laraue.Apps.Boards/blob/31a490748edc7ad53aaf9a7ef7fe54d4a262e891/src/Laraue.Apps.Boards.TelegramHost/HandleAllMessagesMiddleware.cs) has no branch like "is this an edit or not"; it does the mapping, and the decision of how to handle the record — as new or existing — is delegated to the [save service](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs).

## Implementing upsert for a new or edited message

Messages from Telegram are processed one at a time (why that is guaranteed is explained below, in the media group section), so the create-or-update logic works in terms of a single message. First, the [save service](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs) tries to find an existing record by its external identity — the Telegram message id plus the chat it came from. The pair matters, because a message id can repeat across different chats:

```csharp
var savedMessage = await context.TelegramMessages
    .Where(x => x.ExternalMessageId == request.ExternalMessageId)
    .Where(x => x.ExternalChatId == request.ExternalUserId)
    .Select(x => new
    {
        IssueId = x.Issue != null ? (long?)x.Issue.Id : null,
        x.Id,
    })
    .FirstOrDefaultAsync(cancellationToken);
```

What happens next depends on whether a card already exists for this message. If there is no saved message yet, or it has no issue attached, this is a new object: the save logic runs and a `MainMessageCreated` result is returned to the caller.

```csharp
if (savedMessage?.IssueId is null)
{
    var statusId = await GetStatusIdToSaveMessage(request.UserId, cancellationToken);

    await using var transaction = await context.Database
        .BeginTransactionAsync(cancellationToken);

    // create the TelegramMessage row if it does not exist,
    // then create the issue/card for it
    await coreIssuesService.Create(
        new CreateIssueRequest
        {
            CreatedAt = request.SentAt,
            Text = request.Text,
            TelegramMessageId = messageId,
            StatusId = statusId,
            UserId = request.UserId,
        }, cancellationToken);

    await transaction.CommitAsync(cancellationToken);

    return new GetOrCreateMessageResult
    {
        Result = Result.MainMessageCreated,
        TelegramMessageId = messageId
    };
}
```

If the message is found and has an issue attached, the request is an *edit* of an existing object — an update runs and a `MainMessageUpdated` result is returned:

```csharp
await context.Issues
    .Where(x => x.TelegramMessageId == savedMessage.Id)
    .ExecuteUpdateAsync(upd => upd
        .SetProperty(x => x.Content, request.Text),
        cancellationToken);

return new GetOrCreateMessageResult
{
    Result = Result.MainMessageUpdated,
    TelegramMessageId = savedMessage.Id,
};
```

`GetStatusIdToSaveMessage` resolves the status the new message is saved into; the details of how it is chosen belong to a later stage and are skipped here. The result of handling the message — `MainMessageCreated` or `MainMessageUpdated` — is what the user ends up seeing.

## A reaction instead of a status message

The feedback to the user is minimal: a reaction on their own message. [`TelegramMessageService`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramMessageService.cs) sets the reaction based on the save result:

```csharp
var result = await saveMessageService.Save(request, cancellationToken);

if (result.Result is Result.MainMessageCreated)
    await SetReaction(request, "👍", cancellationToken);
else if (result.Result is Result.MainMessageUpdated)
    await SetReaction(request, "❤", cancellationToken);
```

If a new object was created during handling, a 👍 is set; if an existing one was updated, a ❤. The reasoning behind interacting with the user this way is in [why users kept choosing Saved Messages](telegram-saved-messages-bot-lesson): the bot only confirms that it handled the message, without cluttering the chat with extra messages or buttons.

Setting the reaction is a single Bot API call:

```csharp
private async Task SetReaction(
    SaveMessageTelegramRequest request,
    string? reaction,
    CancellationToken ct)
{
    await client.SetMessageReaction(
        request.ExternalUserId,
        request.ExternalMessageId,
        reaction is not null
            ? [new ReactionTypeEmoji { Emoji = reaction }]
            : [],
        cancellationToken: ct);
}
```

There was one more small idea here: changing the reaction on *every* edit, so repeated edits would change the emoji too. As it stands, it is hard to tell whether a repeat edit was handled — the user always sees a ❤. Telegram currently gives no way to read a message's current reaction set, so doing this would mean storing the current emoji for each message ourselves — and we decided not to overcomplicate the system for such a rare case.

## Handling a Telegram media group

When a user sends several photos at once, Telegram does not send one message with several photos, as many expect. It sends *several separate updates* with the same **media group id**, arriving with no guaranteed order. Telegram leaves it to the app to assemble that group back into one object. The [`SaveGroupMessageEntity`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs) method is responsible for this.

To the user, a group of images is one message, and they expect to see one card with N attachments on the board. The [save service](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs) has a branch to handle the group case separately:

```csharp
private Task<GetOrCreateMessageResult> SaveMessageEntity(
    SaveMessageTelegramRequest request,
    CancellationToken cancellationToken)
{
    return request.MediaGroupId == null
        ? SaveSingleMessageEntity(request, cancellationToken)
        : SaveGroupMessageEntity(request, cancellationToken);
}
```

The common solution for saving groups, the one you find on forums, is a **timer-based implementation**: when a message with a media group id arrives, store it in memory and start (or reset) a timer tied to that group. When the timer expires, consider the group complete and save all the messages belonging to it. This approach has nothing to do with fault tolerance. The state is held in memory, and a server restart can lose part of the data for good.

Our implementation avoids the timer by relying on the database rather than RAM. We do not wait for the album to finish; we link the messages as they arrive. It rests on a few ideas.

First, the media group gets a local [identifier](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Models/TelegramMediaGroup.cs) in the database. All the separate messages of one album are tied to that row through [`GetOrCreateTelegramMediaGroupId`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs):

```csharp
private async Task<long> GetOrCreateTelegramMediaGroupId(string groupId)
{
    var data = await context.TelegramMediaGroups
        .Where(x => x.ExternalId == groupId)
        .Select(x => new { x.Id })
        .FirstOrDefaultAsync(cancellationToken);

    if (data is not null)
        return data.Id;

    var group = new TelegramMediaGroup
    {
        ExternalId = groupId,
    };

    context.Add(group);
    await context.SaveChangesAsync(cancellationToken);

    return group.Id;
}
```

**Only the first message of the group creates the card.** "First" here means the one that reached the database before the others, that is, the one that was processed first, not necessarily the one that was sent first. The later messages of the group find the existing issue and attach their media to it. This does not affect the result: the card text can be taken from any message of the group, as shown below.

And the state lives in the database rather than in an in-memory buffer. If the server restarts in the middle of handling a group, nothing is lost: the parts already processed are saved, and the rest are processed after the restart. The next section explains why.

### Why two parts of an album will not create two cards

The scheme "the first message creates the card, the others join it" would break if two messages of an album were processed at the same time: both would find no card, and each would create its own. That does not happen thanks to the layer under the bot, our library [Laraue.Telegram.NET](https://github.com/Laraue/Laraue.Telegram.NET). Two mechanisms work there.

**An updates queue in the database.** The updates received through long polling are first written to a table and removed from it only after successful handling. If the service stopped in the middle of handling, the update stays in the table and is processed after the start. This is also why `upsert` is required: such an update can arrive again. An update whose handling ended with an exception is moved to a separate table with the error text and the stack trace, and is not retried automatically.

**A queue per chat.** Updates of one chat are handled strictly one at a time, while updates of different chats may run in parallel. It is implemented with a semaphore keyed by the chat id:

```csharp
private readonly KeyedSemaphoreSlim<long> _requestByChatIdSemaphore = new (1);

// Different chat messages can be processes in parallel.
using var requestSemaphore = await _requestByChatIdSemaphore
    .WaitAsync(chatId.Value, cancellationToken)
    .ConfigureAwait(false);
```

Because of that, the parts of one album cannot be handled at the same time: the order they arrive in is undefined, but only one runs at any moment. The first of them creates the card, and the others already see it.

This guarantee has a limit: the semaphore lives in the memory of the process. While the bot runs as a single instance, that is enough. With several instances, a lock at the database level would be needed.

### The non-standard cases

What is left are the non-standard cases — where you have to think carefully about whether to handle them at all, and if so, how. Those spots carry `TODO`s, their implementation deferred until they become real problems. One of the harder cases we did decide to handle: the first message of the group, the one that held the text content, is deleted, and the user adds the text to a different message in the group. The code allows updating the issue's text from any message in the media group, to support cases like this:

```csharp
// The case when first message was deleted and text added to the second
if (request.Text is not null && firstGroupMessageData is not null)
{
    // TODO - here we can detect and remove previous messages. But should we?
    await context.Issues
        .Where(x => x.Id == firstGroupMessageData.CardId)
        .ExecuteUpdateAsync(upd => upd
                .SetProperty(x => x.Content, request.Text),
            cancellationToken);
    // ...
}
```

## Why we do not handle deletions

To start with, Telegram does not deliver an update to the bot when a user deletes a message from their chat. There is simply no event for it, so we cannot know that a message was deleted in the Telegram chat. As a result, we can only delete issues from the web interface, not from the chat.

*Why* does Telegram not send this event at all? We think it is because of the ambiguity. What should happen when a user deletes their entire chat history with the bot? Should a delete arrive for every single message? It is hard to answer that unambiguously.

So we implemented deletion only in the web version of the app — and the chat with the bot serves as a kind of log of the history of interacting with it.

There is a small idea for the future: delete when the user puts a particular emoji on their message. Whether that is convenient is a separate question — a reaction would make deletion possible, but two-way communication with the bot through emoji looks awkward and unintuitive, so for now it stays just an idea.

## Conclusions

The bot now supports all the cases real users ran into: handling text and media, editing them, and handling message groups. The bot still just saves what it was sent and sets a reaction confirming successful handling, which now differs depending on whether it was a save or an edit. With this, the part of the product responsible for the bot's message handling is finished.

> **What changed since then.** The code in the article is shown as of this part. Later the service got save modes (every message, or only on the `/save` command), support for group chats and limits on creating issues, and the single middleware was split in two: for private chats and for group chats. The ideas stayed the same: an `upsert` by the pair "message id + chat" and a media group assembled through the database rather than a timer.

## What comes next

The bot is done, and all further functionality will be built in the web version — the organising mode, managing issues, their attributes. But before any of that, the web version needs authentication. The reason: users did not always find the Mini App convenient for working with boards, and asked for a web version — and to publish it, auth has to be set up first. The next article turns from the Telegram Mini App to the web app — we keep building a product closely tied to Telegram, but now able to work separately from it.