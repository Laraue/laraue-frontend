---
title: Связывание аккаунтов — вход через Google и Telegram для одного пользователя в ASP.NET Core
description: Часть 28 цикла о разработке Telegram-таск-трекера небольшой командой. Как мы добавили вход через Google, почему у одного человека оказывалось две учётные записи, как подключить второй способ входа к своей учётной записи, когда можно забрать аккаунт у «пустой» учётной записи и как отозвать уже выданные JWT.
seoTitle: Связывание аккаунтов: вход через Google и Telegram
seoDescription: Часть 28: вход через Google в ASP.NET Core, проверка ID token, связывание с аккаунтом Telegram, SELECT FOR UPDATE при объединении и отзыв JWT по версии токена.
type: article
series: architecture-first
part: 28
createdAt: 2026-10-30 19:54
updatedAt: 2026-10-30 21:06
projects: [boards]
tags: [devlog, dotnet, authentication, database]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 28.
> В [предыдущей статье](running-our-backlog-with-claude-code-mcp) ИИ-агенты получили доступ к задачам через MCP-сервер. В конце сентября мы добавили вход через Google, а на следующий день научили Boards связывать аккаунты Google и Telegram одного человека.

## Краткое содержание

Как устроены вход через Google и связывание аккаунтов:

1. ID token, который фронтенд получает от Google после входа, бэкенд проверяет сам: подпись, срок действия, издателя и то, что токен выпущен именно для нашего OAuth-клиента.
2. У пользователя Boards появилось поле `GoogleSubject`, а `TelegramId` стал необязательным. Пользователю, который входит только через Google, доступно веб-приложение, но не бот.
3. Поначалу вход через Google и вход через Telegram создавали две разные учётные записи. Уже на следующий день второй способ входа можно было подключить в настройках аккаунта.
4. Если подключаемый аккаунт уже привязан к другой учётной записи, мы переносим его, только если у прежнего владельца нет никаких данных. Иначе подключение отклоняется, и пользователь видит причину.
5. Подключение проходит в два шага: сначала вызов сервиса Identity вне транзакции, затем изменения в базе Boards — в транзакции с блокировкой строк через `SELECT ... FOR UPDATE`.
6. Учётную запись, у которой забрали последний способ входа, мы помечаем удалённой и отзываем её токены: теперь в каждый JWT записывается версия, и устаревшие токены отклоняются.

## Зачем Boards понадобился вход через Google

Изначально войти в Boards можно было только через Telegram, но со временем Boards вышли за рамки Telegram-приложения. Через Google в организацию можно добавить человека, который вообще не пользуется Telegram, — например, кого-то из внешней команды, кому нужно видеть, чем занимается команда. Кроме того, мы рассчитываем, что без обязательного Telegram больше посетителей лендинга попробуют Boards.

## Вход через Google: проверяем ID token на бэкенде

На странице входа есть кнопка Google. После входа через неё Google возвращает фронтенду ID token — JWT со своей подписью, — и фронтенд отправляет его на `POST /api/user/auth-via-google`. Бэкенд проверяет токен с помощью библиотеки Google.Apis.Auth и устанавливает ту же cookie пользователя, что и при входе через Telegram (про cookie — в [части 24](jwt-httponly-cookie-aspnet-core)).

Так выглядела проверка, когда мы добавили вход через Google (код сокращён):

