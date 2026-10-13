---
title: JWT в HttpOnly-cookie вместо localStorage — авторизация через cookie в ASP.NET Core и Nuxt
description: Часть 24 цикла о разработке Telegram-таск-трекера небольшой командой. Как токен веб-приложения переехал из localStorage в HttpOnly-cookie: как ASP.NET Core читает JWT из cookie, что для этого понадобилось фронтенду на Nuxt, как настроить CORS и как мы упростили локальный запуск проекта.
seoTitle: JWT в HttpOnly-cookie в ASP.NET Core: SameSite и CORS
seoDescription: Часть 24: JWT в HttpOnly-cookie вместо localStorage в ASP.NET Core и Nuxt — параметры cookie, SameSite, CORS с credentials и пересылка cookie при SSR.
type: article
series: architecture-first
part: 24
createdAt: 2026-10-13 12:17
updatedAt: 2026-10-13 12:23
projects: [boards]
tags: [devlog, dotnet, nuxt, authentication, architecture]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 24.
> В [предыдущей статье](frontend-rewrite-nuxt-architecture-vitest) мы рассказали, как Николай переписал фронтенд. Ещё до этого он поменял несколько вещей в бэкенде: токен переехал в cookie, а проект стало проще запускать локально.

## Краткое содержание

Что поменялось в авторизации и локальном запуске:

1. Раньше веб-приложение хранило JWT в localStorage и отправляло его в заголовке `Authorization`. Теперь бэкенд кладёт токен в HttpOnly-cookie, и браузер сам отправляет его с каждым запросом.
2. Cookie две — для токена пользователя и для токена организации. Обе `HttpOnly`, `SameSite=Lax`, а за пределами локальной разработки ещё и `Secure`.
3. ASP.NET Core берёт токен из cookie. Заголовок `Authorization` после этой итерации больше не используется: и веб-приложение, и тесты авторизуются через cookie.
4. Фронтенд отправляет запросы с `credentials: 'include'`, а при серверном рендеринге Nuxt пересылает cookie входящего запроса в API.
5. В продакшене API живёт на том же домене, что и фронтенд, поэтому CORS нужен только для локальной разработки и для Telegram.
6. Для локального запуска появились `docker-compose.yml` с PostgreSQL и тестовые настройки разработки.

## Почему cookie, а не localStorage

После входа через Telegram бэкенд выдаёт JWT, и дальше этот токен должен приходить с каждым запросом. В первой версии фронтенд сохранял токен в localStorage и сам добавлял его в заголовок `Authorization`.

Николай предложил хранить токен в HttpOnly-cookie — сейчас это стандартный подход. Cookie с флагом `HttpOnly` недоступна JavaScript на странице: её нельзя прочитать через `document.cookie`, но браузер отправляет её с запросами сам. Фронтенду не нужно хранить токен и подставлять его в каждый запрос.

## Как бэкенд выдаёт cookie

Параметры cookie собраны в одном месте:

```csharp
public static class AuthCookies
{
    public const string User = "boards_user";
    public const string Organization = "boards_organization";

    public static void Append(HttpResponse response, string name, string token, IHostEnvironment environment)
    {
        response.Cookies.Append(name, token, Options(environment));
    }

    public static void Delete(HttpResponse response, IHostEnvironment environment)
    {
        var options = Options(environment);
        response.Cookies.Delete(User, options);
        response.Cookies.Delete(Organization, options);
    }

    private static CookieOptions Options(IHostEnvironment environment) => new()
    {
        HttpOnly = true,
        IsEssential = true,
        Path = "/",
        SameSite = SameSiteMode.Lax,
        Secure = !environment.IsDevelopment(),
        MaxAge = TimeSpan.FromDays(365),
    };
}
```

Cookie две, потому что токенов два: токен пользователя и токен организации, который выдаётся при входе в организацию (об этом была [часть 16](multi-tenancy-saas-task-tracker-organizations)).

Что значат параметры:

