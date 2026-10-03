---
title: Аутентификация Telegram Mini App в .NET от и до — валидация initData, выпуск JWT и фронтенд на Nuxt
description: Часть 8 цикла о разработке Telegram-таск-трекера в одиночку. Как аутентифицировать пользователя Telegram Mini App в .NET и Nuxt: проверка хеша initData через HMAC-SHA256, отклонение устаревших данных по auth_date, выпуск и использование JWT, пользователь из HttpContext и почему важен CORS.
seoTitle: Аутентификация Telegram Mini App в .NET: initData и JWT
seoDescription: Как провалидировать initData Telegram Mini App в .NET: хеш HMAC-SHA256, проверка auth_date, JWT и пользователь из HttpContext. Часть 8.
type: article
featured: true
series: architecture-first
part: 8
createdAt: 2026-06-24 08:00
updatedAt: 2026-10-03 17:50
projects: [boards]
tags: [devlog, dotnet, nuxt, telegram, authentication]
---

> **Architecture First: как в одиночку с ИИ сделать альтернативу Jira** — Часть 8.
> В [Предыдущей статье](deploy-nuxt-telegram-mini-app-https-nginx) мы добились того, что Mini App открывается внутри Telegram и отображает JSON с объектом пользователя. Но этим данным пока нельзя доверять. В этой статье мы делаем настоящую аутентификацию — добавляем бэкенд для приложения и проверку на корректность данных на его стороне.

## Краткое содержание

Как аутентифицировать пользователя Telegram Mini App в .NET:

1. Mini App отправляет на ваш бэкенд `Telegram.WebApp.initData` — строку запроса, подписанную Telegram.
2. Бэкенд собирает из полей строки (кроме `hash`) data-check-string, подписывает её через `HMAC-SHA256` ключом, полученным из токена бота, и сравнивает результат с полем `hash`.
3. Проверяет, что `auth_date` свежий, чтобы старую строку нельзя было отправить повторно.
4. Находит пользователя по Telegram ID (или регистрирует нового) и возвращает собственный JWT.
5. Фронтенд сохраняет JWT и отправляет его как bearer в каждом запросе к API; дальше работают `[Authorize]` и `HttpContext.User`.

Остальная часть статьи по шагам строит именно это в реальном приложении на .NET и Nuxt.

В конце прошлой статьи прототип Mini App начал открываться и показывать объект пользователя из init data, который Telegram инжектит в приложение. Однако эти данные пока нельзя было использовать. Кто угодно мог подсунуть приложению поддельную строку init data, и приложению необходимо убедиться в её достоверности. Чтобы сделать её валидацию, приложению необходимо для начала добавить отсутствующий ранее бэкенд.

## Бэкенд: Dotnet Web API Host

