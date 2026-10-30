---
title: Связывание аккаунтов — вход через Google и Telegram в одном аккаунте в ASP.NET Core
description: Часть 28 цикла о разработке Telegram-таск-трекера небольшой командой. Как мы добавили вход через Google, почему у одного человека появились два пользователя, как подключить второй способ входа к существующему аккаунту, когда можно забрать аккаунт у «пустого» пользователя и как отозвать уже выданные JWT.
seoTitle: Связывание аккаунтов: вход через Google и Telegram
seoDescription: Часть 28: вход через Google в ASP.NET Core, проверка ID token, связывание с аккаунтом Telegram, SELECT FOR UPDATE при объединении и отзыв JWT по версии токена.
type: article
series: architecture-first
part: 28
createdAt: 2026-10-30 19:54
updatedAt: 2026-10-30 19:54
projects: [boards]
tags: [devlog, dotnet, authentication, database]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 28.
> В [предыдущей статье](running-our-backlog-with-claude-code-mcp) ИИ-агенты получили доступ к задачам через MCP-сервер. До этого в Boards можно было войти только через Telegram. В конце сентября появился вход через Google, а за ним — связывание аккаунтов.

## Краткое содержание

Как устроены вход через Google и связывание аккаунтов:

1. Бэкенд сам проверяет Google ID token, который фронтенд получает от кнопки Google: подпись, срок действия, издателя и то, что токен выпущен для нашего клиента.
2. У пользователя Boards появился `GoogleSubject`, а `TelegramId` стал необязательным. Пользователь, вошедший только через Google, работает в веб-приложении, но без бота.
3. Сначала вход через Google и через Telegram создавал двух разных пользователей. Через день появилась возможность подключить второй способ входа в настройках аккаунта.
4. Если подключаемый аккаунт уже принадлежит другому пользователю, мы забираем его, только когда у того нет данных. Иначе подключение отклоняется с понятным сообщением.
5. Подключение идёт в два шага: сначала вызов сервиса Identity без транзакции, потом изменения в базе Boards в транзакции с блокировкой строк `SELECT ... FOR UPDATE`.
6. Пользователь, у которого забрали последний способ входа, помечается удалённым, а его токены отзываются: в каждый JWT теперь записывается версия токена пользователя.

## Вход через Google: проверяем ID token на бэкенде

Фронтенд показывает кнопку Google и получает от неё ID token — JWT, подписанный Google. Этот токен отправляется на `POST /api/user/auth-via-google`. Бэкенд проверяет его библиотекой Google.Apis.Auth и в ответ ставит ту же cookie пользователя, что и при входе через Telegram (о cookie — в [части 24](jwt-httponly-cookie-aspnet-core)).

Проверка в коде того периода (немного сокращена):

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

Здесь две ловушки, обе в настройках проверки:

- **Пустой список аудиторий.** Если `TrustedAudiences` пуст, библиотека не проверяет поле `aud` вообще и принимает токен, выпущенный для *любого* OAuth-клиента Google. Поэтому без `GoogleAuth:ClientId` сервис не запускается, а не работает без проверки.
- **Пустой список издателей.** Если не указать `TrustedIssuers`, не проверяется и поле `iss`. Издателей Google мы перечислили явно.

Мы вызываем `JsonWebSignature.VerifySignedTokenAsync`, а не более известный `GoogleJsonWebSignature.ValidateAsync`, потому что у второго нет перегрузки с `CancellationToken`.

Пользователя ищем по `sub` — постоянному идентификатору аккаунта Google. Email для этого не подходит: его можно поменять. Если пользователя с таким `sub` ещё нет, он регистрируется так же, как при первом входе через Telegram: с личной организацией и спейсом по умолчанию.

## Пользователь без Telegram

До этого каждый пользователь Boards приходил из Telegram, и `TelegramId` был обязательным. После входа через Google модель пользователя стала такой:

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

В той же миграции из таблицы `users` ушли поля профиля Telegram: имя пользователя, имя, фамилия и язык. Профиль теперь хранит отдельный сервис Laraue Identity, общий для приложений Laraue, а Boards держит у себя только идентификаторы и то, как показывать пользователя в интерфейсе. Boards передаёт в Identity уже проверенные данные: сам Google ID token туда не попадает.

Без Telegram пользователь не может сохранять сообщения из чатов, пользоваться командой `/save` и inline-поиском. На страницах входа и приглашения мы добавили предупреждение, что эти возможности работают только при входе через Telegram. Когда появилось связывание, это предупреждение убрали.

## Два пользователя у одного человека

Связывание в первую версию входа через Google не вошло: вход через Google и через Telegram создавал двух разных пользователей. Если человек сначала пользовался Boards через Telegram, а потом вошёл через Google, у него появлялся второй пользователь со своей пустой личной организацией.

