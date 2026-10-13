---
title: JWT in an HttpOnly cookie instead of localStorage — cookie authentication in ASP.NET Core and Nuxt
description: Part 24 of the series about building a Telegram task tracker in a tiny team. How the web app token moved from localStorage to an HttpOnly cookie: how ASP.NET Core reads a JWT from a cookie, what the Nuxt frontend needed for it, how to set up CORS, and how we made the project easier to run locally.
seoTitle: JWT in an HttpOnly Cookie in ASP.NET Core: SameSite and CORS
seoDescription: Part 24: a JWT in an HttpOnly cookie instead of localStorage in ASP.NET Core and Nuxt — cookie options, SameSite, CORS with credentials and cookies in SSR.
type: article
series: architecture-first
part: 24
createdAt: 2026-10-13 12:17
updatedAt: 2026-10-13 12:23
projects: [boards]
tags: [devlog, dotnet, nuxt, authentication, architecture]
---

> **Architecture First: Building a Jira Alternative in a Tiny Team, AI-Assisted** — Part 24.
> In the [previous article](frontend-rewrite-nuxt-architecture-vitest) we told how Nikolay rewrote the frontend. Even before that, he changed a few things in the backend: the token moved into a cookie, and the project became easier to run locally.

## The short version

What changed in authentication and local runs:

1. The web app used to keep the JWT in localStorage and send it in the `Authorization` header. Now the backend puts the token in an HttpOnly cookie, and the browser sends it with every request by itself.
2. There are two cookies, for the user token and for the organization token. Both are `HttpOnly` and `SameSite=Lax`, and outside local development also `Secure`.
3. ASP.NET Core takes the token from the cookie. After this iteration the `Authorization` header is no longer used: both the web app and the tests authenticate with cookies.
4. The frontend sends requests with `credentials: 'include'`, and during server-side rendering Nuxt forwards the incoming request's cookies to the API.
5. In production the API lives on the same domain as the frontend, so CORS is only needed for local development and for Telegram.
6. For local runs there is now a `docker-compose.yml` with PostgreSQL and development settings.

## Why a cookie and not localStorage

After a Telegram sign-in the backend issues a JWT, and every request then has to present it. In the first version the frontend saved the token in localStorage and added it to the `Authorization` header itself.

Nikolay suggested keeping the token in an HttpOnly cookie, which is the standard approach today. A cookie with the `HttpOnly` flag is not available to JavaScript on the page: it cannot be read through `document.cookie`, but the browser sends it with requests by itself. The frontend does not need to store the token or put it into every request.

## How the backend issues the cookie

The cookie options live in one place:

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

There are two cookies because there are two tokens: the user token and the organization token issued when a user enters an organization (that was [part 16](multi-tenancy-saas-task-tracker-organizations)).

What the options mean:

- `HttpOnly`: JavaScript on the page cannot read the cookie.
- `SameSite=Lax`: the browser does not send the cookie with requests initiated by another site (for example, a form or an image on another domain), but does send it on a regular link navigation to our site.
- `Secure`: the cookie is sent only over HTTPS. Locally the project runs over HTTP, so the flag is off in development mode.
- `MaxAge`: a year, so the cookie lives long and signing in again is rarely needed.

The Telegram sign-in endpoints now not only return the token but also write it to the cookie, and there is a separate endpoint for signing out that deletes both cookies:

```csharp
[HttpPost("logout")]
public IActionResult Logout()
{
    AuthCookies.Delete(Response, environment);
    return NoContent();
}
```

## How ASP.NET Core reads a JWT from a cookie

By default `JwtBearer` looks for the token only in the `Authorization` header. To make it take the token from a cookie, it is enough to handle the `OnMessageReceived` event:

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

For the user scheme the token is read from the `boards_user` cookie, for the organization scheme from `boards_organization`. The `Authorization` header is no longer needed for authentication.

The new behavior is pinned down by an integration test. It enters an organization with the user cookie, checks that the response set the organization cookie with the `HttpOnly` and `SameSite=Lax` flags, and that a request for spaces succeeds with that cookie:

```csharp
var setCookie = Assert.Single(
    loginResponse.Headers.GetValues("Set-Cookie"),
    value => value.StartsWith($"{AuthCookies.Organization}=", StringComparison.Ordinal));
Assert.Contains("httponly", setCookie, StringComparison.OrdinalIgnoreCase);
Assert.Contains("samesite=lax", setCookie, StringComparison.OrdinalIgnoreCase);

using var organizationClient = host.CreateClient();
organizationClient.DefaultRequestHeaders.Add("Cookie", setCookie.Split(';')[0]);
var spacesResponse = await organizationClient.GetAsync("/api/spaces");

Assert.Equal(HttpStatusCode.OK, spacesResponse.StatusCode);
```

## What changed in the frontend

The code that saved the token in localStorage was removed from the frontend. The API client sends requests with `credentials: 'include'` so the browser attaches the cookies:

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

There is a subtlety with server-side rendering. When Nuxt renders a page on the server, the request to the API is sent not by the browser but by the Nuxt server, which has no cookies of its own. So during server rendering the client takes the cookies from the browser's incoming request and passes them to the API. Otherwise, on a full page reload the backend would not recognize the user.

## CORS

In production the frontend and the API run on the same domain: the API is available under the `/boards-api` path of the same `boards.laraue.com`. For the browser that is one origin, and the web app does not need CORS.

CORS is needed in two cases. In local development the frontend runs on `localhost:3000` and the API on another port, which are different origins for the browser. And in production the list of allowed origins contains the Telegram domains.

The list comes from the settings, and `AllowCredentials` is added to it: without it the browser will not send cookies in a request to another origin.

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

`AllowCredentials` cannot be combined with allowing any origin (`AllowAnyOrigin`), so the origins are listed explicitly.

## Local runs

For local runs Nikolay added a `docker-compose.yml` with PostgreSQL:

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

And an `appsettings.Development.json` file with everything the API needs to start locally: CORS for `localhost:3000`, a test bot token and a key for signing JWTs. The frontend README describes how to run it next to the backend and how to sign in locally with test Telegram Mini App data.

## Results

- **The token lives in an HttpOnly cookie, not in localStorage.** JavaScript on the page cannot see it, and the browser sends it by itself.
- **Two cookies for two tokens.** User and organization, both `HttpOnly`, `SameSite=Lax`, and `Secure` outside local development.
- **The `Authorization` header is no longer needed.** The token travels only in the cookie.
- **During SSR the cookies are forwarded to the API.** Otherwise the Nuxt server would not know who opened the page.
- **CORS only where it is needed.** In production the frontend and the API share a domain.
- **Local runs got easier.** PostgreSQL in Docker and ready development settings.

## What comes next

Next, Boards learned to work in Telegram group chats. That is the subject of the next article.