- `HttpOnly` — JavaScript на странице не может прочитать cookie.
- `SameSite=Lax` — браузер не отправляет cookie с запросами, которые инициирует чужой сайт (например, с формой или картинкой на другом домене), но отправляет при обычном переходе по ссылке на наш сайт.
- `Secure` — cookie уходит только по HTTPS. Локально проект работает по HTTP, поэтому в режиме разработки флаг выключен.
- `MaxAge` — год: cookie живёт долго, и входить заново почти не приходится.

Эндпоинты входа через Telegram теперь не только возвращают токен, но и записывают его в cookie, а для выхода появился отдельный эндпоинт, который удаляет обе cookie:

```csharp
[HttpPost("logout")]
public IActionResult Logout()
{
    AuthCookies.Delete(Response, environment);
    return NoContent();
}
```

## Как ASP.NET Core читает JWT из cookie

По умолчанию `JwtBearer` ищет токен только в заголовке `Authorization`. Чтобы он брал токен из cookie, достаточно обработать событие `OnMessageReceived`:

```csharp
private static void ReadTokenFromCookie(JwtBearerOptions options, string cookie)
{
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies[cookie];
            return Task.CompletedTask;
        },
    };
}
```

Для схемы пользователя токен читается из cookie `boards_user`, для схемы организации — из `boards_organization`. Заголовок `Authorization` для авторизации больше не нужен.

## Что поменялось во фронтенде

Код, который сохранял токен в localStorage, из фронтенда убрали. Клиент API отправляет запросы с `credentials: 'include'`, чтобы браузер прикладывал cookie:

```ts
export const createApiClient = (baseUrl: string) =>
  createFetchClient<paths>({
    baseUrl,
    credentials: 'include',
    fetch: globalThis.fetch,
    headers: {
      // SSR fetch has no browser cookie jar; forward the incoming request's
      // cookie so the backend sees the session on full page loads/reloads.
      ...(import.meta.server ? useRequestHeaders(['cookie']) : {}),
    },
  })
```

Есть тонкость с серверным рендерингом. Когда Nuxt рендерит страницу на сервере, запрос к API отправляет уже не браузер, а сервер Nuxt, и своих cookie у него нет. Поэтому при рендеринге на сервере клиент берёт cookie из входящего запроса браузера и передаёт их в API. Иначе при полной перезагрузке страницы бэкенд не узнал бы пользователя.

## CORS

В продакшене фронтенд и API работают на одном домене: API доступен по пути `/boards-api` того же `boards.laraue.com`. Для браузера это один источник, и CORS для веб-приложения не нужен.

CORS нужен в двух случаях. При локальной разработке фронтенд работает на `localhost:3000`, а API — на другом порту, и для браузера это разные источники. А в продакшене в списке разрешённых источников указаны домены Telegram.

Список берётся из настроек, и к нему добавлен `AllowCredentials`: без него браузер не отправит cookie в запросе на другой источник.

```csharp
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
```

`AllowCredentials` нельзя совместить с разрешением для любого источника (`AllowAnyOrigin`), поэтому источники перечислены явно.

## Локальный запуск

Для локального запуска Николай добавил `docker-compose.yml` с PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: structured_messages
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Настройки для локального запуска API лежат в `appsettings.Development.json`: там разрешён CORS для `localhost:3000`, указаны тестовый токен бота и ключ для подписи JWT. А как запустить фронтенд вместе с бэкендом и войти с тестовыми данными мини-приложения Telegram, описано в README фронтенда.

## Итоги

- **Токен — в HttpOnly-cookie, а не в localStorage.** JavaScript на странице его не видит, а браузер отправляет его сам.
- **Две cookie для двух токенов.** Пользователь и организация, обе `HttpOnly`, `SameSite=Lax` и `Secure` вне локальной разработки.
- **Заголовок `Authorization` больше не нужен.** Токен передаётся только в cookie.
- **При SSR cookie пересылаются в API.** Иначе сервер Nuxt не знает, кто открыл страницу.
- **CORS только там, где он нужен.** В продакшене фронтенд и API на одном домене.
- **Локальный запуск стал проще.** PostgreSQL в Docker и готовые настройки разработки.

## Что дальше

Следующим шагом бот научился работать в групповых чатах Telegram: администратор привязывает чат к спейсу командой `/link`, а любой участник может превратить сообщение в задачу, ответив на него и упомянув бота. Об этом — следующая статья.
