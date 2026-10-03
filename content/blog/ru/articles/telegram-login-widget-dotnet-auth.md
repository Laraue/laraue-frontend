---
title: Telegram Login Widget vs авторизация через Mini App в .NET — две схемы валидации, один JWT
description: Часть 13 цикла о разработке Telegram-таск-трекера в одиночку. Как добавить вход через Telegram Login Widget в веб-приложение на .NET и Nuxt рядом с Mini App: привязка домена в BotFather, валидация данных виджета (другой секрет, чем у init data), отклонение устаревших данных по auth_date и выпуск того же JWT.
seoTitle: Telegram Login Widget и Mini App в .NET: один JWT
seoDescription: Как добавить вход через Telegram Login Widget в .NET веб-приложение рядом с Mini App: /setdomain, проверка хеша, auth_date, один JWT.
type: article
series: architecture-first
part: 13
createdAt: 2026-07-01
updatedAt: 2026-10-03 18:02
projects: [boards]
tags: [devlog, dotnet, nuxt, telegram, authentication]
---

> **Architecture First: как в одиночку с ИИ сделать альтернативу Jira** — Часть 13.
> В [предыдущей статье](telegram-media-group-album-bot) была доделана последняя функциональность, запланированная в MVP бота. Здесь мы переходим к веб-версии, о которой просили пользователи. Чтобы её выпустить, приложению сначала нужна авторизация, работающая вне Telegram Mini App.

## Краткое содержание

Как добавить вход через Telegram в веб-версию рядом с Mini App:

1. Привяжите домен сайта к боту: отправьте `@BotFather` команду `/setdomain`. Виджет работает только на этом домене.
2. Добавьте скрипт виджета на страницу входа. После авторизации пользователя он вызывает ваш коллбэк с объектом: `id`, `first_name`, `last_name`, `username`, `photo_url`, `auth_date` и `hash`.
3. Отправьте объект на отдельный эндпоинт бэкенда. Подпись здесь не такая, как у init data Mini App: секретный ключ — это `SHA256(токен бота)`, а не HMAC с ключом `WebAppData`.
4. Вычислите `HMAC-SHA256` от data-check-string (поля по алфавиту в виде `key=value`, через `\n`, без `hash`), сравните с `hash` и отклоните `auth_date` старше 24 часов.
5. Выпустите тот же JWT, что и для Mini App. После входа приложение не зависит от Telegram.

