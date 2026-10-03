---
title: Чистая архитектура Telegram-бота на .NET — контроллеры вместо гигантского switch
description: Часть 5 цикла о разработке Telegram-таск-трекера в одиночку. Telegram-бот на .NET с контроллерами и middleware в стиле ASP.NET вместо гигантского switch, слоистая структура решения и связка EF Core с linq2db на одних и тех же моделях.
seoTitle: Архитектура Telegram-бота на .NET: контроллеры вместо switch
seoDescription: Часть 5: контроллеры и middleware в стиле ASP.NET для Telegram-бота, слоистая структура решения и связка EF Core с linq2db на одних моделях.
type: article
series: architecture-first
part: 5
createdAt: 2026-06-21
updatedAt: 2026-10-04 16:00
projects: [boards, telegram-net]
tags: [devlog, dotnet, telegram, architecture]
---

> **Architecture First: как в одиночку с ИИ сделать альтернативу Jira** — Часть 5.
> Первые четыре статьи были о подготовке: зачем мы это делаем, как выглядит путь пользователя, какой стек выбран. Здесь мы наконец пишем бэкенд настоящего Telegram-бота.

Цель первой итерации скромная: бэкенд, который принимает сообщения пользователей в Telegram и сохраняет их. Пока без web API и фронтенда: бот только принимает сообщение и кладёт его в базу.

Что в итоге получилось:

- один запускаемый проект, `TelegramHost`, и слои вокруг него: `DataAccess`, `Services`, `TelegramServices`;
- команды бота разбираются контроллерами, как в ASP.NET, а все остальные сообщения попадают в middleware, который их сохраняет;
- база PostgreSQL с миграциями, которые применяются при старте хоста, и EF Core, к которому для части запросов подключён linq2db;
- health-check `/_health` с первого коммита.

## Telegram Host

