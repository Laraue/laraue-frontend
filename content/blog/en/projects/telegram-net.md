---
title: Laraue.Telegram.NET — Write Telegram Bots Like ASP.NET Controllers in C#
type: project
name: Laraue.Telegram.NET
tags: [dotnet, telegram, open-source]
repository: https://github.com/Laraue/Laraue.Telegram.NET
language: C#
license: MIT
description: Telegram bot routing in C# without if-else chains. Laraue.Telegram.NET gives .NET 10 bots ASP.NET-style controllers, middleware, authentication, localization and tests. We run our own bots on it.
seoTitle: Laraue.Telegram.NET: Telegram Bots Like ASP.NET Controllers
seoDescription: Telegram bot routing in C# without if-else chains: ASP.NET-style controllers, middleware, auth, localization and tests for .NET 10. Used in our own bots.
createdAt: 2025-11-01
updatedAt: 2026-10-03 09:37
---
The Telegram Bot API gives you an update and leaves the rest to you. In C# that usually means one big method that checks the text of the message, then the data of the callback, then the state of the user, and grows with every new command. **Laraue.Telegram.NET** replaces it with what an ASP.NET developer already knows: controllers, attributes, dependency injection and middleware.

We did not write it for the public first. It is the library that our own Telegram bots run on: the [real estate](real-estate) bot has used it since September 2025 and the [Boards](boards) bot since March 2026, and the library itself has been developed since 2023.

[![NuGet](https://img.shields.io/nuget/v/Laraue.Telegram.NET.Core)](https://www.nuget.org/packages/Laraue.Telegram.NET.Core)
[![Downloads](https://img.shields.io/nuget/dt/Laraue.Telegram.NET.Core)](https://www.nuget.org/packages/Laraue.Telegram.NET.Core)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Laraue/Laraue.Telegram.NET)

## The problem: routing grows into one big method

Most bots start clean and degrade fast:

```csharp
if (update.Message?.Text == "/start") Start();
else if (update.Message?.Text == "/settings") OpenSettings();
else if (update.CallbackQuery?.Data.StartsWith("/change")) ChangeSettings();
// ...grows forever
```

This is hard to navigate, hard to test and hard to extend. Callback data makes it worse: the identifier of an item travels inside a string that you have to cut apart by hand.

## Controllers and attributes

A route is an attribute on a method of a `TelegramController`. This is a real controller from the Boards bot. It handles the button that confirms a deletion and takes the issue id from the callback data:

```csharp
public class DeleteConfirmController(IDeleteCommandService deleteCommandService) : TelegramController
{
    [TelegramCallbackRoute(TelegramRoutes.DeleteConfirm)]
    public Task HandleDeleteConfirmed(
        RequestContext requestContext,
        [FromPath] long issueId,
        CancellationToken cancellationToken)
    {
        return deleteCommandService.HandleDeleteConfirmed(
            requestContext.Update.CallbackQuery!,
            requestContext.UserId,
            issueId,
            cancellationToken);
    }
}
```

The controller is a few lines long, the service is injected, and the id arrives as a typed parameter. The Boards bot has more than ten such routes and the real estate bot a similar number, and each of them is a separate small class that is easy to find. `TelegramMessageRoute` handles messages (for example `/start`), `TelegramCallbackRoute` handles button presses, and you can write your own attribute for any other update type.

## Getting started

```bash
dotnet add package Laraue.Telegram.NET.Core
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<TelegramNetOptions>();
builder.Services.Configure<TelegramNetOptions>(builder.Configuration.GetSection("Telegram"));

builder.Services
    .AddTelegramCore(new TelegramBotClientOptions("YOUR_BOT_TOKEN"))
    .AddInMemoryUpdatesQueue();

var app = builder.Build();
app.MapTelegramRequests("/api/telegram");
app.Run();
```

The library chooses the mode from the `WebhookUrl` setting: when it is set the bot works through a webhook (production), otherwise it uses long polling, which is convenient on a developer machine and needs no public address. The in-memory queue of updates can lose them on a restart. For production use `AddEfCoreUpdatesQueue<MyDbContext>` from `Laraue.Telegram.NET.UpdatesQueue.EFCore`, which keeps the queue in your database.

## Users and roles

`Laraue.Telegram.NET.Authentication` finds your user for every incoming update and puts the id into the request context. You only implement `ITelegramUserQueryService<TKey>`: how to find a user by the Telegram id and how to create one on the first update.

```csharp
services.AddTelegramCore(new TelegramBotClientOptions("YOUR_BOT_TOKEN"))
    .AddTelegramAuthentication<Guid, TelegramUserQueryService>();
```

After that a controller method can take `TelegramRequestContext<Guid>` and read `UserId`. To avoid the generic type in every method, declare `public sealed class RequestContext : TelegramRequestContext<Guid>` and register it with the third type argument of `AddTelegramAuthentication`, as the Boards controller above does. Roles are checked with `[RequiresUserRole(...)]`, and the role source is your own `IUserRoleProvider` or `StaticUserRoleProvider` that reads them from configuration.

## Middleware

Requests pass through a pipeline, like in ASP.NET. A middleware implements `ITelegramMiddleware`, and middlewares run in the order they were added:

```csharp
public class LogExceptionsMiddleware(ITelegramMiddleware next, ILogger<LogExceptionsMiddleware> logger)
    : ITelegramMiddleware
{
    public async Task<object?> InvokeAsync(CancellationToken ct = default)
    {
        try { return await next.InvokeAsync(ct); }
        catch (BadTelegramRequestException ex) { logger.LogError(ex, "Bad request"); }
        return null;
    }
}

services.AddTelegramMiddleware<LogExceptionsMiddleware>();
```

## Asking the user a question

Some commands need an answer in a later message: "How old are you?" and then the number. The `Laraue.Telegram.NET.Interceptors` package stores which interceptor must receive the next message of this user. `Interceptors.EFCore` keeps that state in your database, so the dialog survives a restart of the bot.

## Localization, tests and metrics

- **Localization.** `Laraue.Telegram.NET.Localization` takes the language of each user (implement `BaseCultureInfoProvider`) and uses the usual `.resx` files, so the right string is chosen per user.
- **Integration tests.** `Laraue.Telegram.NET.Testing` provides `TelegramTestHost`: you send updates to the real pipeline and check what the bot answers. The Boards bot is tested this way.
- **Metrics and tracing.** The core package reports the number of started and failed updates and the processing time through `System.Diagnostics`, without any extra reference. `Laraue.Telegram.NET.OpenTelemetry` exports them with one line.

## Packages

| Package | Purpose |
|---|---|
| `Laraue.Telegram.NET.Core` | Routing, controllers, middleware, DI |
| `Laraue.Telegram.NET.Authentication` | Users and role-based access |
| `Laraue.Telegram.NET.UpdatesQueue.EFCore` | Queue of updates in the database |
| `Laraue.Telegram.NET.Interceptors` (+ `.EFCore`) | Waiting for the user's answer to a question |
| `Laraue.Telegram.NET.Localization` | Per-user language |
| `Laraue.Telegram.NET.Testing` | Integration tests of a bot |
| `Laraue.Telegram.NET.OpenTelemetry` | Export of metrics and traces |

Install only what you need, the packages are independent. Source and issues: [github.com/Laraue/Laraue.Telegram.NET](https://github.com/Laraue/Laraue.Telegram.NET).
