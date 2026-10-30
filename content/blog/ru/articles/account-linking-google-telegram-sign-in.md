---
title: Связывание аккаунтов — вход через Google и Telegram для одного пользователя в ASP.NET Core
description: Часть 28 цикла о разработке Telegram-таск-трекера небольшой командой. Как мы добавили вход через Google, почему у одного человека оказывалось два пользователя, как подключить второй способ входа к своему аккаунту, когда можно забрать аккаунт у «пустого» пользователя и как отозвать уже выданные JWT.
seoTitle: Связывание аккаунтов: вход через Google и Telegram
seoDescription: Часть 28: вход через Google в ASP.NET Core, проверка ID token, связывание с аккаунтом Telegram, SELECT FOR UPDATE при объединении и отзыв JWT по версии токена.
type: article
series: architecture-first
part: 28
createdAt: 2026-10-30 19:54
updatedAt: 2026-10-30 20:14
projects: [boards]
tags: [devlog, dotnet, authentication, database]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 28.
> В [предыдущей статье](running-our-backlog-with-claude-code-mcp) ИИ-агенты получили доступ к задачам через MCP-сервер. До этого в Boards можно было войти только через Telegram. В конце сентября появился вход через Google, а за ним — связывание аккаунтов.

## Краткое содержание

Как устроены вход через Google и связывание аккаунтов:

1. Google ID token, который фронтенд получает после входа через Google, бэкенд проверяет сам: подпись, срок действия, издателя и то, что токен выпущен именно для нашего OAuth-клиента.
2. У пользователя Boards появилось поле `GoogleSubject`, а `TelegramId` стал необязательным. Тот, кто вошёл только через Google, работает в веб-приложении, но без бота.
3. Поначалу вход через Google и вход через Telegram создавали двух разных пользователей. Уже на следующий день второй способ входа можно было подключить в настройках аккаунта.
4. Если подключаемый аккаунт уже принадлежит другому пользователю, мы забираем его, только если у того нет никаких данных. Иначе подключение отклоняется, и пользователь видит, почему.
5. Подключение проходит в два шага: сначала вызов сервиса Identity вне транзакции, затем изменения в базе Boards — в транзакции с блокировкой строк через `SELECT ... FOR UPDATE`.
6. Пользователя, у которого забрали последний способ входа, мы помечаем удалённым и отзываем его токены: теперь в каждый JWT записывается версия токена пользователя.

## Зачем Boards понадобился вход через Google

Сначала Boards были тесно завязаны на Telegram, и войти в них можно было только через него. Со временем Boards переросли Telegram, и такой вход стал мешать. С Google в организацию можно добавить человека, который Telegram вообще не пользуется, — например, кого-то из внешней команды, кому нужно видеть, чем занимается команда. Кроме того, мы рассчитываем, что без обязательного Telegram больше посетителей лендинга решатся попробовать Boards.

## Вход через Google: проверяем ID token на бэкенде

Фронтенд показывает кнопку входа через Google. После входа Google возвращает ID token — подписанный им JWT, — и фронтенд отправляет его на `POST /api/user/auth-via-google`. Бэкенд проверяет токен библиотекой Google.Apis.Auth и устанавливает ту же cookie пользователя, что и при входе через Telegram (про cookie — в [части 24](jwt-httponly-cookie-aspnet-core)).

Так проверка выглядела в коде того времени (с сокращениями):

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

Здесь есть две ловушки, и обе — в параметрах проверки:

- **Пустой список аудиторий.** Если `TrustedAudiences` пуст, библиотека вообще не проверяет поле `aud` и принимает токен, выпущенный для *любого* OAuth-клиента Google. Поэтому без `GoogleAuth:ClientId` сервис не запускается: лучше сразу упасть, чем молча принимать чужие токены.
- **Пустой список издателей.** Если не указать `TrustedIssuers`, не проверяется и поле `iss`. Издателей Google мы перечислили явно.