> **Замечание о новом входе через Telegram.** У Telegram теперь есть и вход на основе OpenID Connect (библиотека Telegram Login: сервер проверяет JWT `id_token`), а iframe-виджет, о котором эта статья, в документации назван устаревшим (legacy); его документация перенесена в архив: [core.telegram.org/widgets/login-legacy](https://core.telegram.org/widgets/login-legacy). Мы используем legacy-виджет, поэтому статья описывает его. Архитектура у обоих вариантов одна: проверить личность в одном месте и выпустить собственный JWT.

До сих пор единственным вариантом логина оставался запуск Telegram Mini App, который авторизует клиента через данные, предоставленные Telegram. Однако, поступил фидбэк, что Mini App не всегда удобен для работы с приложением - пользователям хотелось иметь вкладку с досками в браузере под рукой. Веб-версия, открытая в браузере вне Telegram, не может полагаться на объект init data от Telegram, для аутентификации, как это происходило в случае с Mini App. Настройка авторизации веб-версии приложения через Telegram и является темой этой статьи. А еще расскажем о том, как в процессе работы над авторизацией, мы, наконец, поняли, что Telegram в нашей архитектуре не является core - функциональностью, а скорее - лишь одна из возможных интеграций.

## Telegram как один из провайдеров авторизации

Mini App выполняет авторизацию через init data Telegram, валидируемую на бэкенде, который затем выпускает JWT для приложения, — последовательность описана в [статье про авторизацию](telegram-mini-app-authentication-dotnet). Токен — это собственный bearer приложения, который содержит внутренний идентификатор пользователя, а не его Telegram ID. Каждый запрос после логина содержит этот JWT в заголовках. То есть для авторизованной сессии Telegram нужен только один раз — при получении Bearer токена.

Именно это делает добавление нового провайдера авторизации простым. Он просто должен провалидировать как-то личность пользователя и выпустить тот же JWT, — остальное приложение продолжит работать также, как и ранее, в Mini App версии.

## Отличия авторизации в веб-версии от авторизации через Telegram Mini App

У браузера, открытого вне Telegram, нет объекта init data, который есть в Mini App. Стандартный способ выполнить авторизацию через Telegram на веб-странице — [Telegram Login Widget](https://core.telegram.org/widgets/login-legacy): скрипт, который добавляет кнопку «Log in with Telegram» и возвращает объект пользователя при выполнении авторизации. [В исходниках](https://github.com/Laraue/laraue-boards/blob/master/app/pages/index.vue) можно увидеть, как обрабатывается подобный коллбэк:

```ts
(window as any).onTelegramAuth = async (user: any) => {
    const { authViaWebApp } = useTelegramUserApi()
    const bearer = await authViaWebApp(user)
    await initUserWithBearer(bearer)
};
```

Когда пользователь авторизуется через стандартное окно авторизации Telegram, виджет вызывает `onTelegramAuth` с подписанными данными, фронтенд отправляет их на бэкенд и получает bearer-токен — после чего [`initUserWithBearer`](https://github.com/Laraue/laraue-boards/blob/185cc189361ba9345913226c10616ab015e958b4/app/composables/auth.ts) приводит приложение ровно в то состояние, в которое привёл бы и логин через Mini App.

Чтобы виджет заработал на вашем сайте, домен нужно привязать к боту: отправьте `@BotFather` команду `/setdomain` ([инструкция Telegram](https://core.telegram.org/widgets/login-legacy#linking-your-domain-to-the-bot)). Виджет работает только на этом домене.

На бэкенде для авторизации через виджет сделан отдельный эндпоинт в ([`TelegramAuthController`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/Controllers/TelegramAuthController.cs)):

```csharp
[HttpPost("auth")]
public async Task<string> Authenticate(
    [FromBody] TelegramWidgetAuthRequest request,
    CancellationToken cancellationToken)
{
    var token = await authService.Authenticate(request, cancellationToken);
    AuthCookies.Append(Response, AuthCookies.User, token, environment);
    return token;
}
```

Актуальный контроллер ещё кладёт токен в cookie (`AuthCookies.Append`); эта статья идёт по пути, где фронтенд хранит bearer сам, так что эту строку можно пропустить. Причина, по которой это не тот же метод, что использовался ранее — данные виджета валидируются иначе, чем init data у Mini App. А еще init data - это Url-encoded строка с объектом пользователя, в то время как виджет отправляет на бэкенд обычный объект - то есть контракты в двух методах авторизации различаются.

Задача метода авторизации - подтвердить, что данные пришли от Telegram, но схема проверки подписи здесь отличается. Вот вариант для веб-версии — [`ValidateWidgetData`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.WebApiHost/TelegramAuthService.cs):

```csharp
private MiniAppUser ValidateWidgetData(TelegramWidgetAuthRequest request)
{
    // Reject stale auth — replay attack protection (24 hours, the same helper as in the Mini App path)
    EnsureAuthIsFresh(request.AuthDate);

    // Build data-check-string: all the fields Telegram sent, sorted alphabetically
    // (ordinal, like Telegram does), joined with \n, hash excluded
    var fields = new SortedDictionary<string, string>(StringComparer.Ordinal)
    {
        ["auth_date"] = request.AuthDate.ToString(),
        ["first_name"] = request.FirstName,
        ["id"] = request.Id.ToString(),
    };

    if (request.LastName is not null)
        fields["last_name"] = request.LastName;
    if (request.Username is not null)
        fields["username"]  = request.Username;
    if (request.PhotoUrl is not null)
        fields["photo_url"] = request.PhotoUrl;

    // The fields this version does not know are signed too: Telegram may add new ones
    foreach (var (name, value) in request.AdditionalFields ?? [])
        fields[name] = value.ValueKind == JsonValueKind.String ? value.GetString()! : value.GetRawText();

    var dataCheckString = string.Join("\n",
        fields.Select(kv => $"{kv.Key}={kv.Value}"));

    // Secret key = SHA256(botToken) — plain hash, not HMAC
    var secretKey = SHA256.HashData(Encoding.UTF8.GetBytes(options.Value.Token));

    // Signature = HMAC-SHA256(dataCheckString, secretKey)
    var computedHash = Convert.ToHexString(
        HMACSHA256.HashData(secretKey, Encoding.UTF8.GetBytes(dataCheckString))).ToLower();

    if (computedHash != request.Hash)
        throw new ForbiddenException("Authorization Failed");

    return new MiniAppUser
    {
        FirstName = request.FirstName,
        LastName = request.LastName,
        Id = request.Id,
        Username = request.Username,
        LanguageCode = null,
    };
}
```

Ключевое различие — в подписании. Виджет использует `SHA256(botToken)` в роли секрета, а затем `HMAC-SHA256(dataCheckString, secretKey)`; init data Mini App использует другой секрет — `HMAC(botToken)` с константой `WebAppData` в роли ключа. Из-за различий в авторизациях мы и решили разделить методы. Хотелось избежать классической ситуации в разработке: чиним одно - ломается другое. Правки одной из авторизаций не будут влиять на другую.

Остальные части у авторизаций похожи: собрать data-check-string из полей, отсортированных по алфавиту и соединённых через `\n` (hash исключён), и возвращать `403`, если `auth_date` старше 24 часов. Путь Mini App отклоняет устаревшие данные так же и тем же вспомогательным методом; почему это важно, объясняет [статья про аутентификацию](telegram-mini-app-authentication-dotnet). По правилу Telegram берутся все полученные поля, так код и делает: известные ему поля (`id`, `first_name`, `last_name`, `username`, `photo_url`, `auth_date`) плюс любые другие поля запроса, которые `[JsonExtensionData]` собирает в `AdditionalFields` класса запроса. Ранняя версия нашего кода перечисляла только известные поля, и в тот день, когда Telegram добавил бы новое поле в данные виджета, все входы отклонялись бы. Точные правила для виджета — в [документации Telegram](https://core.telegram.org/widgets/login-legacy#checking-authorization).

### Mini App и Login Widget: сравнение

| | Mini App | Login Widget |
|---|---|---|
| Где работает | Внутри Telegram | В любом браузере |
| Что получает бэкенд | `initData` — URL-encoded строка | Обычный объект с полями пользователя |
| Секретный ключ | `HMAC-SHA256` от токена бота с ключом `"WebAppData"` | `SHA256` от токена бота |
| Подпись | `HMAC-SHA256` от data-check-string | `HMAC-SHA256` от data-check-string |
| Свежесть | `auth_date`, 24 часа | `auth_date`, 24 часа |
| Эндпоинт | `POST /api/user/auth-via-mini-app` | `POST /api/user/auth` |
| Результат | Тот же JWT | Тот же JWT |

Так как `ValidateWidgetData` возвращает объект `MiniAppUser`, то дальше все работает точно так же как и в Mini App. Объект используется для выпуска JWT, который возвращается на фронтенд. Фронтенд добавляет заголовок `Aurhorization: Bearer {key}` при каждом вызове бэкенда — запрос считается авторизованным.

## После логина приложение не зависит от Telegram

Так как [приложение](https://boards.laraue.com) и так являлось публичным веб-адресом (просто скрытым от посторонних глаз, открывавшимся только из Telegram Mini App), оставалось поделиться им с пользователями. 

Как бонус, мы вдруг осознали, что приложение может работать в браузере и без Telegram (после логина). Получившаяся архитектура, которая отделяет внутренний `user_id` от `telegram_user_id` и системные `issues` от `telegram_messages`, позволяла в будущем добавить авторизацию через Google или создавать новые issues по сообщению из Slack, или выполнить еще какую-то интеграцию, не делая больших рефакторингов.

## Итоги

У веб-версии теперь есть авторизация, и её можно открыть в браузере — именно то, о чём просили пользователи. Добавление авторизации затронуло только один эндпоинт и один метод — `Authenticate` и `ValidateWidgetData` на бэкенде и страницу логина на фронтенде.

## Что дальше

Мы — разработчики и одновременно одни из самых активных пользователи Laraue Boards, столкнулись с неудобством — одних эпиков не хватало, чтобы разделять issues. Эпики, связанные с личной жизнью оказывались рядом с проектными активностями — хотелось это разделить. Решением стало добавление спейсов - групп эпиков относящихся к одному проекту. Таким образом можно было бы иметь отдельный спейс под личные активности и отдельный - под проектные.