```csharp
public async Task<GoogleIdTokenPayload> ValidateAsync(string idToken, CancellationToken cancellationToken)
{
    var clientId = options.Value.ClientId;

    // An empty audience list makes the verification skip the audience check entirely, i.e.
    // accept a token issued for *any* Google OAuth client - refuse to run like that.
    if (string.IsNullOrWhiteSpace(clientId))
        throw new InvalidOperationException("GoogleAuth:ClientId is not configured.");

    GoogleJsonWebSignature.Payload payload;
    try
    {
        payload = await JsonWebSignature.VerifySignedTokenAsync<GoogleJsonWebSignature.Payload>(
            idToken,
            new SignedTokenVerificationOptions
            {
                TrustedAudiences = { clientId },
                TrustedIssuers = { "accounts.google.com", "https://accounts.google.com" },
            },
            cancellationToken);
    }
    catch (InvalidJwtException)
    {
        throw new ForbiddenException(ErrorMessages.GoogleIdTokenInvalid);
    }

    return new GoogleIdTokenPayload(payload.Subject, payload.Email, payload.Name, payload.GivenName, payload.FamilyName);
}
```

Два параметра проверки нужно задать явно:

- **Пустой список аудиторий.** Если `TrustedAudiences` пуст, библиотека вообще не проверяет поле `aud` и принимает токен, выпущенный для *любого* OAuth-клиента Google. Поэтому, если `GoogleAuth:ClientId` не задан, сервис не запускается.
- **Пустой список издателей.** Если не указать `TrustedIssuers`, не проверяется и поле `iss`.

Мы вызываем `JsonWebSignature.VerifySignedTokenAsync`, а не более известный `GoogleJsonWebSignature.ValidateAsync`: у последнего нет перегрузки с `CancellationToken`.

Пользователя мы ищем по `sub` — постоянному идентификатору аккаунта Google. Email для этого не подходит: его можно поменять. Если пользователя с таким `sub` ещё нет, мы регистрируем его так же, как при первом входе через Telegram, — с личной организацией и спейсом по умолчанию.

## Пользователь без Telegram

Поле `TelegramId` раньше было обязательным. После добавления входа через Google модель пользователя стала такой:

```csharp
public class User
{
    public Guid Id { get; set; }
    public Guid GlobalUserId { get; set; }

    /// Null for a user who has only ever signed in with Google - such a user
    /// can use the web app, but none of the Telegram bot's features.
    public long? TelegramId { get; set; }

    /// The Google ID token's sub claim. Null for a Telegram-only user.
    [MaxLength(255)]
    public string? GoogleSubject { get; set; }

    [MaxLength(129)]
    public string DisplayName { get; set; } = string.Empty;
    // ...
}
```

Профиль пользователя — имя, язык, email — Boards у себя больше не хранит: он находится в отдельном сервисе Identity, общем для продуктов Laraue. О том, как мы объединяем пользователей разных продуктов, расскажем в отдельной статье.

Без Telegram пользователь не может ни сохранять сообщения из чатов, ни пользоваться командой `/save` и inline-поиском. Поэтому на страницах входа и приглашения мы сначала написали, что эти возможности доступны только при входе через Telegram. Когда появилось связывание, это предупреждение убрали.

## Две учётные записи у одного человека

В первую версию входа через Google связывание не вошло: вход через Google и вход через Telegram создавали две разные учётные записи. Если человек сначала пользовался Boards через Telegram, а потом вошёл через Google, у него появлялась вторая учётная запись со своей пустой личной организацией.

Но связывание понадобилось прежде всего для обратного случая: человек зарегистрировался через Google, а потом захотел пользоваться ботом. Для этого ему нужно подключить Telegram к своей учётной записи, а не заводить вторую.

## Как подключить второй способ входа

В настройках аккаунта появилась вкладка «Подключённые аккаунты» с виджетом Telegram и кнопкой Google. Они вызывают два метода API, доступные только авторизованному пользователю:

```csharp
[Authorize(AuthenticationSchemes = AuthSchemas.User)]
[ApiController]
[Route("/api/user/connected-accounts")]
public class ConnectedAccountsController(
    ITelegramAuthService telegramAuthService,
    IConnectedAccountsService connectedAccountsService)
    : ControllerBase
{
    [HttpPost("telegram")]
    public Task<ConnectAccountResponse> ConnectTelegram(
        [FromBody] TelegramWidgetAuthRequest request,
        CancellationToken cancellationToken)
    {
        return telegramAuthService.ConnectTelegram(HttpContext.User.GetId(), request, cancellationToken);
    }

    [HttpPost("google")]
    public Task<ConnectAccountResponse> ConnectGoogle(
        [FromBody] ConnectGoogleAccountRequest request,
        CancellationToken cancellationToken)
    {
        return connectedAccountsService.ConnectGoogle(HttpContext.User.GetId(), request, cancellationToken);
    }
}
```

Данные виджета Telegram проверяются так же, как при входе (как именно — в [части 13](telegram-login-widget-dotnet-auth)), а Google ID token — тем же валидатором, что и выше.

Правила мы записали в задачу ещё до начала работы:

- **У пользователя может быть только один аккаунт Telegram и один аккаунт Google.** Если аккаунт этого типа уже подключён, API отвечает `UserHasOtherAccount`.
- **Google нельзя подключить внутри Telegram Mini App.** Google не разрешает входить через встроенные браузеры приложений.
- **Отвязать аккаунт нельзя.** Эту возможность мы в задачу не включили.

Когда пользователь подключает Telegram, бэкенд делает то же, что и при регистрации через Telegram: привязывает личный чат с ботом к статусу по умолчанию в личной организации. С этого момента каждое сообщение боту становится задачей.

В задаче мы собирались отвечать на конфликт кодом 409. В итоге отказ возвращается обычным ответом 200, а причина — в поле результата:

```csharp
public enum AccountLinkOutcome
{
    Linked,                    // the account is now connected (it may have been already)
    UserHasOtherAccount,       // one Telegram, one Google per user
    OwnerHasData,              // another Boards user has this account and has data
    OwnerUsedByAnotherService, // another Laraue app uses the account's current owner
}
```

Фронтенд обрабатывает ошибки только по коду ответа, а для каждого отказа нужно было показать своё сообщение. На неверную подпись Telegram или недействительный Google ID token API по-прежнему отвечает 403.

## Когда аккаунт уже занят: «пустая» учётная запись

Чаще всего конфликт возникает в ситуации, описанной выше: у человека уже есть вторая учётная запись, созданная другим способом входа. Как правило, в ней только зарегистрировались и больше ничего не делали. Такой аккаунт можно перенести без потери данных.

Что значит «ничего не делали», пришлось определить точно. Мы проверяем всё, что пользователь мог создать или в чём мог участвовать, но не учитываем то, что появилось при регистрации: личную организацию с одним спейсом, одной доской и одним статусом и личный чат с ботом. В сокращённом виде:

```csharp
private async Task<bool> HasDataAsync(Guid userId, CancellationToken cancellationToken)
{
    return await context.Issues.AnyAsync(x => x.OwnerId == userId || x.AssigneeId == userId, cancellationToken)
        || await context.IssueComments.AnyAsync(x => x.OwnerId == userId, cancellationToken)
        || await context.OrganizationLogs.AnyAsync(x => x.OwnerId == userId, cancellationToken)
        // a member of someone else's organization, or the owner of a non-personal one
        || await context.OrganizationUsers.AnyAsync(
            x => x.UserId == userId && x.Organization!.OwnerId != userId, cancellationToken)
        || await context.Organizations.AnyAsync(
            x => x.OwnerId == userId && x.Type != OrganizationType.Personal, cancellationToken)
        // the personal organization was changed after sign-up
        || await context.Spaces.AnyAsync(x => x.Organization!.OwnerId == userId && !x.IsDefault, cancellationToken)
        || await context.Statuses.CountAsync(x => x.Epic!.Space!.Organization!.OwnerId == userId, cancellationToken) > 1
        || await context.Attributes.AnyAsync(x => x.Organization!.OwnerId == userId, cancellationToken)
        || await context.ApiKeys.AnyAsync(x => x.CreatedByUserId == userId, cancellationToken)
        || await context.RetroParticipants.AnyAsync(x => x.UserId == userId, cancellationToken)
        // ... epics, other members, retro cards and votes, other linked chats
        ;
}
```

