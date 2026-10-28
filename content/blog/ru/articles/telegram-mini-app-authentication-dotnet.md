---
title: Аутентификация Telegram Mini App в .NET от и до — валидация initData, выпуск JWT и фронтенд на Nuxt
description: Часть 8 цикла о разработке Telegram-таск-трекера небольшой командой. Как аутентифицировать пользователя Telegram Mini App в .NET и Nuxt: проверка хеша initData через HMAC-SHA256, отклонение устаревших данных по auth_date, выпуск и использование JWT, пользователь из HttpContext и почему важен CORS.
seoTitle: Аутентификация Telegram Mini App в .NET: initData и JWT
seoDescription: Как провалидировать initData Telegram Mini App в .NET: хеш HMAC-SHA256, проверка auth_date, JWT и пользователь из HttpContext. Часть 8.
type: article
featured: true
series: architecture-first
part: 8
createdAt: 2026-06-24 08:00
updatedAt: 2026-10-28
projects: [boards]
tags: [devlog, dotnet, nuxt, telegram, authentication]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 8.
> В [предыдущей статье](deploy-nuxt-telegram-mini-app-https-nginx) мы добились того, что Mini App открывается внутри Telegram и показывает JSON с объектом пользователя. Но этим данным пока нельзя доверять. В этой статье мы делаем настоящую аутентификацию: добавляем приложению бэкенд и проверяем данные на его стороне.

## Краткое содержание

Как аутентифицировать пользователя Telegram Mini App в .NET:

1. Mini App отправляет на ваш бэкенд `Telegram.WebApp.initData` — строку запроса, подписанную Telegram.
2. Бэкенд собирает из полей строки (кроме `hash`) data-check-string, подписывает её через `HMAC-SHA256` ключом, полученным из токена бота, и сравнивает результат с полем `hash`.
3. Проверяет, что `auth_date` свежий, чтобы старую строку нельзя было отправить повторно.
4. Находит пользователя по Telegram ID (или регистрирует нового) и возвращает собственный JWT.
5. Фронтенд сохраняет JWT и отправляет его как bearer в каждом запросе к API; дальше работают `[Authorize]` и `HttpContext.User`.

Дальше разберём эти шаги по порядку на реальном приложении на .NET и Nuxt.

В конце прошлой статьи прототип Mini App начал открываться и показывать объект пользователя из init data, который Telegram передаёт в приложение. Но пользоваться этими данными было ещё нельзя: кто угодно мог подсунуть приложению поддельную строку init data, и её подлинность нужно проверять. А для проверки приложению сначала нужен бэкенд, которого до сих пор не было.

## Бэкенд: Dotnet Web API Host

