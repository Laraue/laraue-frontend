---
title: Объединение группы изображений в одну запись ботом в Telegram — обрабатываем медиагруппы и правки без использования таймеров
description: Часть 12 цикла о разработке Telegram-таск-трекера в одиночку. Telegram присылает альбом отдельными сообщениями, а правку — новым апдейтом. Разбираем, как собрать медиагруппу в одну запись без таймера-аккумулятора и как обрабатывать правку как обновление, а не как дубль.
seoTitle: Альбомы и правки в Telegram-боте: одна запись без таймеров
seoDescription: Часть 12: как собрать медиагруппу Telegram в одну запись без таймера-аккумулятора и обработать правку сообщения как обновление, а не дубль.
type: article
series: architecture-first
part: 12
createdAt: 2026-06-26 15:00
updatedAt: 2026-10-04 15:00
projects: [boards]
tags: [devlog, dotnet, telegram]
---

> **Architecture First: как в одиночку с ИИ сделать альтернативу Jira** — Часть 12.
> В [предыдущей статье](telegram-bot-file-storage-stream) бот научился сохранять одиночные сообщения с медиафайлами, но две темы остались открытыми. Сообщение можно отредактировать, и тогда должна обновиться уже сохранённая запись. А можно отправить сразу несколько медиа, и тогда всё это должно попасть в один issue. В этой статье разбираем оба случая.

До сих пор сохранение исходило из того, что сообщение в чате после отправки не меняется. Поэтому issue на доске оставались такими, какими были сохранены, даже если пользователь потом правил текст в чате. Кроме того, группа изображений, отправленная одним действием, превращалась в отдельную карточку на каждое изображение, а не в один issue со всеми медиа. Так получалось из-за того, как Telegram доставляет медиагруппы.

Коротко, что получилось:

- правка сообщения обрабатывается тем же кодом, что и первое сохранение: запись ищется по паре «ID сообщения + чат» и либо создаётся, либо обновляется (`upsert`);
- альбом собирается в одну карточку без таймера: все сообщения группы связываются через строку в базе, а карточку создаёт то сообщение группы, которое дошло до обработки первым;
- об успехе бот сообщает реакцией: 👍 для новой записи, ❤ для обновлённой;
- удаление сообщения в чате бот увидеть не может, поэтому issue удаляются только в веб-версии.

## Обработка правки сообщения

Начнём с простого. Когда пользователь правит сообщение, которое уже отправил в чат, Telegram присылает приложению апдейт *отредактированного сообщения*. Обрабатывать его нужно как `upsert`: обновить запись, если сообщение уже сохранено, и создать, если нет.

