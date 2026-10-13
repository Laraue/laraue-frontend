---
title: A Telegram bot for group chats in .NET — linking a chat to a board and tasks from messages
description: Part 25 of the series about building a Telegram task tracker in a tiny team. How the Boards bot learned to work in group chats: linking a chat to a board with /link, two message save modes, the admin check, privacy mode and a group turning into a supergroup.
seoTitle: Telegram Group Chat Bot in .NET: Tasks from Messages
seoDescription: Part 25: a Telegram group bot in .NET — linking a chat with /link, inline buttons, message save modes, privacy mode and migration to a supergroup.
type: article
series: architecture-first
part: 25
createdAt: 2026-10-13 12:56
updatedAt: 2026-10-13 12:56
projects: [boards]
tags: [devlog, dotnet, telegram, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative in a Tiny Team, AI-Assisted** — Part 25.
> In the [previous article](jwt-httponly-cookie-aspnet-core) we moved the token into an HttpOnly cookie. Now back to the bot: it learned to work not only in a private chat but in groups too.

## The short version

How the Boards bot learned to work in group chats:

1. A group administrator links the chat to a board with the `/link` command, choosing an organization, a space, a board, a status and a save mode one after another. The bot does not send a new message for each step but updates the same one.
2. There are two save modes: in the first, every message in the chat becomes a task; in the second, only the message someone replied to while mentioning the bot.
3. The private chat with the bot also became a linked chat with its own settings, so any chat, the private one included, is configured the same way.
4. Only a group administrator can link a chat, and they also need the right to link chats in the organization.
5. For the bot to see messages in a group, we turned off its privacy mode.
6. When Telegram turns a group into a supergroup, the chat id changes, and the bot moves the link to the new one.

## Why the bot needs groups

The main reason was our own team chat. We discussed tasks in a Telegram group and wanted any message from the discussion to be turned into a task with a single command right in the chat.

Groups also turned out useful for personal tasks. We ourselves wanted to forward messages to different chats so that they would land on different boards. For that you can create several groups with only yourself and the bot in them and link each one to its own board: for example, one to work notes and another to a shopping list. Then a message forwarded to a group lands on the right board right away.

## The linked chat

Every chat the bot works in is described by one record:

```csharp
public class LinkedTelegramChat
{
    public long Id { get; set; }

    public required long ExternalChatId { get; init; }

    [MaxLength(256)]
    public string? Title { get; set; }

    public long StatusId { get; set; }
    public Status? Status { get; set; }

    public Guid? OwnerId { get; set; }
    public User? Owner { get; set; }

    public DateTime? LinkedAt { get; set; }
    public DateTime? UnlinkedAt { get; set; }

    public SaveMode SaveMode { get; set; }
}
```

A chat is linked to a status, and through it to a board, a space and an organization, the same way a task finds its space through its status and board. New tasks from the chat are created in that status.

How the bot reacts to messages is set by the mode:

```csharp
public enum SaveMode
{
    /// <summary>
    /// Bot will save each message as new card.
    /// Nice for personal chats where each message should become a card.
    /// </summary>
    EachMessage,

    /// <summary>
    /// Bot will save only messages that was replied to the bot with command /save.
    /// </summary>
    BotMentionedMessages,
}
```

In `EachMessage` mode every message becomes a task, which is convenient in the private chat with the bot or in a group a user set up for one board. In `BotMentionedMessages` mode the bot reacts only when it is mentioned: a member replies to the message they need, tags the bot in the reply, and the original message becomes a task. This is the mode for a team chat, where most messages are ordinary conversation.

The user's private chat with the bot also became a `LinkedTelegramChat` record, in `EachMessage` mode. A migration created such records for existing users. We wanted any chat to be configurable, even the private one: choose which board and status tasks land in, and how the bot reacts to messages. As a bonus, the code no longer treats the private chat and a group differently: messages from both are handled the same way.

## The /link command and buttons in one message

Linking takes several steps: organization, space, board, status and save mode. To keep the chat clean, the bot does not send a new message for every step; it edits the same one, changing the text and the inline buttons. Every step has "Back" and "Close" buttons.

A tap on an inline button reaches the bot as a callback query with a data string. We use paths similar to web API routes for it and handle them with controllers, the same way as commands (we covered this approach in [part 5](clean-dotnet-telegram-bot-architecture)):

```csharp
public static class TelegramRoutes
{
    public const string LinkCommand = "/link(.*)";
    public const string UnlinkCommand = "/unlink(.*)";
    public const string SaveCommand = "/save(.*)";
    public const string InfoCommand = "/info(.*)";

    public const string Unlink = "/link/unlink";
    public const string LinkOrganization = "/link/organization/{id}";
    public const string LinkSpace = "/link/space/{id}";
    public const string LinkEpic = "/link/epic/{id}";
    public const string LinkStatus = "/link/status/{id}";
    public const string LinkSaveMode = "/link/save-mode/{statusId}/{mode}";
    public const string BackToLink = "/link/back";
    public const string CloseCallbackWindow = "/close-callback";
}
```

Behind the "Backend" button in the list of spaces is the path `/link/space/42`, and a separate controller method with an `id` parameter handles it. If the chat is already linked, `/link` offers to change the link or unlink the chat, and there is a separate `/unlink` command for quick unlinking.

## Who can link a chat

Only a group's administrator can link it. The bot checks this through the Telegram API:

```csharp
public async Task<bool> IsAdmin(
    ChatId chatId,
    long telegramUserId,
    CancellationToken cancellationToken)
{
    var member = await client.GetChatMember(chatId, telegramUserId, cancellationToken);
    return member.IsAdmin;
}
```

But a Telegram group administrator cannot necessarily create tasks in the organization. So linking also needs a right in Boards: a flag for linking chats was added to the organization's administrative permissions that we described in [part 17](access-control-without-roles-task-tracker-permissions). And when a task is created from a group, the permissions of whoever mentioned the bot are checked: if they cannot create tasks in that space, the task is not created.

## Messages in a group

Commands are handled by their own controllers, and all other messages from groups are picked up by a separate middleware. It runs after the main pipeline and only for groups and supergroups:

```csharp
public async Task InvokeAsync(Func<CancellationToken, Task> next, CancellationToken ct)
{
    await next(ct);

    if (context.GetExecutedRoute() is not null || !AllowedUpdates.Contains(context.Update.Type))
        return;

    var message = context.Update.Message ?? context.Update.EditedMessage;

    // We don't process private or channel messages here.
    if (message?.Chat.Type is not (ChatType.Group or ChatType.Supergroup))
        return;

    await groupChatService.HandleGroupMessage(message, ct);
    context.SetExecutedRoute(new ExecutedRouteInfo(nameof(HandleGroupMessageMiddleware), message.Text));
}
```

From there a message follows the same path as a message from a private chat: the save mode decides whether to create a task. In groups nobody has linked, the bot stays silent so as not to answer every message.

For the bot to receive group messages at all, we turned off its privacy mode in BotFather. With privacy mode on, Telegram sends a bot in a group mostly commands and replies to the bot's own messages. In `EachMessage` mode the bot needs every message, and for a reply with a mention it also needs the message that was replied to.

## A group turns into a supergroup

Telegram can turn a regular group into a supergroup, for example when it gets many members or some settings are enabled. The chat id changes, and a service message with the new id arrives in the old chat.

We ran into this in practice: after such a switch the link kept pointing at the old id, and the bot stopped recognizing the chat. Now the service message is handled, and the link moves to the new id:

```csharp
if (message.MigrateToChatId is { } newChatId)
{
    await chatMigrationService.HandleChatMigrated(message.Chat.Id, newChatId, cancellationToken);
    return;
}
```

```csharp
public Task HandleChatMigrated(long oldChatId, long newChatId, CancellationToken cancellationToken)
{
    return context.LinkedTelegramChats
        .Where(x => x.ExternalChatId == oldChatId)
        .ExecuteUpdateAsync(
            setters => setters.SetProperty(x => x.ExternalChatId, newChatId),
            cancellationToken);
}
```

## Results

- **Groups for teams and for personal boards.** A team chat turns discussion into tasks, and personal groups help sort notes into boards.
- **Two save modes.** Every message, or only the one where the bot was mentioned.
- **Any chat is configured the same way.** The private chat with the bot is also a linked chat with its own board, status and mode.
- **Linking in one message.** The bot edits the message and swaps the buttons, and taps are handled by controllers by path, as in a web API.
- **Two permission checks.** Group administrator in Telegram and the right to link chats in Boards.
- **Privacy mode is off.** Otherwise the bot does not see ordinary messages in a group.
- **Switching to a supergroup does not break the link.** The bot moves it to the new chat id.

## What comes next

The next articles are about how AI came to Boards: summaries of tasks and messages, and retrospectives.