История изменений (о ней — [часть 20](audit-log-change-history-one-transaction)) записывает только задачи и комментарии, поэтому изменения спейсов, досок, статусов и атрибутов мы проверяем отдельно.

Если данные есть, Boards сразу отвечает `OwnerHasData` и даже не обращается к Identity. Полноценное объединение двух учётных записей с данными мы отложили: если оно понадобится, это будет отдельная задача.

Последний вариант, `OwnerUsedByAnotherService`, означает, что владелец аккаунта зарегистрирован и в других продуктах Laraue, — такой аккаунт тоже не переносится.

## Сначала Identity, потом транзакция в Boards

Подключение затрагивает две базы: в Identity хранится, какой аккаунт Telegram или Google принадлежит какому глобальному пользователю, а в Boards — свои `TelegramId` и `GoogleSubject`. Держать транзакцию открытой, пока идёт gRPC-вызов, мы не хотели, поэтому разбили подключение на два шага:

```csharp
var outcome = await coreUserService.LinkGoogleAccountInIdentity(userId, profile, cancellationToken);
if (outcome == AccountLinkOutcome.Linked)
{
    await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
    await coreUserService.LinkGoogleAccountInBoards(userId, profile, cancellationToken);
    await transaction.CommitAsync(cancellationToken);
}
```

Первый шаг проверяет правила и вызывает Identity, ничего не меняя в базе Boards. Второй выполняется, только если Identity подтвердил связь, и работает лишь внутри транзакции: метод начинается с `EnsureTransactionStarted()`.

Если сбой произойдёт между шагами, Identity уже будет знать о связи, а Boards — нет. Поэтому оба шага можно безопасно повторить: на повторный запрос Identity отвечает так же, как на первый, а второй шаг заново находит предыдущего владельца и не создаёт личный чат, если тот уже есть.

Второй шаг начинается с блокировки строк. Без неё два одновременных запроса — например, при двойном нажатии на кнопку — могли бы оба пройти проверки и завершиться ошибкой уникального индекса личного чата. Блокировку мы написали на linq2db, потому что в EF Core нет `FOR UPDATE`:

```csharp
public static Task LockUsers(
    this DatabaseContext context,
    Expression<Func<User, bool>> predicate,
    CancellationToken cancellationToken = default)
{
    context.Database.EnsureTransactionStarted();

    return context.Users
        .ToLinqToDB()
        .Where(predicate)
        .OrderBy(x => x.Id)
        .Select(x => x.Id)
        .QueryHint(PostgreSQLHints.ForUpdate)
        .ToListAsyncLinqToDB(cancellationToken);
}
```

Блокируются текущий пользователь и владелец подключаемого аккаунта: `LockUsers(x => x.Id == userId || x.GoogleSubject == profile.GoogleSubject)`. Порядок `Id` нужен, чтобы две транзакции с пересекающимися наборами пользователей не заблокировали друг друга. Второй запрос ждёт, пока завершится первый, и видит уже готовый результат.

После этого аккаунт отвязывается от предыдущего владельца и привязывается к текущему пользователю.

## Что стало с пустой учётной записью

Сначала мы решили оставить пустую учётную запись без способа входа, но не удалять её. В ходе работы мы от этого отказались: если у учётной записи забрали последний способ входа, она помечается удалённой, а в `DeletedByUserId` записывается пользователь, который забрал аккаунт. Мягкое удаление к тому времени уже было у организаций, спейсов, задач и комментариев, теперь оно появилось и у пользователей.

Её личную организацию мы не трогаем: других участников в ней нет, так что попасть туда больше никто не может. С какой учётной записью её объединили, знает только Identity. Если же у прежнего владельца остался другой способ входа, его учётная запись остаётся обычной.