Основной сценарий, ради которого понадобилось связывание, обратный: человек зарегистрировался через Google, а потом захотел возможности бота. Для этого ему нужно подключить Telegram к уже существующему аккаунту, а не заводить второй.

## Как подключить второй способ входа

В настройках аккаунта появилась вкладка «Подключённые аккаунты» с виджетом Telegram и кнопкой Google. За ними стоят два метода API для вошедшего пользователя:

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

Данные виджета Telegram проверяются так же, как при входе (схема проверки описана в [части 13](telegram-login-widget-dotnet-auth)), а Google ID token — тем же валидатором, что и выше.

Правила мы записали в задаче до начала работы:

- **У пользователя один Telegram и один Google.** Подключить второй аккаунт того же типа нельзя.
- **Google нельзя подключить внутри Telegram Mini App.** Google не разрешает вход во встроенных браузерах приложений, поэтому Google подключается только в обычном браузере.
- **Отвязать аккаунт нельзя.** Это осталось за рамками задачи.

После подключения Telegram бэкенд делает то же, что при регистрации через Telegram: привязывает личный чат с ботом к статусу по умолчанию в личной организации. С этого момента сообщения, отправленные боту, становятся задачами.

В задаче мы планировали отвечать на конфликт кодом 409. В итоге отказы возвращаются как обычный ответ 200 с результатом:

```csharp
public enum AccountLinkOutcome
{
    Linked,                    // the account is now connected (it may have been already)
    UserHasOtherAccount,       // one Telegram, one Google per user
    OwnerHasData,              // another Boards user has this account and has data
    OwnerUsedByAnotherService, // another Laraue app uses the account's current owner
}
```

Обработка ошибок во фронтенде смотрит только на код ответа, а для каждого отказа нужно своё сообщение. Неверная подпись Telegram или недействительный Google ID token по-прежнему дают 403.

## Когда аккаунт уже занят: «пустой» пользователь

Самый частый конфликт — тот, что описан выше: у человека уже есть второй пользователь, созданный другим способом входа. Чаще всего это пользователь, который только зарегистрировался и ничего не сделал. Такой аккаунт можно забрать: в нём нечего терять.

«Ничего не сделал» нужно было определить точно. Мы проверяем всё, что пользователь мог создать или где он мог участвовать, и не считаем то, что создала регистрация: личную организацию с одним спейсом, одной доской и одним статусом и личный чат с ботом. Сокращённо:

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

История изменений (о ней [часть 20](audit-log-change-history-one-transaction)) записывает только задачи и комментарии, поэтому изменения спейсов, досок, статусов и атрибутов проверяются отдельно.

Если данные есть, Boards сразу отвечает `OwnerHasData` и даже не обращается к Identity. Полное объединение двух пользователей с данными мы решили делать отдельной задачей, если оно понадобится.

Есть и вторая проверка — на стороне Identity. Один глобальный пользователь Laraue может быть пользователем нескольких приложений. Если владелец аккаунта используется ещё каким-то приложением, Identity аккаунт не переносит, и Boards отвечает `OwnerUsedByAnotherService`.

## Сначала Identity, потом транзакция в Boards

Подключение затрагивает две базы: Identity хранит, какой аккаунт Telegram или Google принадлежит какому глобальному пользователю, а Boards — свои `TelegramId` и `GoogleSubject`. Держать транзакцию базы открытой на время gRPC-вызова мы не хотели, поэтому подключение разбито на два шага:

```csharp
var outcome = await coreUserService.LinkGoogleAccountInIdentity(userId, profile, cancellationToken);
if (outcome == AccountLinkOutcome.Linked)
{
    await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
    await coreUserService.LinkGoogleAccountInBoards(userId, profile, cancellationToken);
    await transaction.CommitAsync(cancellationToken);
}
```

Первый шаг проверяет правила и вызывает Identity, ничего не меняя в базе Boards. Второй выполняется, только если Identity ответил успехом, и требует открытой транзакции: метод начинается с `EnsureTransactionStarted()`.

Если сервис упадёт между шагами, Identity уже будет знать о связи, а Boards — нет. Поэтому оба шага можно безопасно повторить: Identity на повторную связь отвечает успехом, а второй шаг заново находит предыдущего владельца и не создаёт личный чат, если он уже есть. Пользователь просто нажимает кнопку ещё раз.

Второй шаг начинается с блокировки строк. Два одновременных запроса — например, двойное нажатие кнопки — иначе могли бы оба пройти проверки и упасть на уникальном индексе личного чата. Блокировку мы написали на linq2db, потому что в EF Core нет `FOR UPDATE`:

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