Бэкенд — это новый хост, который будет работать с API-запросами, приходящими со стороны фронтенда Laraue Boards. Его название — `WebApiHost` — коррелирует с выполняемой функцией. Хост уже упоминался в [статье про архитектуру бэкенда](clean-dotnet-telegram-bot-architecture), но не существовал на момент её написания. Теперь же [`WebApiHost`](https://github.com/Laraue/Laraue.Apps.Boards/tree/main/src/Laraue.Apps.Boards.WebApiHost) добавлен в репозиторий.

Новый бэкенд делит с `TelegramHost` общий код — здесь используются те же модели из `DataAccess`, те же core-сервисы из `Services`. База, соответственно, тоже используется одна на два сервиса — это не совсем микросервисный подход, но смысла переусложнять архитектуру на данном этапе — нет. Создание issue из web API содержит ту же базовую логику, что и создание из Telegram. Новым здесь является слой сервисов для web API и сам хост.

Класс [`Program.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/Program.cs) хоста небольшой и по большей части повторяет шаблон web API на ASP.NET Core, с двумя добавлениями, важными для этой статьи: аутентификацией и CORS.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<TelegramOptions>();
builder.Services.Configure<TelegramOptions>(
    builder.Configuration.GetSection("Telegram"));

const string dbConnectionStringName = "Postgre";

builder.Services.AddAuthorization();
builder
    .AddAuthentication()
    .AddApplicationServices()
    .AddDatabaseServices(dbConnectionStringName);

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Services.UseLinq2Db();
app.UseMiddleware<ExceptionHandleMiddleware>();

using (var scope = app.Services.CreateScope())
{
    await using var db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    await db.Database.MigrateAsync();
}

var origins = builder
    .Configuration
    .GetSection("Cors:Hosts")
    .Get<string[]>();

if (origins is not null)
{
    app.UseCors(corsPolicyBuilder =>
        corsPolicyBuilder.WithOrigins(origins)
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader());
}

app.MapHealthChecks("/_health");

app.Run();
```

Большая часть этого кода такая же, как и в `TelegramHost`, и объяснялась ранее. `TelegramOptions` содержат токен бота — web API он понадобится для валидации init data. `AddDatabaseServices` регистрирует тот же слой данных, что и у бота; блок миграции на старте и `MapHealthChecks("/_health")` — те же паттерны, что в хосте бота; `app.Services.UseLinq2Db()` — та же связка EF Core и linq2db из [статьи про архитектуру бэкенда](clean-dotnet-telegram-bot-architecture).

Новыми здесь являются пара строк: `AddAuthentication()` / `UseAuthentication()` и блок с `UseCors()`. Аутентификация понадобится для создания Bearer токена для приложения, после того как init data от Telegram будет проверена, а настройка CORS необходима для локальной разработки — подробное описание можно будет найти в конце статьи.

### Деление сервисов на Core и Host специфичные

`AddApplicationServices` не является общим методом для всех хостов — у web API [`AddApplicationServices`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/WebApplicationBuilderExtensions.cs) свой. Предназначение такого метода - зарегистрировать специфичные для хоста сервисы и вызвать регистрацию общих (core) сервисов. 

`ExceptionHandleMiddleware` — кастомный middleware из нашей общей сборки [Laraue.Core](https://github.com/Laraue/Laraue.Core), который автоматически маппит веб-исключения библиотеки на HTTP-коды. Если в коде выбрасывается необработанное исключение `BadRequestException` — клиенту возвращается ошибка `400`, `ForbiddenException` превращается в `403`, и так далее.

## Валидация init data Telegram Mini App и вход пользователя

Прежде чем переходить к коду — определим последовательность шагов при логине из Mini App:

1. Приложение проверяет, запущено ли оно внутри Telegram. Для этого нужно удостовериться, что init data доступен (плагин [`auth.init.ts`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/plugins/auth.init.ts) из прошлой статьи).
2. Отправляем init data на эндпоинт аутентификации web API.
3. Бэкенд валидирует подпись init data по токену бота и возвращает авторизационный **bearer-токен**.
4. Фронтенд сохраняет bearer в local storage.
5. Фронтенд запрашивает у бэкенда информацию о пользователе с полученным ранее bearer.
6. Бэкенд находит пользователя в базе и возвращает его данные.
7. Фронтенд кладёт информацию о пользователя в общий composable `appState.ts`.

После этого каждый вызов бэкенда происходит с добавлением авторизационного заголовка с bearer, и любой компонент может читать поля пользователя из общего стейта. Теперь разберём каждый шаг по порядку.

### Шаги 1–2: фронтенд отправляет init data

Триггером является стартовый плагин из прошлой статьи [`auth.init.ts`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/plugins/auth.init.ts). Это плагин Nuxt из директории `/app/plugins`, который запускается автоматически при загрузке приложения. В первой версии плагин просто устанавливал объект пользователя в `appState` из доступной init data: `setUser(WebApp.initData)`. Теперь же init data отправляется на бэкенд для валидации.

Каждому контроллеру бэкенда соответствует composable на фронтенде, которые определяют вызовы эндпоинтов как типизированные функции. Например, так выглядит `loadUser` в `userApi.ts`, вызывающий метод бэкенда `GET /user` и возвращающий `UserDto`:

```ts
export const useUserApi = () => {
    const client = useUserClient();

    const loadUser = () => {
        return client<UserDto>('/user', {
            method: 'GET'
        });
    }
    // ...
}
```

Сам `client` конфигурируется в отдельном классе `userClient.ts`. Здесь происходит установка базового адреса из настроек приложения и используется клиент, работающий с авторизационными заголовками:

```ts
export const useUserClient = () => {
    const configuration = useRuntimeConfig();
    const { createClient } = useUserAuthApi();
    return createClient(configuration.public.messagesBaseAddress);
}
```

`useUserAuthApi` собственно и создаёт клиент и задаёт его поведение. Именно здесь из localStorage в запросы автоматически добавляется bearer:

```ts
export const useUserAuthApi = () => {
    const { getUserToken } = useLocalStorageUtils();

    const createClient = (baseURL: string) => $fetch.create({
        baseURL: baseURL,
        headers: {
            Authorization: `Bearer ${getUserToken()}`
        },
        // ...
    })

    return { createClient }
}
```

То есть архитектура такая: `userApi` знает, *что* вызывать (эндпоинты и их формы), а `userClient`/`useUserAuthApi` знают, *как* общаться с API (базовый адрес и заголовок с bearer). Адрес `messagesBaseAddress` берётся из рантайм-конфигурации Nuxt в [`nuxt.config.ts`](https://github.com/Laraue/laraue-boards/blob/master/nuxt.config.ts), куда он подставляется из переменной окружения:

```ts
runtimeConfig: {
    public: {
        messagesBaseAddress: process.env.NUXT_PUBLIC_MESSAGES_BASE_ADDRESS
    }
}
```

### Шаг 3: бэкенд валидирует initData (хеш и auth_date)

Перейдем к серверной части. Фронтенд отправил на нее строку `initData` — это Encoded строка с данными пользователя с подписью Telegram. Задача бэкенда — используя ключ от бота проверить, правильная ли установлена подпись и вернуть bearer токен для авторизации.

> Подход с init data работает только с авторизацией через Telegram Mini App. Telegram также поддерживает вход с обычного сайта через виджет «Log In with Telegram» — но это отдельный механизм, разбирающийся в стате о [логине через виджет](telegram-login-widget-dotnet-auth).

Запрос приходит в [`TelegramAuthController`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/Controllers/TelegramAuthController.cs), который принимает request с init data и проксирует его во внутренний сервис:

```csharp
[ApiController]
[Route("/api/user")]
public class TelegramAuthController(
    ITelegramAuthService authService,
    IWebHostEnvironment environment)
    : ControllerBase
{
    [HttpPost("auth-via-mini-app")]
    public async Task<string> Authenticate(
        [FromBody] AuthenticateViaStringInitDataRequest request,
        CancellationToken cancellationToken)
    {
        var token = await authService.Authenticate(request, cancellationToken);
        AuthCookies.Append(Response, AuthCookies.User, token, environment);
        return token;
    }
}
```

Актуальный контроллер ещё кладёт токен в cookie (`AuthCookies.Append`); эта статья идёт по пути, где фронтенд хранит bearer в local storage, так что эту строку можно пропустить. [`TelegramAuthService`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/TelegramAuthService.cs) выполняет две операции: валидирует init data и выпускает токен для проверенного пользователя.

```csharp
public Task<string> Authenticate(
    AuthenticateViaStringInitDataRequest request,
    CancellationToken cancellationToken)
{
    var userData = ValidateInitData(request.InitData);
    return CreateBearerToken(userData, cancellationToken);
}
```

Задача метода валидации — получить хэш от всех пользовательских данных, используя секретный ключ от бота, и сравнить его с тем хэшем, что использовался для подписи в объекте init data. Если хэши совпадают - данные настоящие и им можно доверять.

```csharp
private MiniAppUser ValidateInitData(string initData)
{
    var parsedData = HttpUtility.ParseQueryString(initData);
    var receivedHash = parsedData["hash"];
    parsedData.Remove("hash");

    if (string.IsNullOrEmpty(receivedHash))
        throw new ForbiddenException("Hash is missing");

    var generatedHash = BuildHash(parsedData);

    var result = generatedHash.Equals(receivedHash, StringComparison.OrdinalIgnoreCase);
    if (!result)
        throw new ForbiddenException("Hash mismatch");

    // Хеш покрывает auth_date, поэтому ему можно доверять
    if (!long.TryParse(parsedData["auth_date"], out var authDate))
        throw new ForbiddenException("Auth date is missing");

    EnsureAuthIsFresh(authDate);

    var user = parsedData["user"];
    return JsonSerializer.Deserialize<MiniAppUser>(user!, JsonBotAPI.Options)!;
}

public string BuildHash(NameValueCollection collection)
{
    var sortedKeys = collection.AllKeys.OrderBy(key => key, StringComparer.Ordinal).ToList();
    var dataCheckStrings = sortedKeys.Select(key => $"{key}={collection[key]}");
    var dataCheckString = string.Join("\n", dataCheckStrings);

    var secretKey = HMACSHA256.HashData(
        "WebAppData"u8.ToArray(),
        Encoding.UTF8.GetBytes(options.Value.Token));

    var generatedHashBytes = HMACSHA256.HashData(
        secretKey,
        Encoding.UTF8.GetBytes(dataCheckString));

    var generatedHash = Convert.ToHexString(generatedHashBytes).ToLower();
    return generatedHash;
}
```

`BuildHash` следует алгоритму Telegram из документации:

1. **Собрать data-check-string.** Взять каждое поле из init data, кроме hash, отсортировать ключи по алфавиту, сделать из каждого поля строку в формате `key=value`, соединить строки в одну с разделителем `\n`.
2. **Получить секретный ключ.** Секретный ключ — это `HMAC-SHA256` от токена бота, где ключом HMAC служит строка `"WebAppData"`. Ключ и данные легко перепутать: `"WebAppData"` — это ключ, а токен бота — данные.
3. **Вычислить подпись.** Прогнать `HMAC-SHA256` по data-check-string с полученным в пункте 2 секретным ключом и перевести результат в hex-строку.

Если хеш, вычисленный сервером, совпадает с хешем от Telegram — данные подлинные. Тогда сервис проверяет `auth_date` (см. ниже), десериализует поле `user` в `MiniAppUser` и считает запрос корректным. Любые отличия приведут к исключению `ForbiddenException`, и клиент получит код `403`.

#### Отклоняем устаревшие данные: проверка `auth_date`

Верный хеш доказывает, что строку создал Telegram. Он не доказывает, что строка свежая. Кто угодно, получивший копию init data пользователя (из лога, прокси или скриншота), может отправить её ещё раз, и хеш всё равно совпадёт. Документация Telegram рекомендует проверять поле `auth_date` — Unix-время создания данных — и отклонять устаревшие. В первой версии нашего кода этой проверки не было; позже мы добавили её с тем же лимитом в 24 часа, который уже был у входа через виджет:

```csharp
private static readonly TimeSpan MaxAuthAge = TimeSpan.FromHours(24);

private static void EnsureAuthIsFresh(long authDate)
{
    var authAge = DateTimeOffset.UtcNow - DateTimeOffset.FromUnixTimeSeconds(authDate);
    if (authAge > MaxAuthAge)
        throw new ForbiddenException("Auth is expired");
}
```

Важны две детали. Во-первых, проверка идёт после сравнения хеша: `auth_date` можно считать достоверным, только когда хеш подтвердил, что он входит в подписанное Telegram. Во-вторых, есть компромисс: init data создаются при открытии Mini App и не меняются, пока его не откроют заново. Если пользователь держит приложение открытым больше суток и ему снова нужно войти, старая строка будет отклонена, и приложение придётся открыть заново. Мы с этим согласились. Если ваши пользователи держат приложение открытым днями, лимит меняется одной константой.

Интеграционные тесты покрывают три случая: свежие init data принимаются, данные старше суток дают `403`, данные без `auth_date` дают `403`. Тест сам подписывает данные, а не использует боевой метод хеширования, поэтому ошибка в боевом коде не спрячется в тесте.

#### Две заметки: сравнение за постоянное время и проверка для третьей стороны

Сравнение выше использует `Equals(..., StringComparison.OrdinalIgnoreCase)` ради читаемости. Хеши безопаснее сравнивать побайтово за постоянное время через `CryptographicOperations.FixedTimeEquals`: по времени выполнения тогда нельзя понять, сколько первых символов совпало. В нашем коде осталась простая форма; в более открытом сервисе используйте вариант с постоянным временем.

Проверка `hash` требует токен бота, поэтому выполнить её может только ваш бэкенд. Telegram также добавляет в init data поле `signature` — подпись Ed25519, которую третья сторона может проверить, зная только ID вашего бота и публичный ключ Telegram, без токена. Data-check-string для неё начинается с `<bot_id>:WebAppData`. Это нужно, когда init data передают другому сервису. Нам это не нужно, потому что токен есть у нашего бэкенда, поэтому мы это не используем. Точный формат и публичные ключи смотрите в разделе «Validating data for Third-Party Use» [документации Telegram по Mini Apps](https://core.telegram.org/bots/webapps). Какой бы библиотекой для Ed25519 вы ни пользовались, проверка `auth_date` из примера выше нужна и здесь.

### Шаг 4: бэкенд выпускает bearer, фронтенд сохраняет его в local storage

Работать с `initData` при каждом запросе было бы расточительно, поэтому сервер выпускает **bearer-токен** для дальнейшего авторизованного взаимодействия с ним.

#### Выпуск токена и авторегистрация пользователя при первом взаимодействии

Как только `ValidateInitData` подтвердил, что пользователь настоящий, `Authenticate` вызывает `CreateBearerToken`, чтобы создать токен с его идентификатором:

```csharp
private async Task<string> CreateBearerToken(
    MiniAppUser userData, CancellationToken cancellationToken)
{
    var data = await context.Users
        .Where(x => x.TelegramId == userData.Id)
        .Select(x => new { x.Id, x.TokenVersion })
        .FirstOrDefaultAsyncEF(cancellationToken);

    if (data is not null)
        return authService.CreateUserToken(data.Id, data.TokenVersion);

    var newUserId = await RegisterUser(userData, cancellationToken);
    return authService.CreateUserToken(newUserId, tokenVersion: 0);
}
```

`CreateBearerToken` способен автоматически выполнять регистрацию пользователя. Он ищет пользователя по Telegram ID, находившемся в init data; если такой найден — выпускает токен для него, если нет — регистрирует пользователя, затем выпускает токен. То есть отдельного шага регистрации приложением не предусмотрено.

Сам токен выпускает сервис `AuthService`, подписывая его секретом `Auth__Key` из конфигурации приложения. Это стандартный JWT с двумя claim: внутренним ID пользователя и версией токена пользователя:

```csharp
public string CreateUserToken(Guid userId, int tokenVersion)
{
    var claims = new List<Claim>
    {
        new("id", userId.ToString()),
        new(TokenVersionClaim, tokenVersion.ToString()),
    };

    var jwt = new JwtSecurityToken(
        issuer: Issuer,
        audience: UserAudience,
        claims: claims,
        signingCredentials: new SigningCredentials(
            GetSymmetricSecurityKey(options.Value.Key),
            SecurityAlgorithms.HmacSha256));

    return new JwtSecurityTokenHandler().WriteToken(jwt);
}

public static SymmetricSecurityKey GetSymmetricSecurityKey(string key)
{
    return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
}
```

Claim `tv` — это `TokenVersion` пользователя на момент выпуска токена. Токен с версией старее текущей версии пользователя отклоняется, поэтому все токены пользователя можно отозвать одним действием, например после слияния двух аккаунтов. В первой версии этого кода был только claim `id`, версию добавили позже.

#### Как bearer используется для аутентификации каждого следующего запроса

Строки `AddAuthentication()` и `UseAuthentication()` в `Program.cs` отвечают за проверку bearer. JWT выпускается под именованной *схемой* аутентификации, которая объясняет, как валидировать токен такого рода — какой issuer и audience ожидать и каким ключом проверять подпись. `AddAuthentication()` регистрирует схему, `UseAuthentication()` добавляет middleware в пайплайн запроса, и когда приходит запрос с заголовком `Authorization: Bearer <token>`, он проверяет подпись, проверяет issuer/audience/срок жизни токена и, если данные корректны — собирает объект `ClaimsPrincipal` из его claims и присваивает его в проперти базового контроллера `HttpContext.User`. Отсутствующий, просроченный или подписанный не тем ключом токен отклоняется с `401` ещё до того, как выполнится код любого метода контроллера, помеченного атрибутом `[Authorize]`.

Таким образом любой контроллер, наследующий `ControllerBase`, может обращаться к объекту `HttpContext.User` в своих методах, помеченных `[Authorize]`:

```csharp
[HttpGet]
public Task<UserDto> GetAsync(CancellationToken ct)
{
    return service.GetUser(HttpContext.User.GetId(), ct);
}
```

`HttpContext.User` — это `ClaimsPrincipal`, который middleware собрал из bearer, а `GetId()` — небольшое расширение, которое достаёт ID пользователя обратно из claim `id`, зашитого в токен при логине:

```csharp
public static Guid GetId(this ClaimsPrincipal claimsPrincipal)
{
    var id = claimsPrincipal.FindFirstValue("id");
    return Guid.Parse(id!);
}
```

Bearer в данном решении — один подписанный JWT, без использования связки «короткоживущий access + долгоживущий refresh токены», которая используется в крупных продакшн приложениях. Мы придерживаемся подхода — всему свое время и не хотим потратить кучу времени на защиту приложения, которым пока пользуется малое количество пользователей.

### Шаги 5–7: загружаем данные пользователя и кладем их в стейт приложения

Сохранение токена — тонкая обёртка над local storage браузера:

```ts
const userTokenKey = 'bearer'

const getUserToken = () => localStorage.getItem(userTokenKey)
const setUserToken = async (bearerToken: string) =>
    localStorage.setItem(userTokenKey, bearerToken)
```

После сохранения токена приложение загружает пользователя — вызов `loadUser` через `GET /user`, на который `UserController` отвечает, читая `HttpContext.User.GetId()`. Результат приходит как `UserDto` (имя, язык, цвет, аватар, инициалы, настройки пользователя). Мы не храним эти данные в bearer токене, потому что это увеличило бы его размер и усложнило бы логику обновления пользовательских данных (пришлось бы реализовывать отзыв старых токенов после обновления данных).

Две функции в composable `auth.ts` используются для работы с аутентификацией:

```ts
const initUserWithBearer = async (bearerToken: string) => {
    await setUserToken(bearerToken)
    const { loadUser } = useUserApi();
    const user = await loadUser();
    await initUserWithUserData(user);
}

const tryAuthWithStoredBearer = async () => {
    const { getUserToken } = useLocalStorageUtils()
    const bearer = getUserToken()

    if (!bearer)
        return false

    const { loadUser } = useUserApi();
    try {
        const user = await loadUser();
        await initUserWithUserData(user);
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
```

`initUserWithBearer` вызывается после логина и отвечает за шаги 4–7: сохранить bearer, вызвать `loadUser`, чтобы забрать `UserDto`, и передать его в `initUserWithUserData`, который устанавливает данные пользователя в общий composable `appState`.

`tryAuthWithStoredBearer` — вызывается из плагина при загрузке приложения. Это оптимизация для повторных заходов. Если в local storage уже есть bearer из прошлой сессии, то приложение сразу переходит к загрузке пользователя, пропуская шаг авторизации через init data. Но если сохранённого токена нет, или он просрочился (вызов `loadUser` падает с `401`), приложение выполняет полный флоу авторизации. За счёт этого повторное открытие Mini App выполняется быстрее.

Итак, теперь мы имеем проверенные данные о пользователе в `appState`, осталось задеплоить новый хост и убедиться, что на сервере все работает также.

## Добавляем web API хост в Docker Compose

Поскольку web API хост с минимальным флоу аутентификации готов, можно приступать к его настройке: поднимать его будем на том же VPS где работает и `TelegramHost`. Необходимо сделать такую конфигурацию, чтобы API-вызовы от фронтенда попадали в этот хост. Добавляем конфигурацию сервиса в файл `docker-compose`, рядом с контейнерами Telegram бота и PostgreSQL:

```yaml
structuredmessageswebapihost:
  build:
    context: .
    dockerfile: "StructuredMessagesWebapiHostDockerfile"
  expose:
    - "5007"
  ports:
    - "8087:5007"
  restart: always
  environment:
    ASPNETCORE_ENVIRONMENT: "Production"
    Kestrel__EndPoints__Http__Url: "http://+:5007"
    Telegram__Token: "TokenHere"
    ConnectionStrings__Postgre: "User ID=PostgresUser;Password=PostgresPass;Host=postgres;Port=5432;Database=laraue_messages_board;Command Timeout=0;"
    Auth__Key: "SecretKeyHere"
    Logging__LogLevel__Default: "Warning"
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - dockerapi-dev
  deploy:
    resources:
      limits:
        memory: 256M
  healthcheck:
    test: ["CMD-SHELL", "curl -fsS http://localhost:5007/_health || exit 1"]
    interval: 5s
    timeout: 3s
    retries: 10
    start_period: 10s
```

Dockerfile, из которого собирается контейнер, почти ничем не отличается от контейнера с ботом, меняются только пути:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY structured-messages-webapi-host app
WORKDIR app
ENTRYPOINT ["dotnet", "Laraue.Apps.StructuredMessages.WebApiHost.dll"]
```

Конфигурация Dockerfile по большей части повторяет уже описанное в [статье про деплой](deploying-dotnet-postgres-vps-docker-compose): runtime-образ .NET и установленный `curl`, чтобы healthcheck контейнера мог запускаться. С `docker-compose` все тоже аналогично — лимит памяти, `curl`-healthcheck адреса `/_health` и `depends_on`, заставляющий сервис ожидать запуск Postgres до того как стартовать.

Немного о переменных окружения специфичных для хоста. `Telegram__Token` — токен бота от `@BotFather`, который web API нужен, чтобы валидировать init data. `Auth__Key` — секрет для подписи JWT-bearer-токенов, которые он выпускает. `Cors__Hosts__0/1/2` — разрешённые CORS — список хостов, которые могут обращаться к данному бэкенду.

## Маршрутизируем api запросы на web API хост в nginx

В server-блок `nginx.conf` добавляется блоки `location`, которые говорят, что если запрос пришел на `{servername}/api/notes-board/{0}`, его должен обработать хост web API по адресу `/api/{0}`:

```nginx
location ^~ /api/notes-board {
    set $upstream http://structuredmessageswebapihost:5007;
    rewrite ^/api/notes-board/(.*)$ /api/$1 break;
    proxy_pass         $upstream;
    proxy_next_upstream error timeout http_502 http_503 http_504;
    proxy_next_upstream_tries 5;
    proxy_next_upstream_timeout 30s;
}
```

Как итог, фронтенд вызывает адрес `/api/notes-board/user` на своём же origin (`boards.laraue.com`), а nginx вызывает `/api/user` бэкенд хоста.

## CORS: настройка для локальной разработке

CORS — Cross-Origin Resource Sharing — это механизм безопасности браузера. По умолчанию браузер отказывается давать странице с одного origin читать ответы с другого origin, где «origin» — это сочетание схемы, хоста и порта (`https://boards.laraue.com` — один origin; `https://abc123.ngrok-free.app` — другой).

Мы можем задавать исключения из этих правил. Когда сервер *хочет* разрешить конкретным другим origin обращаться к нему, он заявляет об этом, возвращая заголовки — `Access-Control-Allow-Origin` и связанные с ним, — origins, которым он доверяет. Это и делает блок `UseCors(...)` в `Program.cs`: читает список разрешённых origin из конфигурации и сообщает браузеру, что запросы с этих origin разрешены.

В проде фронтенд и API делят один origin. Приложение раздаётся с `boards.laraue.com`, и его API-вызовы идут на `boards.laraue.com/api/notes-board/...` — тот же origin, так что с точки зрения браузера валидно, дополнительно CORS настраивать не требуется.

Локальная разработка вносит коррективы. Как описано в [прошлой статье](deploy-nuxt-telegram-mini-app-https-nginx), мы тестируем Mini App локально с помощью ngrok, а ngrok выдаёт фронтенду и бэкенду *два разных* публичных URL. Их origins различаются, поэтому браузер блокирует подобные запросы. При запуске Mini App это выглядит, как **белый экран**, на котором ничего не происходит. Приложение грузится, шлёт первый API-запрос, ничего не получает в ответ и так и не рендерится. Чтобы это пофиксить — необходимо добавить текущий ngrok-адрес фронтенда в разрешённые origin бэкенда, в список `Cors__Hosts`, который web API читает при запуске.

## Итоги

С визуальной точки зрения точки зрения Mini App почти не изменился: приложение открывается и показывает какой-то набор данных пользователя. Но теперь эти данным можно доверять — а значит мы можем начинать разрабатывать реальную функциональность приложения, которая ранее требовала аутентификации.

## Что дальше

Следующая статья описывает первую реальную фичу веб-приложения: работа с issues. Мы превратим прототип Laraue Boards из сгенерированного AI HTML-шаблона в настоящие Vue-компоненты, работающие с бэкендом по API и расскажем о первой продуктовой ошибке, обнаруженной после того, как приложение попробовали первые реальные пользователи.