## Отзыв токенов: версия в JWT

В первой версии связывания осталась одна проблема. В браузере, где человек вошёл в пустую учётную запись, он так и оставался в ней, пока не истекал JWT. При следующем входе он попадал в нужную учётную запись, а до тех пор видел пустую. Отозвать уже выданный токен было нельзя: бэкенд проверял только подпись и срок действия.

Мы добавили пользователю поле `TokenVersion` — версию токена. Она записывается в каждый токен пользователя и организации как claim `tv`:

```csharp
public string CreateUserToken(Guid userId, int tokenVersion)
{
    var claims = new List<Claim>
    {
        new("id", userId.ToString()),
        new(TokenVersionClaim, tokenVersion.ToString()),
    };
    // ...
}
```

При каждом запросе обработчик `OnTokenValidated` схемы JWT сравнивает версию в токене с текущей версией пользователя. Если версия устарела или пользователя нет, API отвечает 401, и фронтенд отправляет пользователя на страницу входа:

```csharp
public static async Task OnTokenValidated(TokenValidatedContext context)
{
    var tokenVersionService = context.HttpContext.RequestServices.GetRequiredService<ITokenVersionService>();
    if (!await tokenVersionService.IsCurrent(context.Principal!, context.HttpContext.RequestAborted))
        context.Fail("The token was revoked.");
}
```

Чтобы не обращаться к базе данных при каждом запросе, текущая версия кэшируется в памяти на 30 секунд. Токены, выпущенные до появления claim, считаются токенами версии 0, поэтому после релиза уже открытые сессии продолжили работать.

При связывании версия пользователя увеличивается в том же `UPDATE`, который помечает его удалённым:

```csharp
await context.Users
    .Where(x => x.Id == previousOwnerId)
    .ExecuteUpdateAsync(x => x
        .SetProperty(u => u.DeletedAt, dateTimeProvider.UtcNow)
        .SetProperty(u => u.DeletedByUserId, userId)
        .SetProperty(u => u.TokenVersion, u => u.TokenVersion + 1),
        cancellationToken);
```

После коммита транзакции версия этого пользователя удаляется из кэша, и на этом хосте его сессии заканчиваются сразу, а на остальных — когда истечёт кэш, то есть не позже чем через 30 секунд. Кэш скрыт за интерфейсом `ITokenVersionCache`, чтобы потом его можно было заменить общим, например Redis.

Можно было перейти на короткоживущие access-токены с refresh-токенами, но это гораздо более крупное изменение: метод обновления токена, хранение refresh-токенов, обновление токена во фронтенде. Версия токена позволила отзывать токены сразу и потребовала меньше работы. Тот же механизм пригодится, чтобы выходить сразу со всех устройств и чтобы удаление пользователя из организации срабатывало мгновенно.

## Итоги

- **Google ID token проверяет бэкенд.** Аудитория и издатели указаны явно: без них библиотека эти поля не проверяет.
- **Пользователя ищем по `sub`, а не по email.** Email может поменяться.
- **У пользователя не больше одного аккаунта Telegram и одного Google.** Второй способ входа подключается в настройках аккаунта.
- **Забрать аккаунт можно только у пустой учётной записи.** Что считается данными, перечислено явно; если данные есть, подключение отклоняется.
- **gRPC-вызов не выполняется внутри транзакции.** Сначала Identity, потом транзакция в Boards; оба шага можно повторить.
- **Одновременные подключения выстраиваются в очередь через `SELECT ... FOR UPDATE`.** Строки блокируются по порядку id.
- **Учётная запись, оставшаяся без способа входа, помечается удалённой, а её токены отзываются.** Версия токена в JWT, проверка в `OnTokenValidated`, кэш на 30 секунд.

## Что дальше

Следующая статья — о том, как мы ввели мягкое удаление для всех сущностей Boards и что из-за него пришлось поменять в уникальных индексах.