Мы вызываем `JsonWebSignature.VerifySignedTokenAsync`, а не более известный `GoogleJsonWebSignature.ValidateAsync`: у последнего нет перегрузки с `CancellationToken`.

Пользователя мы ищем по `sub` — постоянному идентификатору аккаунта Google. Email для этого не годится: его можно поменять. Если пользователя с таким `sub` ещё нет, мы регистрируем его так же, как при первом входе через Telegram, — с личной организацией и спейсом по умолчанию.

## Пользователь без Telegram

До этого каждый пользователь Boards приходил из Telegram, и `TelegramId` был обязательным. С появлением входа через Google модель пользователя стала такой:

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

Профиль пользователя — имя, язык, email — Boards у себя больше не хранит: он лежит в отдельном сервисе Identity, общем для продуктов Laraue. О том, как мы объединяем пользователей разных продуктов, расскажем в отдельной статье.

Без Telegram пользователь не может ни сохранять сообщения из чатов, ни пользоваться командой `/save` и inline-поиском. Поэтому на страницах входа и приглашения мы сначала написали, что эти возможности доступны только при входе через Telegram. Когда появилось связывание, это предупреждение убрали.

## Два пользователя у одного человека

В первую версию входа через Google связывание не вошло: вход через Google и вход через Telegram создавали двух разных пользователей. Если человек сначала пользовался Boards через Telegram, а потом вошёл через Google, у него появлялся второй пользователь — со своей, пустой, личной организацией.

Но связывание понадобилось прежде всего для обратного случая: человек зарегистрировался через Google, а потом захотел пользоваться ботом. Для этого ему нужно подключить Telegram к своему аккаунту, а не заводить второй.

## Как подключить второй способ входа

В настройках аккаунта появилась вкладка «Подключённые аккаунты» с виджетом Telegram и кнопкой Google. За ними стоят два метода API, доступные авторизованному пользователю:

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

- **У пользователя может быть только один аккаунт Telegram и один аккаунт Google.** Второй аккаунт того же типа подключить нельзя.
- **Внутри Telegram Mini App Google не подключить.** Google не пускает во встроенные браузеры приложений, так что подключить его можно только в обычном браузере.
- **Отвязать аккаунт нельзя.** Это мы в задачу не включили.

Когда пользователь подключает Telegram, бэкенд делает то же, что и при регистрации через Telegram: привязывает личный чат с ботом к статусу по умолчанию в личной организации. С этого момента всё, что пользователь пишет боту, становится задачами.

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

## Когда аккаунт уже занят: «пустой» пользователь

Чаще всего конфликт возникает в ситуации, описанной выше: у человека уже есть второй пользователь, созданный другим способом входа. Обычно такой пользователь только зарегистрировался и больше ничего не делал. Его аккаунт можно забрать: терять там нечего.

Что значит «ничего не делал», пришлось определить точно. Мы проверяем всё, что пользователь мог создать или в чём мог участвовать, но не считаем то, что появилось при регистрации: личную организацию с одним спейсом, одной доской и одним статусом и личный чат с ботом. В сокращённом виде:

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

Если данные есть, Boards сразу отвечает `OwnerHasData` и даже не обращается к Identity. Полноценное объединение двух пользователей с данными мы отложили: если оно понадобится, это будет отдельная задача.

Последний вариант, `OwnerUsedByAnotherService`, означает, что владелец аккаунта есть и в других продуктах Laraue, — такой аккаунт тоже не переносится. Это часть истории про общих пользователей, к ней мы вернёмся отдельно.

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

Если сервис упадёт между шагами, Identity уже будет знать о связи, а Boards — нет. Поэтому оба шага можно спокойно повторить: на повторный запрос Identity отвечает так же, как на первый, а второй шаг заново находит предыдущего владельца и не создаёт личный чат, если тот уже есть. Достаточно нажать кнопку ещё раз.