Для этого middleware из [прошлой статьи](telegram-bot-file-storage-stream) ([`HandleAllMessagesMiddleware`](https://github.com/Laraue/Laraue.Apps.Boards/blob/31a490748edc7ad53aaf9a7ef7fe54d4a262e891/src/Laraue.Apps.Boards.TelegramHost/HandleAllMessagesMiddleware.cs)) разрешает два типа апдейтов:

```csharp
private static readonly UpdateType[] AllowedUpdates =
[
    UpdateType.Message,
    UpdateType.EditedMessage,
];
```

Объект `Message` в обоих апдейтах одинаковый, поэтому достаём его так:

```csharp
var message = context.Update.Message ?? context.Update.EditedMessage;
```

Приложению всё равно, правка это или первое сохранение: логика обработки с самого начала построена на `upsert`. Причина в отказоустойчивости. Если система дала сбой посреди обработки, апдейт будет обработан второй раз, и без `upsert` появились бы фантомные записи. Поэтому отредактированное фото по-прежнему превращается в запрос через `GetPhotoRequest`, а отредактированный текст — через `GetMessageRequest`. В [middleware](https://github.com/Laraue/Laraue.Apps.Boards/blob/31a490748edc7ad53aaf9a7ef7fe54d4a262e891/src/Laraue.Apps.Boards.TelegramHost/HandleAllMessagesMiddleware.cs) нет ветки «правка это или нет»: он только преобразует сообщение в запрос, а решение «новая запись или существующая» передаёт в [save-сервис](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs).

## Upsert для нового и отредактированного сообщения

Сообщения из Telegram обрабатываются по одному (почему это гарантировано, объясним ниже, в разделе про медиагруппы), поэтому логика «создать или обновить» работает на уровне одного сообщения. Сначала [save-сервис](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs) ищет существующую запись по внешнему идентификатору: ID сообщения в Telegram плюс чат, из которого оно пришло. Нужна именно пара, потому что ID сообщения в разных чатах могут повторяться:

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

Дальше всё зависит от того, есть ли уже карточка для этого сообщения. Если сохранённого сообщения нет или к нему не привязан issue, перед нами новый объект: выполняется сохранение, и вызывающему коду возвращается результат `MainMessageCreated`.

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

Если же сообщение найдено и к нему привязан issue, пришла *правка* существующего объекта: выполняется обновление, и возвращается результат `MainMessageUpdated`:

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

`GetStatusIdToSaveMessage` выбирает статус, в который попадёт новое сообщение. Как именно он выбирается, относится к более поздним этапам, и здесь это опущено. Итог обработки, `MainMessageCreated` или `MainMessageUpdated`, и увидит пользователь.

## Реакция вместо сообщения о результате

Обратная связь минимальная: реакция на собственное сообщение пользователя. [`TelegramMessageService`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramMessageService.cs) ставит реакцию в зависимости от результата сохранения:

```csharp
var result = await saveMessageService.Save(request, cancellationToken);

if (result.Result is Result.MainMessageCreated)
    await SetReaction(request, "👍", cancellationToken);
else if (result.Result is Result.MainMessageUpdated)
    await SetReaction(request, "❤", cancellationToken);
```

Создан новый объект — ставится 👍, обновлён существующий — ❤. Почему мы выбрали именно такое общение с пользователем, рассказано в статье [«Почему пользователи снова и снова выбирали «Сохранённые сообщения»»](telegram-saved-messages-bot-lesson): бот только подтверждает, что обработал сообщение, и не засоряет чат лишними сообщениями и кнопками.

Реакция ставится одним вызовом Bot API:

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

Была и ещё одна небольшая идея: менять реакцию при каждой правке, чтобы повторные изменения тоже меняли эмодзи. Сейчас по реакции трудно понять, обработана ли повторная правка: пользователь всегда видит ❤. Telegram пока не позволяет прочитать текущие реакции сообщения, так что для этого пришлось бы самим хранить текущий эмодзи каждого сообщения. Ради такого редкого случая усложнять систему мы не стали.

## Медиагруппа в Telegram

Когда пользователь отправляет сразу несколько фото, Telegram присылает не одно сообщение с несколькими фото, как многие ожидают, а *несколько отдельных апдейтов* с одинаковым **media group id**. Приходят они в произвольном порядке. Собрать группу обратно в один объект Telegram предлагает самому приложению. В нашем коде этим занимается метод [`SaveGroupMessageEntity`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs).

Для пользователя группа изображений — одно сообщение, и на доске он ждёт одну карточку с N вложениями. В [save-сервисе](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs) для этого есть отдельная ветка:

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

Решение, которое чаще всего советуют на форумах, — **таймер**: приходит сообщение с media group id, его кладут в память и запускают (или перезапускают) таймер для этой группы. Когда таймер истёк, группу считают собранной и сохраняют все её сообщения. С отказоустойчивостью такой подход несовместим: состояние лежит в памяти, и перезапуск сервера может навсегда потерять часть данных.

Мы обходимся без таймера и опираемся на базу данных, а не на оперативную память. Мы не ждём, пока альбом закончится, а связываем сообщения по мере поступления. В основе три идеи.

Первая: медиагруппа получает собственный [идентификатор](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Models/TelegramMediaGroup.cs) в базе. Все отдельные сообщения одного альбома привязываются к этой строке через [`GetOrCreateTelegramMediaGroupId`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramServices/Services/Messages/TelegramSaveMessageService.cs):

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

Вторая: **карточку создаёт только первое сообщение группы.** «Первое» здесь значит то, которое раньше других попало в базу, то есть первым дошло до обработки, а не обязательно отправленное первым. Остальные сообщения группы находят уже существующий issue и добавляют к нему свои медиа. Это неважно для результата: текст карточки можно взять из любого сообщения группы, что мы разберём ниже.

Третья: всё состояние хранится в базе, а не в буфере. Если сервер перезапустится посреди обработки группы, ничего не пропадёт: уже обработанные части сохранены, остальные дообработаются после запуска. Почему именно так, объясняет следующий раздел.

### Почему две части альбома не создадут две карточки

Схема «первое сообщение создаёт карточку, остальные присоединяются» ломалась бы, если бы два сообщения альбома обрабатывались одновременно: оба не нашли бы карточку и каждое создало бы свою. Этого не происходит благодаря слою под ботом — нашей библиотеке [Laraue.Telegram.NET](https://github.com/Laraue/Laraue.Telegram.NET). Там работают два механизма.

**Очередь апдейтов в базе.** Апдейты, полученные через long polling, сначала записываются в таблицу и удаляются из неё только после успешной обработки. Если сервис остановился посреди обработки, апдейт остаётся в таблице и будет обработан после запуска. Отсюда и требование к `upsert`: такой апдейт может прийти повторно. Апдейт, обработка которого завершилась исключением, переносится в отдельную таблицу с текстом ошибки и стеком и автоматически повторно не обрабатывается.

**Очередь по чату.** Апдейты одного чата обрабатываются строго по одному, апдейты разных чатов могут идти параллельно. Реализовано это семафором, ключом которого служит ID чата:

```csharp
private readonly KeyedSemaphoreSlim<long> _requestByChatIdSemaphore = new (1);

// Different chat messages can be processes in parallel.
using var requestSemaphore = await _requestByChatIdSemaphore
    .WaitAsync(chatId.Value, cancellationToken)
    .ConfigureAwait(false);
```

Из-за этого части одного альбома не могут обрабатываться одновременно: порядок их прихода не определён, но в каждый момент выполняется только одна. Первая из них создаёт карточку, а остальные уже её видят.

У этой гарантии есть граница: семафор живёт в памяти процесса. Пока бот работает одним экземпляром, этого достаточно. Если запускать несколько экземпляров, понадобится блокировка уже на уровне базы данных.

### Нестандартные случаи

Остаются нестандартные случаи, про которые нужно хорошо подумать, стоит ли вообще их обрабатывать и как. В таких местах в коде стоят `TODO`: реализация отложена до тех пор, пока они не станут настоящей проблемой. Один из сложных случаев мы всё же закрыли. Первое сообщение группы, в котором был текст, удаляют, а текст пользователь пишет в другом сообщении той же группы. Код позволяет обновить текст issue из любого сообщения группы, чтобы поддержать и такой сценарий:

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

## Почему мы не обрабатываем удаления

Начнём с того, что Telegram не присылает боту апдейт, когда пользователь удаляет сообщение в своём чате. Такого события просто нет, поэтому мы не можем узнать об удалении. В итоге issue можно удалить только из веб-интерфейса, но не из чата.

*Почему* Telegram не отправляет это событие? Мы думаем, из-за неоднозначности. Что должно произойти, если пользователь удалит всю историю переписки с ботом? Должен ли прийти апдейт на каждое сообщение? Однозначного ответа нет.

Поэтому удаление реализовано только в веб-версии приложения, а чат с ботом служит чем-то вроде журнала взаимодействий.

Есть небольшая идея на будущее: удалять issue, когда пользователь ставит на своё сообщение определённое эмодзи. Удобно ли это, вопрос отдельный. Реакция дала бы возможность удалять, но общаться с ботом в обе стороны через эмодзи выглядит неуклюже и неинтуитивно, поэтому пока это только идея.

## Итоги

Теперь бот поддерживает все случаи, с которыми столкнулись реальные пользователи: текст и медиа, их редактирование, группы сообщений. Бот по-прежнему только сохраняет то, что ему отправили, и ставит реакцию об успешной обработке, которая теперь зависит от того, было ли это сохранение или правка. На этом часть продукта, отвечающая за обработку сообщений ботом, завершена.

> **Что изменилось с тех пор.** Код в статье показан на момент этой части. Позднее сервис получил режимы сохранения (каждое сообщение или только по команде `/save`), поддержку групповых чатов и лимиты на создание issue, а единый middleware разделился на два: для личных и для групповых чатов. Идеи при этом остались прежними: `upsert` по паре «ID сообщения + чат» и медиагруппа, собираемая через базу, а не таймер.

## Что дальше

Бот закончен, а вся дальнейшая функциональность будет развиваться в веб-версии: режим организации, управление issue, их атрибуты. Но сначала в веб-версии нужна авторизация. Дело в том, что пользователям не всегда было удобно работать с досками в Mini App, и они попросили веб-версию, а чтобы её опубликовать, нужно сначала настроить вход. Следующая статья — поворот от Telegram Mini App к веб-приложению: мы продолжаем строить продукт, тесно связанный с Telegram, но способный работать и отдельно от него.
