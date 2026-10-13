---
title: Telegram-бот для групповых чатов на .NET — привязка чата к доске и задачи из сообщений
description: Часть 25 цикла о разработке Telegram-таск-трекера небольшой командой. Как бот Boards научился работать в групповых чатах: привязка чата к доске командой /link, два режима сохранения сообщений, проверка администратора, privacy mode и переход группы в супергруппу.
seoTitle: Telegram-бот для групповых чатов на .NET: задачи из чата
seoDescription: Часть 25: Telegram-бот для группы на .NET — привязка чата командой /link, inline-кнопки, режимы сохранения сообщений, privacy mode и миграция в супергруппу.
type: article
series: architecture-first
part: 25
createdAt: 2026-10-13 12:56
updatedAt: 2026-10-13 12:56
projects: [boards]
tags: [devlog, dotnet, telegram, architecture, task-tracker]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 25.
> В [предыдущей статье](jwt-httponly-cookie-aspnet-core) мы перенесли токен в HttpOnly-cookie. Теперь вернёмся к боту: он научился работать не только в личном чате, но и в группах.

## Краткое содержание

Как бот Boards научился работать в групповых чатах:

1. Администратор группы привязывает чат к доске командой `/link`, последовательно выбирая организацию, спейс, доску, статус и режим сохранения. Бот не присылает новое сообщение на каждый шаг, а обновляет одно и то же.
2. Есть два режима сохранения: в первом задачей становится каждое сообщение чата, во втором — только сообщение, на которое ответили с упоминанием бота.
3. Личный чат с ботом тоже стал привязанным чатом со своими настройками, поэтому любой чат, включая личный, настраивается одинаково.
4. Привязать чат может только администратор группы, и ему нужно право на привязку чатов в организации.
5. Чтобы бот видел сообщения в группе, мы отключили ему privacy mode.
6. Когда Telegram превращает группу в супергруппу, у чата меняется идентификатор, и бот переносит привязку на новый.

## Зачем боту группы

Главной причиной был наш собственный командный чат. Мы обсуждали задачи в Telegram-группе и хотели, чтобы любое сообщение из обсуждения можно было превратить в задачу одной командой прямо в чате.

Группы пригодились и для личных задач. Нам самим хотелось пересылать сообщения в разные чаты так, чтобы они попадали на разные доски. Для этого можно создать несколько групп, в которых есть только пользователь и бот, и привязать каждую к своей доске: например, одну — к рабочим заметкам, другую — к списку покупок. Тогда сообщение, пересланное в группу, сразу оказывается на нужной доске.

## Привязанный чат

Каждый чат, в котором работает бот, описывает одна запись:

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

Чат привязан к статусу, а через него — к доске, спейсу и организации, так же как задача находит свой спейс через статус и доску. Новые задачи из чата создаются в этом статусе.

Как бот реагирует на сообщения, определяет режим:

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

В режиме `EachMessage` задачей становится каждое сообщение — так удобно в личном чате с ботом или в группе, которую пользователь завёл для одной доски. В режиме `BotMentionedMessages` бот реагирует, только когда его упоминают: участник отвечает на нужное сообщение с упоминанием бота, и задачей становится сообщение, на которое ответили. Это режим для командного чата, где большинство сообщений — обычный разговор.

Личный чат пользователя с ботом тоже стал записью `LinkedTelegramChat` в режиме `EachMessage`. Для существующих пользователей такие записи создала миграция. Мы хотели, чтобы любой чат можно было настроить — даже личный: выбрать, на какую доску и в какой статус падают задачи, и как бот реагирует на сообщения. А в коде у личного чата и у группы теперь один путь.

## Команда /link и кнопки в одном сообщении

Привязка проходит в несколько шагов: организация, спейс, доска, статус и режим сохранения. Чтобы не засорять чат, бот не отправляет новое сообщение на каждый шаг, а редактирует одно и то же, меняя текст и inline-кнопки. На каждом шаге есть кнопки «Назад» и «Закрыть».

Нажатие на inline-кнопку приходит в бот как callback-запрос со строкой данных. Мы используем для неё пути, похожие на маршруты веб-API, и обрабатываем их контроллерами — так же, как команды (этот подход мы разбирали в [части 5](clean-dotnet-telegram-bot-architecture)):

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

За кнопкой «Backend» в списке спейсов стоит путь `/link/space/42`, и его обрабатывает отдельный метод контроллера с параметром `id`. Если чат уже привязан, `/link` предлагает изменить привязку или отвязать чат, а для быстрой отвязки есть отдельная команда `/unlink`.

## Кто может привязать чат

Привязать группу может только её администратор. Бот проверяет это через Telegram API:

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

Но администратор Telegram-группы не обязательно может создавать задачи в организации. Поэтому для привязки нужно ещё и право в Boards: в административные права организации, о которых мы писали в [части 17](access-control-without-roles-task-tracker-permissions), добавился флаг для привязки чатов. А при создании задачи из группы проверяются права того, кто упомянул бота: если он не может создавать задачи в этом спейсе, задача не создастся.

## Сообщения в группе

Команды обрабатываются своими контроллерами, а все остальные сообщения из групп забирает отдельный middleware. Он работает после основного конвейера и только для групп и супергрупп:

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

Дальше сообщение идёт по тому же пути, что и сообщение из личного чата: режим сохранения решает, создавать ли задачу. В группах, которые никто не привязал, бот молчит, чтобы не отвечать на каждое сообщение.

Чтобы бот вообще получал сообщения из групп, мы отключили ему privacy mode в BotFather. С включённым privacy mode Telegram присылает боту в группе в основном команды и ответы на его собственные сообщения. В режиме `EachMessage` боту нужны все сообщения, а для ответа с упоминанием — ещё и сообщение, на которое ответили.

## Группа превращается в супергруппу

Telegram может превратить обычную группу в супергруппу — например, когда в ней становится много участников или включаются некоторые настройки. При этом у чата меняется идентификатор, а в старый чат приходит служебное сообщение с новым идентификатором.

Мы столкнулись с этим на практике: после такого перехода привязка продолжала указывать на старый идентификатор, и бот переставал узнавать чат. Теперь служебное сообщение обрабатывается, и привязка переезжает на новый идентификатор:

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

## Итоги

- **Группы — для команд и для личных досок.** Командный чат превращает обсуждение в задачи, а личные группы помогают раскладывать заметки по доскам.
- **Два режима сохранения.** Каждое сообщение или только то, где упомянули бота.
- **Любой чат настраивается одинаково.** Личный чат с ботом — тоже привязанный чат со своей доской, статусом и режимом.
- **Привязка — в одном сообщении.** Бот редактирует сообщение и меняет кнопки, а нажатия обрабатываются контроллерами по путям, как в веб-API.
- **Две проверки прав.** Администратор группы в Telegram и право на привязку чатов в Boards.
- **Privacy mode отключён.** Иначе бот не видит обычные сообщения в группе.
- **Переход в супергруппу не ломает привязку.** Бот переносит её на новый идентификатор чата.

## Что дальше

Следующие статьи — про то, как в Boards появился ИИ: краткое содержание задач и сообщений и ретроспективы.