На этом этапе мы работаем только с одним запускаемым проектом, хостом [`TelegramHost`](https://github.com/Laraue/Laraue.Apps.Boards/tree/main/src/Laraue.Apps.Boards.TelegramHost). Его задача проста: подключиться к Telegram, получать новые апдейты и сохранять их в базу.

Когда продукт уже целиком в голове, велик соблазн сразу нарисовать всю структуру: web API, фоновые воркеры, сервисы под будущие функции. Мы идём последовательно. Переложить сообщения из чата в базу — это минимум, с которым уже можно выкладывать проект на сервер. На нём и остановимся.

## Структура solution

Хотя сейчас мы делаем один хост, структуру solution строим максимально похожей на ту, к которой придём. От проекта к проекту она почти не меняется: в папке `src` лежат все проекты, в папке `tests` — тесты. Исходный код можно посмотреть в [репозитории бэкенда](https://github.com/Laraue/Laraue.Apps.Boards/tree/main/src), а ниже объясняем, почему структура именно такая.

Проекты мы создаём вручную, добавляя каждый `.csproj` через контекстное меню редактора. В крупных компаниях это обычно автоматизируют: сервис с правильной структурой и настройками генерируется из шаблона. Но автоматизация окупается, когда новые сервисы появляются каждый день. У нас проектов немного, и их создание занимает очень мало времени по сравнению с остальной работой.

### Проекты в solution и именование

Бэкенд разбит на проекты, и каждый отвечает за свой слой. Названия следуют правилу, которое мы применяем во всех бэкенд-репозиториях Laraue: у каждого проекта префикс из неймспейса.

- **`Laraue.Apps.Boards.DataAccess`** — модели EF Core, связанные с ними enum и контекст базы данных. Бизнес-логики здесь нет, только классы, относящиеся к базе, и их настройки.
- **`Laraue.Apps.Boards.Services`** — бизнес-логика, общая для всех хостов. Например, создание issue может добавлять запись в базу, писать в историю изменений и в аудит-лог. Создавать issue можно из разных хостов, поэтому дублировать эту логику не нужно.
- **`Laraue.Apps.Boards.TelegramServices`** — сервисы, специфичные для Telegram-хоста. Они оборачивают вызовы общих сервисов логикой хоста. Например, Telegram-сервис помимо создания issue через общий сервис должен ещё привязать к нему `TelegramMessage`.
- **`Laraue.Apps.Boards.TelegramHost`** — запускаемый проект, который общается с Telegram.

Единый префикс `Laraue.Apps.Boards.*` делает имя проекта уникальным в компании, из него сразу ясно назначение проекта, и это помогает не ошибиться в настройках.

### Один хост — одна функция

Хост называется по тому, что он делает. `TelegramHost` обрабатывает запросы Telegram-бота, `WebApiHost` будет обслуживать HTTP API, в другом проекте может быть `RabbitWorkerHost`, который читает очередь. По имени должно быть сразу понятно, чем занят процесс.

Это сознательное решение: так проще управлять хостами. Каждому можно задать свои лимиты ресурсов (бот и тяжёлый фоновый воркер потребляют память и процессор по-разному), свои сетевые правила (web API смотрит наружу, воркеру это не нужно) и своё поведение при перезапуске. Один хост на все функции такой гибкости не дал бы.

Telegram-хост, например, работает через long polling: он сам запрашивает у Telegram обновления, а не принимает вебхуки, поэтому публичный адрес ему не нужен. Он кладёт полученные апдейты в очередь в базе и обрабатывает её. Апдейты одного чата обрабатываются строго по одному, апдейты разных чатов могут идти параллельно (подробнее об этом в [статье про медиагруппы](telegram-media-group-album-bot)). Нагрузка на память невелика, и лимиты для хоста можно держать небольшими.

### Core- и Host-сервисы

Одно из наших правил: хост работает только со своими сервисами. Вызывать Core-сервисы прямо из контроллеров нельзя. То есть Telegram-хост может внедрять классы из `TelegramServices`, а те уже работают с классами из `Services`.

Благодаря этому легко добавлять новые точки входа. Когда появится web API, у него будут свои сервисы уровня хоста, со своими проверками прав и валидацией, а вызывать они будут те же Core-сервисы, что и бот.

Такое разделение отнимает время, и оно оправдано не всегда. Если бы в solution был только код Telegram-бота и мы точно знали, что новых хостов не будет, мы бы на это время не тратили.

## Первые модели в базе

Схема базы выводится из пути пользователя, который мы определили раньше: человек пишет боту, сообщение сохраняется и позже показывается на доске. Поэтому первые таблицы этой итерации — пользователь, сообщение на доске (карточка) и сообщение Telegram.

Основная таблица — `Message`, то есть одно сообщение на доске. Здесь она показана в упрощённом виде. В первых коммитах поля выглядели чуть иначе: категория называлась `MessageCategory`, а идентификатор сообщения Telegram хранился прямо в `Message`.

```csharp
public class Message
{
    public long Id { get; set; }

    [MaxLength(4096)]
    public required string? Content { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // The user the message belongs to.
    public Guid UserId { get; set; }
    public User? User { get; set; }

    // The message's current status.
    public long StatusId { get; set; }
    public Status Status { get; set; }

    // Category it belongs to. Null for backlog.
    public long? CategoryId { get; set; }
    public Category? Category { get; set; }

    // Linked Telegram message. Null means it was not created through Telegram.
    public TelegramMessage? TelegramMessage { get; set; }
    public long? TelegramMessageId { get; set; }
}
```

Связь с сообщением Telegram необязательна: `TelegramMessageId` допускает `null`. Уже в первой итерации модель допускает, что карточку на доске можно создать и без мессенджера.

Модель пользователя [`User`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Models/User.cs) хранит идентификаторы, включая `TelegramId`. Пользователя создаёт библиотека [Laraue.Telegram.NET](https://github.com/Laraue/Laraue.Telegram.NET) при первом обращении к боту. Для этого хост подключает свой сервис, который отвечает на два вопроса: найти пользователя по Telegram ID и создать нового.

```csharp
public interface ITelegramUserQueryService<TUserKey>
{
    Task<TelegramUserId<TUserKey>?> FindUserIdAsync(long telegramId, CancellationToken cancellationToken = default);
    Task<TUserKey> CreateAsync(TelegramData telegramData, CancellationToken cancellationToken = default);
}
```

В хосте он подключается строкой `AddTelegramAuthentication<Guid, TelegramUserQueryService, RequestContext>()`. Когда мы писали эту часть, библиотека ещё требовала, чтобы сама модель `User` реализовывала интерфейс `ITelegramUser<Guid>`. Позже мы убрали это требование: модель базы не должна зависеть от библиотеки, а нужные данные библиотека получает через сервис.

Модель [`TelegramMessage`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Models/TelegramMessage.cs) содержит идентификаторы сообщения в Telegram. С её помощью мы не пускаем Telegram-специфичные идентификаторы в основную бизнес-логику.

### Ограничение длины строк

У каждой строки в моделях максимальная длина задаётся явно: `Content` — 4096, `Name` — 128, `Color` — 7. Строковый столбец без ограничения превращается в `text`/`varchar(max)`, что создаёт проблемы с индексами и мешает базе работать оптимально. Лимит эти проблемы снимает.

Кроме того, выбор лимита заставляет подумать, какие данные будут лежать в столбце. 4096 для `Content` выбрано не случайно: столько символов Telegram разрешает в одном сообщении. А семи символов для `Color` ровно хватает на hex-код вроде `#1D9E75`.

### Ошибка: поспешное название сущности

Сначала мы назвали модель карточки на доске `Message`. Позже, когда карточки стали создаваться и через web API, возникла путаница: в интерфейсе появились подписи вроде «создать сообщение» и «редактировать сообщение», и это выглядело странно. Мы переименовали сущность в `Card`. Но это название плохо сочеталось с ботом: пользователь пишет заметку, а не карточку. В итоге остановились на `Issue`, с которым живём до сих пор.

Каждое такое переименование — не просто поиск с заменой: имя вплетено в модели, названия сервисов и методов, DTO. Оно же показывается пользователю в интерфейсе.

Как этого избежать, мы так и не придумали. Правильное имя в первой итерации было неизвестно, а `Message` выглядело вполне подходящим. Вывод один: переименовывать модели долго, поэтому стоит дважды подумать, прежде чем закреплять название. Впрочем, ошибка не уникальна: Atlassian в процессе развития Jira тоже переименовывала сущности, например «projects» в [«spaces»](https://community.atlassian.com/forums/Jira-articles/Jira-Spaces-have-landed/ba-p/3117620), а «issues» в «work items».

#### Название проекта тоже менялось

Мы долго не могли выбрать имя проекта и начали с `Laraue.Apps.StructuredMessages`. Когда название `Laraue Boards` закрепилось, мы переименовали репозиторий, solution, все неймспейсы и файлы деплоя (на самом деле не всё, время от времени находим что-то забытое). Для таких изменений хорошо подходит отдельный PR без других правок: его проще проверить и при необходимости откатить.

## Чистая архитектура обработки сообщений

База — это место, где сообщение оказывается. Интереснее, как оно туда попадает.

Бот обрабатывает два вида сообщений. Первый — команды: пользователь просит что-то сделать, бот делает. Например, `/start`. Второй — всё остальное: если пользователь написал текст, который не является командой, сообщение просто сохраняется в базу, чтобы потом появиться на доске.

Команды направляются в контроллеры, как в ASP.NET, с помощью нашей библиотеки [Laraue.Telegram.NET](../projects/telegram-net) ([исходный код на GitHub](https://github.com/Laraue/Laraue.Telegram.NET)). Команда `/start` выглядит так:

```csharp
public class CommandsController(ITelegramCommandsService commandsService)
    : TelegramController
{
    [TelegramMessageRoute("/start")]
    public Task HandleStart(
        RequestContext requestContext,
        CancellationToken cancellationToken)
    {
        return commandsService.HandleStart(
            ReplyData.FromMessageRequest(requestContext),
            cancellationToken);
    }
}
```

Среди ботов на C# такой подход встречается нечасто, поэтому библиотеку мы сделали сами. В большинстве примеров бот на C# — это один метод со `switch`, который обрабатывает все сообщения. В маленьком боте так можно жить, а в большом это тяжело поддерживать. Поэтому мы взяли за основу MVC и перенесли его в библиотеку.

Если пользователь прислал не команду, ни один маршрут не подходит, и сообщение попадает в [`HandleAllMessagesMiddleware`](https://github.com/Laraue/Laraue.Apps.Boards/blob/31a490748edc7ad53aaf9a7ef7fe54d4a262e891/src/Laraue.Apps.Boards.TelegramHost/HandleAllMessagesMiddleware.cs), который работает как запасной вариант. Это не ASP.NET Middleware: он регистрируется в контейнере через `AddTelegramMiddleware<HandleAllMessagesMiddleware>()`, метод расширения из [Laraue.Telegram.NET](https://github.com/Laraue/Laraue.Telegram.NET).

```csharp
if (context.GetExecutedRoute() is null && AllowedUpdates.Contains(context.Update.Type))
{
    var message = context.Update.Message ?? context.Update.EditedMessage;

    SaveMessageTelegramRequest? request = message.Type switch
    {
        MessageType.Text => GetMessageRequest(message),
        // photo, video, animation handled here too, later in the series
        _ => null
    };

    if (request is not null)
        await telegramMessageService.HandleSaveMessage(request, ct);
}
```

Текстовый апдейт превращается в `SaveTextMessageTelegramRequest` и передаётся сервису уровня хоста. Бизнес-логике не нужно знать о типах апдейтов Telegram, поэтому в свои типы мы переводим данные как можно раньше.

Полный путь апдейта такой:

1. **Middleware** превращает апдейт Telegram в `SaveTextMessageTelegramRequest` и передаёт его сервису сохранения сообщений уровня хоста.
2. **Сервис сообщений уровня хоста** открывает транзакцию, сохраняет `TelegramMessage`, вызывает сохранение issue в Core-сервисе и подтверждает транзакцию.
3. **Core-сервис issue** добавляет в базу запись `Message` (в поздних итерациях `Issue`).

## Настройка Telegram-хоста

Хост настраивается в [`Program.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.TelegramHost/Program.cs):

```csharp
var builder = WebApplication.CreateBuilder(args);

const string dbConnectionStringName = "Postgre";

builder
    .AddTelegramOptions("Telegram")
    .AddApplicationServices()
    .AddDatabaseServices(dbConnectionStringName);

builder.Services.AddHealthChecks();

var app = builder.Build();

app.Services.UseLinq2Db();

using (var scope = app.Services.CreateScope())
{
    await using var db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    await db.Database.MigrateAsync();
    app.MapTelegramRequests();
}

app.MapHealthChecks("/_health");

app.Run();
```

Регистрация сгруппирована в методы расширения `AddTelegramOptions`, `AddApplicationServices` и `AddDatabaseServices`, чтобы зависимости сервиса читались с первого взгляда. Длинных цепочек `services.Add()` мы стараемся избегать.

Перед каждым запуском сервис применяет миграции: `await db.Database.MigrateAsync()`. В корпоративных приложениях так делают редко: компании предпочитают полный контроль и запускают миграции отдельным шагом. Для небольшого приложения это сознательное упрощение.

### Создание миграций

Чтобы создать миграцию, в папке `src` достаточно выполнить:

```bash
dotnet ef migrations add MigrationName \
  -p Laraue.Apps.Boards.DataAccess \
  -s Laraue.Apps.Boards.TelegramHost \
  -v
```

Мы придерживаемся правила «один pull request — одна миграция». Пока PR в черновике, миграций в нём становится много: что-то добавляется, меняется, удаляется. Перед тем как PR будет готов, мы их объединяем. Можно слить вручную, перенеся сгенерированный код из одного файла в другой. Можно удалить все миграции этого PR, откатить `DatabaseContextSnapshot` и сгенерировать одну новую со всеми изменениями.

Причина — удобная история. Проект, который живёт годами, накапливает много миграций, и бесконечный список мелких изменений трудно читать, когда пытаешься понять, как развивалась таблица. К тому же свежая база накатывает все миграции по порядку, и это может занять заметное время.

### EF Core и linq2db на одних моделях

По умолчанию проект использует EF Core как ORM. Но некоторые запросы EF Core не поддерживает, и тогда выручает linq2db. Обе ORM работают с одними и теми же моделями, подключение выполняется строкой `app.Services.UseLinq2Db()`. `UseLinq2Db()` — наша [обёртка](https://github.com/Laraue/Laraue.Core/blob/master/src/Laraue.Core.DataAccess.Linq2DB/Extensions/ServiceCollectionExtensions.cs) над официальным адаптером [`LinqToDB.EntityFrameworkCore`](https://github.com/linq2db/linq2db/tree/master/Source/LinqToDB.EntityFrameworkCore).

На практике выбор между ними виден прямо в коде запроса. Адаптер даёт методы с суффиксами, поэтому всегда понятно, какая ORM выполнит запрос: например, `ToListAsyncEF` исполняет его через EF Core, а `ToListAsyncLinqToDB` — через linq2db. Так, постраничный список issue в Boards читается через linq2db, а большинство остальных запросов идут через EF Core.

Почему не использовать linq2db всегда? Причин две. Во-первых, бывают запросы, с которыми справляется EF Core, а linq2db нет. Во-вторых, в EF Core удобные отслеживание изменений и работа с миграциями, а в linq2db этого нет.

## Health-check с первого дня

В `Program.cs` есть строки `AddHealthChecks()` и `MapHealthChecks("/_health")`. Они появились в каждом хосте с первого коммита. Запрос к `/_health` показывает, жив ли хост и может ли он обслуживать запросы. Эндпоинт пригодится при настройке инфраструктуры, и мы увидим это в следующей статье.

## Итоги

В итоге получился .NET-бэкенд, разбитый на слои, с одним Telegram-хостом. Он принимает сообщения из Telegram, команды направляет в контроллеры, а обычные сообщения через запасной middleware превращает в запросы и передаёт сервису уровня хоста, затем Core-сервису, и в конце они оказываются в PostgreSQL. При старте хост применяет миграции, а ещё у него есть health-check.

Пока ничего из этого не развёрнуто: код собирается и работает локально, но на сервер ещё не попал.

> **Что изменилось с тех пор.** Код в статье показан на момент этой части. Позднее единый middleware разделился на два: для личных и для групповых чатов. В хост добавились метрики (OpenTelemetry и эндпоинт `/_metrics` для Prometheus), у некоторых команд появилось ограничение на тип чата, а `User` перестал реализовывать интерфейс библиотеки. Структура решения и принципы остались прежними.

## Что дальше

Следующая статья — о выкладке хоста на настоящий сервер. Расскажем про VPS с PostgreSQL на том же сервере, про пайплайн сборки и доставки артефактов, про файлы Dockerfile и Docker Compose и про то, что из этого получилось.