Блокируются текущий пользователь и владелец подключаемого аккаунта: `LockUsers(x => x.Id == userId || x.GoogleSubject == profile.GoogleSubject)`. Строки блокируются в порядке `Id`, чтобы две транзакции с пересекающимися наборами пользователей не попали во взаимную блокировку. Второй запрос ждёт, пока завершится первый, и видит уже его результат.

После блокировки аккаунт снимается с предыдущего владельца и записывается текущему пользователю.

## Что стало с пустым пользователем

В задаче мы сначала решили оставить пустого пользователя без способа входа, но не удалять. В процессе работы это решение поменялось: если у пользователя забрали последний способ входа, он помечается удалённым, а в `DeletedByUserId` записывается пользователь, который забрал аккаунт. Мягкое удаление к тому времени уже было у организаций, спейсов, задач и комментариев, теперь к ним добавились пользователи.

Его личная организация остаётся как есть: других участников в ней нет, поэтому попасть туда больше никто не может. В какого пользователя он влился, записывает только Identity. Если у предыдущего владельца остался другой способ входа, он остаётся обычным пользователем.

## Отзыв токенов: версия в JWT

После первой версии связывания осталась проблема. Браузер, в котором человек вошёл как пустой пользователь, продолжал работать с ним, пока не истекал JWT. Следующий вход приводил к правильному пользователю, но до этого человек видел пустой аккаунт. Отозвать выданный токен было нельзя: бэкенд проверял только подпись и срок действия.

Мы добавили пользователю версию токена `TokenVersion`. Она записывается в каждый токен пользователя и организации как claim `tv`:

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

При каждом запросе версия в токене сравнивается с текущей версией пользователя в `OnTokenValidated` схемы JWT. Если версия устарела или пользователя нет, запрос получает 401, и фронтенд отправляет пользователя на страницу входа:

```csharp
public static async Task OnTokenValidated(TokenValidatedContext context)
{
    var tokenVersionService = context.HttpContext.RequestServices.GetRequiredService<ITokenVersionService>();
    if (!await tokenVersionService.IsCurrent(context.Principal!, context.HttpContext.RequestAborted))
        context.Fail("The token was revoked.");
}
```

Чтобы не делать запрос к базе на каждый запрос, текущая версия кэшируется в памяти на 30 секунд. Токены, выпущенные до появления claim, считаются версией 0, поэтому уже открытые сессии после выкладки продолжили работать.

Связывание увеличивает версию пользователя в том же `UPDATE`, которым помечает его удалённым:

```csharp
await context.Users
    .Where(x => x.Id == previousOwnerId)
    .ExecuteUpdateAsync(x => x
        .SetProperty(u => u.DeletedAt, dateTimeProvider.UtcNow)
        .SetProperty(u => u.DeletedByUserId, userId)
        .SetProperty(u => u.TokenVersion, u => u.TokenVersion + 1),
        cancellationToken);
```

После коммита транзакции его версия удаляется из кэша, и на этом хосте его сессии заканчиваются сразу. На других хостах — когда истечёт кэш, то есть не позже чем через 30 секунд. Кэш спрятан за интерфейсом `ITokenVersionCache`, чтобы позже его можно было заменить общим, например Redis.

Альтернативой были короткоживущие access-токены с refresh-токенами. Это большее изменение: метод обновления, хранение refresh-токенов, обновление токена во фронтенде. Версия токена дала немедленный отзыв меньшей работой. Тот же механизм пригодится для выхода на всех устройствах и для того, чтобы удаление пользователя из организации действовало сразу.

## Итоги

- **Google ID token проверяется на бэкенде.** Аудитория и издатели указаны явно: без них библиотека эти поля не проверяет.
- **Пользователь ищется по `sub`, а не по email.** Email может поменяться.
- **У пользователя по одному аккаунту Telegram и Google.** Второй способ входа подключается в настройках аккаунта.
- **Аккаунт забирается только у пустого пользователя.** Что считается данными, перечислено явно; при конфликте с данными подключение отклоняется.
- **gRPC-вызов не идёт внутри транзакции.** Сначала Identity, потом транзакция в Boards; оба шага можно повторить.
- **Одновременные подключения сериализуются `SELECT ... FOR UPDATE`.** Строки блокируются в порядке id.
- **Пользователь без способа входа помечается удалённым, а его токены отзываются.** Версия токена в JWT, проверка в `OnTokenValidated`, кэш на 30 секунд.

## Что дальше

В этой статье мягкое удаление дошло до пользователей. Следующая статья — о том, как мы сделали мягкое удаление для всех сущностей Boards и что из-за него пришлось поменять в уникальных индексах.