Бэкенд — это новый хост, который обрабатывает API-запросы фронтенда Laraue Boards. Название `WebApiHost` говорит о том, что он делает. Хост уже упоминался в [статье про архитектуру бэкенда](clean-dotnet-telegram-bot-architecture), но тогда его ещё не было. Теперь [`WebApiHost`](https://github.com/Laraue/Laraue.Apps.Boards/tree/main/src/Laraue.Apps.Boards.WebApiHost) добавлен в репозиторий.

Новый бэкенд использует общий с `TelegramHost` код: те же модели из `DataAccess`, те же core-сервисы из `Services`. И база у двух сервисов одна. Это не совсем микросервисный подход, но усложнять архитектуру на этом этапе смысла нет. Создание issue из web API идёт по той же логике, что и из Telegram. Новые здесь только слой сервисов для web API и сам хост.

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

Новых здесь две вещи: `AddAuthentication()` / `UseAuthentication()` и блок с `UseCors()`. Аутентификация нужна, чтобы после проверки init data выдать приложению bearer-токен, а CORS — для локальной разработки, о нём в конце статьи.

### Деление сервисов на Core и Host специфичные

`AddApplicationServices` — не общий метод для всех хостов: у web API [`AddApplicationServices`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/WebApplicationBuilderExtensions.cs) свой. Он регистрирует сервисы этого хоста и вызывает регистрацию общих (core) сервисов.

`ExceptionHandleMiddleware` — кастомный middleware из нашей общей сборки [Laraue.Core](https://github.com/Laraue/Laraue.Core), который сам переводит веб-исключения библиотеки в HTTP-коды. Если в коде вылетает необработанное `BadRequestException`, клиент получает `400`, `ForbiddenException` превращается в `403`, и так далее.

## Валидация init data Telegram Mini App и вход пользователя

Прежде чем переходить к коду, опишем, из каких шагов состоит вход из Mini App:

1. Приложение проверяет, запущено ли оно внутри Telegram. Для этого достаточно убедиться, что init data доступны (плагин [`auth.init.ts`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/plugins/auth.init.ts) из прошлой статьи).
2. Отправляем init data на эндпоинт аутентификации web API.
3. Бэкенд проверяет подпись init data по токену бота и возвращает авторизационный **bearer-токен**.
4. Фронтенд сохраняет bearer в local storage.
5. Фронтенд запрашивает у бэкенда информацию о пользователе с полученным ранее bearer.
6. Бэкенд находит пользователя в базе и возвращает его данные.
7. Фронтенд кладёт данные пользователя в общий composable `appState.ts`.

После этого каждый запрос к бэкенду уходит с заголовком авторизации, а любой компонент может читать данные пользователя из общего стейта. Теперь разберём каждый шаг по порядку.

### Шаги 1–2: фронтенд отправляет init data

Всё начинается со стартового плагина из прошлой статьи [`auth.init.ts`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/plugins/auth.init.ts). Это плагин Nuxt из директории `/app/plugins`, который запускается автоматически при загрузке приложения. В первой версии плагин просто записывал объект пользователя из init data в `appState`: `setUser(WebApp.initData)`. Теперь init data уходят на бэкенд на проверку.

Каждому контроллеру бэкенда на фронтенде соответствует composable, в котором вызовы эндпоинтов описаны типизированными функциями. Например, так выглядит `loadUser` в `userApi.ts`: он вызывает `GET /user` и возвращает `UserDto`:

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

Сам `client` настраивается в отдельном файле `userClient.ts`: здесь задаётся базовый адрес из настроек приложения и подключается клиент, который добавляет заголовки авторизации:

```ts
export const useUserClient = () => {
    const configuration = useRuntimeConfig();
    const { createClient } = useUserAuthApi();
    return createClient(configuration.public.messagesBaseAddress);
}
```

`useUserAuthApi` создаёт клиент и задаёт его поведение. Именно здесь bearer из localStorage автоматически добавляется в запросы:

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

Перейдём к серверу. Фронтенд отправил ему строку `initData` — закодированные данные пользователя с подписью Telegram. Бэкенд должен с помощью токена бота проверить подпись и вернуть bearer-токен.

> Подход с init data работает только с авторизацией через Telegram Mini App. Telegram также поддерживает вход с обычного сайта через виджет «Log In with Telegram» — но это отдельный механизм, о нём — в статье о [входе через виджет](telegram-login-widget-dotnet-auth).

Запрос приходит в [`TelegramAuthController`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/Controllers/TelegramAuthController.cs), который принимает запрос с init data и передаёт его во внутренний сервис:

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

Актуальный контроллер ещё кладёт токен в cookie (`AuthCookies.Append`); эта статья идёт по пути, где фронтенд хранит bearer в local storage, так что эту строку можно пропустить. [`TelegramAuthService`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/TelegramAuthService.cs) делает две вещи: проверяет init data и выпускает токен для проверенного пользователя.

```csharp
public Task<string> Authenticate(
    AuthenticateViaStringInitDataRequest request,
    CancellationToken cancellationToken)
{
    var userData = ValidateInitData(request.InitData);
    return CreateBearerToken(userData, cancellationToken);
}
```

Метод проверки вычисляет хеш от всех данных пользователя с секретным ключом, полученным из токена бота, и сравнивает его с хешем из init data. Если хеши совпадают, данные настоящие и им можно доверять.

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

`BuildHash` повторяет алгоритм из документации Telegram:

1. **Собрать data-check-string.** Взять каждое поле из init data, кроме hash, отсортировать ключи по алфавиту, сделать из каждого поля строку в формате `key=value`, соединить строки в одну с разделителем `\n`.
2. **Получить секретный ключ.** Секретный ключ — это `HMAC-SHA256` от токена бота, где ключом HMAC служит строка `"WebAppData"`. Ключ и данные легко перепутать: `"WebAppData"` — это ключ, а токен бота — данные.
3. **Вычислить подпись.** Прогнать `HMAC-SHA256` по data-check-string с полученным в пункте 2 секретным ключом и перевести результат в hex-строку.

Если хеш, вычисленный сервером, совпадает с хешем от Telegram — данные подлинные. Тогда сервис проверяет `auth_date` (см. ниже), десериализует поле `user` в `MiniAppUser` и принимает запрос. При любом несовпадении выбрасывается `ForbiddenException`, и клиент получает `403`.

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

Важны две детали. Во-первых, проверка идёт после сравнения хеша: `auth_date` можно считать достоверным, только когда хеш подтвердил, что он входит в подписанное Telegram. Во-вторых, есть компромисс: init data создаются при открытии Mini App и не меняются, пока его не откроют заново. Если пользователь держит приложение открытым больше суток и ему снова нужно войти, старая строка будет отклонена, и приложение придётся открыть заново. Мы с этим согласились. Если приложение держат открытым днями, лимит меняется одной константой.

Интеграционные тесты покрывают три случая: свежие init data принимаются, данные старше суток дают `403`, данные без `auth_date` дают `403`. Тест подписывает данные сам, а не через боевой метод хеширования, поэтому ошибка в боевом коде не спрячется за тестом.

#### Две заметки: сравнение за постоянное время и проверка для третьей стороны

Сравнение выше использует `Equals(..., StringComparison.OrdinalIgnoreCase)` ради читаемости. Хеши безопаснее сравнивать побайтово за постоянное время через `CryptographicOperations.FixedTimeEquals`: по времени выполнения тогда нельзя понять, сколько первых символов совпало. В нашем коде осталась простая форма; для более открытого сервиса лучше подходит вариант с постоянным временем.

Проверка `hash` требует токен бота, поэтому выполнить её может только ваш бэкенд. Telegram также добавляет в init data поле `signature` — подпись Ed25519, которую третья сторона может проверить, зная только ID вашего бота и публичный ключ Telegram, без токена. Data-check-string для неё начинается с `<bot_id>:WebAppData`. Это нужно, когда init data передают другому сервису. У нашего бэкенда токен есть, поэтому эту проверку мы не используем. Точный формат и публичные ключи описаны в разделе «Validating data for Third-Party Use» [документации Telegram по Mini Apps](https://core.telegram.org/bots/webapps). Проверка `auth_date` из примера выше нужна и здесь, какой бы библиотекой для Ed25519 ни пользоваться.

### Шаг 4: бэкенд выпускает bearer, фронтенд сохраняет его в local storage

Проверять `initData` при каждом запросе было бы расточительно, поэтому сервер выпускает **bearer-токен**, с которым идут все следующие запросы.

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

`CreateBearerToken` заодно регистрирует пользователя. Он ищет пользователя по Telegram ID из init data: если находит — выпускает токен для него, если нет — сначала регистрирует, потом выпускает токен. Отдельного шага регистрации в приложении нет.

Сам токен выпускает `AuthService` и подписывает его секретом `Auth__Key` из конфигурации приложения. Это стандартный JWT с двумя claim: внутренним ID пользователя и версией токена пользователя:

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

Claim `tv` — это `TokenVersion` пользователя на момент выпуска токена. Токен, версия в котором меньше текущей версии пользователя, отклоняется, поэтому все токены пользователя можно отозвать одним действием, например после слияния двух аккаунтов. В первой версии этого кода был только claim `id`, версию добавили позже.

#### Как bearer используется для аутентификации каждого следующего запроса

Строки `AddAuthentication()` и `UseAuthentication()` в `Program.cs` отвечают за проверку bearer. JWT выпускается под именованной *схемой* аутентификации, которая описывает, как проверять такой токен: какие issuer и audience ожидать и каким ключом проверять подпись. `AddAuthentication()` регистрирует схему, `UseAuthentication()` добавляет middleware в пайплайн запроса, и когда приходит запрос с заголовком `Authorization: Bearer <token>`, middleware проверяет подпись, issuer, audience и срок жизни токена и, если всё в порядке, собирает из его claims объект `ClaimsPrincipal` и записывает его в `HttpContext.User`. Отсутствующий, просроченный или подписанный не тем ключом токен отклоняется с `401` ещё до того, как выполнится код любого метода контроллера, помеченного атрибутом `[Authorize]`.

Поэтому любой контроллер, унаследованный от `ControllerBase`, может читать `HttpContext.User` в методах, помеченных `[Authorize]`:

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

Bearer здесь — один подписанный JWT, без связки «короткоживущий access-токен + долгоживущий refresh-токен», как в крупных продакшн-приложениях. Всему своё время: мы не хотели тратить много сил на защиту приложения, которым пока пользуются немногие.

### Шаги 5–7: загружаем данные пользователя и кладем их в стейт приложения

Токен сохраняется через тонкую обёртку над local storage браузера:

```ts
const userTokenKey = 'bearer'

const getUserToken = () => localStorage.getItem(userTokenKey)
const setUserToken = async (bearerToken: string) =>
    localStorage.setItem(userTokenKey, bearerToken)
```

После сохранения токена приложение загружает пользователя — вызов `loadUser` через `GET /user`, на который `UserController` отвечает, читая `HttpContext.User.GetId()`. Результат приходит как `UserDto` (имя, язык, цвет, аватар, инициалы, настройки пользователя). Мы не храним эти данные в bearer-токене: он стал бы больше, а обновлять данные пользователя стало бы сложнее (после каждого изменения пришлось бы отзывать старые токены).

Аутентификацией занимаются две функции из composable `auth.ts`:

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

`initUserWithBearer` вызывается после входа и отвечает за шаги 4–7: сохраняет bearer, вызывает `loadUser`, чтобы получить `UserDto`, и передаёт его в `initUserWithUserData`, который записывает данные пользователя в общий composable `appState`.

`tryAuthWithStoredBearer` вызывается из плагина при загрузке приложения и ускоряет повторные заходы. Если в local storage уже есть bearer из прошлой сессии, приложение сразу загружает пользователя и пропускает вход через init data. Если же токена нет или он просрочен (`loadUser` падает с `401`), приложение проходит весь вход заново. Так повторное открытие Mini App получается быстрее.

Итак, в `appState` теперь проверенные данные пользователя. Осталось задеплоить новый хост и убедиться, что на сервере всё работает так же.

## Добавляем web API хост в Docker Compose

Хост web API с минимальной аутентификацией готов, и его можно разворачивать — на том же VPS, где работает `TelegramHost`. API-запросы фронтенда должны попадать в этот хост. Добавляем сервис в `docker-compose` рядом с контейнерами Telegram-бота и PostgreSQL:

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

Dockerfile почти не отличается от Dockerfile бота, меняются только пути:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY structured-messages-webapi-host app
WORKDIR app
ENTRYPOINT ["dotnet", "Laraue.Apps.StructuredMessages.WebApiHost.dll"]
```

Dockerfile в основном повторяет описанный в [статье про деплой](deploying-dotnet-postgres-vps-docker-compose): runtime-образ .NET и `curl` для healthcheck контейнера. В `docker-compose` всё так же: лимит памяти, healthcheck через `curl` к `/_health` и `depends_on`, из-за которого сервис ждёт запуска Postgres.

Несколько слов о переменных окружения этого хоста. `Telegram__Token` — токен бота от `@BotFather`, который web API нужен, чтобы валидировать init data. `Auth__Key` — секрет, которым он подписывает выпускаемые JWT. `Cors__Hosts__0/1/2` — список хостов, которым CORS разрешает обращаться к этому бэкенду.

## Маршрутизируем api запросы на web API хост в nginx

В server-блок `nginx.conf` добавляем блоки `location`: запрос на `{servername}/api/notes-board/{0}` должен обработать хост web API по адресу `/api/{0}`:

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

В итоге фронтенд обращается к `/api/notes-board/user` на своём же origin (`boards.laraue.com`), а nginx передаёт запрос на `/api/user` хоста бэкенда.

## CORS: настройка для локальной разработке

CORS — Cross-Origin Resource Sharing — это механизм безопасности браузера. По умолчанию браузер не даёт странице с одного origin читать ответы с другого, где «origin» — это сочетание схемы, хоста и порта (`https://boards.laraue.com` — один origin; `https://abc123.ngrok-free.app` — другой).

Из этого правила можно делать исключения. Если сервер *хочет* пустить к себе конкретные origin, он перечисляет их в заголовке `Access-Control-Allow-Origin` и связанных с ним. Это и делает блок `UseCors(...)` в `Program.cs`: читает список разрешённых origin из конфигурации и сообщает браузеру, что запросы с этих origin разрешены.

В проде фронтенд и API делят один origin. Приложение раздаётся с `boards.laraue.com`, и его API-вызовы идут на `boards.laraue.com/api/notes-board/...` — тот же origin, так что браузер такие запросы пропускает и настраивать CORS не нужно.

С локальной разработкой всё иначе. Как описано в [прошлой статье](deploy-nuxt-telegram-mini-app-https-nginx), мы тестируем Mini App локально с помощью ngrok, а ngrok выдаёт фронтенду и бэкенду *два разных* публичных URL. Origin у них разные, поэтому браузер такие запросы блокирует. В Mini App это выглядит как **белый экран**, на котором ничего не происходит: приложение грузится, отправляет первый API-запрос, не получает ответа и так и не отрисовывается. Чтобы это исправить, текущий ngrok-адрес фронтенда нужно добавить в разрешённые origin бэкенда — в список `Cors__Hosts`, который web API читает при запуске.

## Итоги

Внешне Mini App почти не изменился: приложение открывается и показывает данные пользователя. Но теперь этим данным можно доверять, а значит, можно браться за функциональность, для которой нужна аутентификация.

## Что дальше

Следующая статья — о первой настоящей функции веб-приложения: работе с issues. Мы превратим прототип Laraue Boards из HTML-шаблона, сгенерированного ИИ, в настоящие Vue-компоненты, которые работают с бэкендом по API, и расскажем о первой продуктовой ошибке, которую мы заметили, когда приложение попробовали первые реальные пользователи.