Второй шаг начинается с блокировки строк. Без неё два одновременных запроса — например, при двойном нажатии на кнопку — могли бы оба пройти проверки и упасть на уникальном индексе личного чата. Блокировку мы написали на linq2db, потому что в EF Core нет `FOR UPDATE`:

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

Блокируются текущий пользователь и владелец подключаемого аккаунта: `LockUsers(x => x.Id == userId || x.GoogleSubject == profile.GoogleSubject)`. Строки блокируются по порядку `Id`, чтобы две транзакции с пересекающимися наборами пользователей не заблокировали друг друга. Второй запрос ждёт, пока завершится первый, и видит уже готовый результат.

После этого аккаунт отвязывается от предыдущего владельца и привязывается к текущему пользователю.

## Что стало с пустым пользователем

Сначала мы решили оставить пустого пользователя без способа входа, но не удалять его. В ходе работы мы от этого отказались: если у пользователя забрали последний способ входа, он помечается удалённым, а в `DeletedByUserId` записывается тот, кто забрал аккаунт. Мягкое удаление к тому времени уже было у организаций, спейсов, задач и комментариев, теперь оно появилось и у пользователей.

Его личную организацию мы не трогаем: других участников в ней нет, так что попасть туда больше никто не может. С каким пользователем его объединили, знает только Identity. Если же у предыдущего владельца остался другой способ входа, он остаётся обычным пользователем.

## Отзыв токенов: версия в JWT

В первой версии связывания осталась одна проблема. В браузере, где человек вошёл как пустой пользователь, он так и оставался в пустом аккаунте, пока не истекал JWT. При следующем входе он попадал в нужный аккаунт, но до тех пор видел пустой. Отозвать уже выданный токен было нельзя: бэкенд проверял только подпись и срок действия.

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

Чтобы не ходить в базу при каждом запросе, текущая версия кэшируется в памяти на 30 секунд. Токены, выпущенные до появления claim, считаются токенами версии 0, поэтому после релиза уже открытые сессии продолжили работать.

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

После коммита транзакции его версия удаляется из кэша, и на этом хосте его сессии заканчиваются сразу, а на остальных — когда истечёт кэш, то есть не позже чем через 30 секунд. Кэш спрятан за интерфейсом `ITokenVersionCache`, чтобы потом его можно было заменить общим, например Redis.

Можно было перейти на короткоживущие access-токены с refresh-токенами, но это изменение куда больше: метод обновления токена, хранение refresh-токенов, обновление токена во фронтенде. Версия токена позволила отзывать токены сразу и потребовала меньше работы. Тот же механизм пригодится, чтобы выходить сразу со всех устройств и чтобы удаление пользователя из организации срабатывало мгновенно.

## Итоги

- **Google ID token проверяет бэкенд.** Аудитория и издатели указаны явно: без них библиотека эти поля не проверяет.
- **Пользователя ищем по `sub`, а не по email.** Email может поменяться.
- **У пользователя не больше одного аккаунта Telegram и одного Google.** Второй способ входа подключается в настройках аккаунта.
- **Забрать аккаунт можно только у пустого пользователя.** Что считается данными, перечислено явно; если данные есть, подключение отклоняется.
- **gRPC-вызов не выполняется внутри транзакции.** Сначала Identity, потом транзакция в Boards; оба шага можно повторить.
- **Одновременные подключения выстраиваются в очередь через `SELECT ... FOR UPDATE`.** Строки блокируются по порядку id.
- **Пользователь, оставшийся без способа входа, помечается удалённым, а его токены отзываются.** Версия токена в JWT, проверка в `OnTokenValidated`, кэш на 30 секунд.

## Что дальше

В этой статье мягкое удаление появилось и у пользователей. Следующая статья — о том, как мы ввели мягкое удаление для всех сущностей Boards и что из-за него пришлось поменять в уникальных индексах.
