---
title: Laraue.Telegram.NET — ASP.NET-подобные контроллеры для Telegram-ботов на C#
type: project
name: Laraue.Telegram.NET
tags: [dotnet, telegram, open-source]
repository: https://github.com/Laraue/Laraue.Telegram.NET
language: C#
license: MIT
description: Маршрутизация Telegram-ботов на C# без цепочек if-else. Laraue.Telegram.NET даёт ботам на .NET 10 контроллеры как в ASP.NET, middleware, авторизацию, локализацию и тесты. На ней работают наши боты.
seoTitle: Laraue.Telegram.NET: Telegram боты как контроллеры ASP.NET
seoDescription: Маршрутизация Telegram-ботов на C# без if-else: контроллеры как в ASP.NET, middleware, авторизация, локализация и тесты для .NET 10. Используется в наших ботах.
createdAt: 2025-03-04
updatedAt: 2026-10-03 09:37
---
Telegram Bot API отдаёт вам обновление и больше ничего не делает. На C# это обычно превращается в один большой метод: сначала проверка текста сообщения, потом данных нажатой кнопки, потом состояния пользователя, и с каждой новой командой он растёт. **Laraue.Telegram.NET** заменяет его тем, что знает любой разработчик на ASP.NET: контроллерами, атрибутами, внедрением зависимостей и middleware.

Изначально мы писали её не для всех. Это библиотека, на которой работают наши собственные боты: бот [недвижимости](real-estate) использует её с сентября 2025 года, бот [Boards](boards) — с марта 2026, а сама библиотека развивается с 2023 года.

[![NuGet](https://img.shields.io/nuget/v/Laraue.Telegram.NET.Core)](https://www.nuget.org/packages/Laraue.Telegram.NET.Core)
[![Downloads](https://img.shields.io/nuget/dt/Laraue.Telegram.NET.Core)](https://www.nuget.org/packages/Laraue.Telegram.NET.Core)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Laraue/Laraue.Telegram.NET)

## Проблема: маршрутизация вырастает в один огромный метод

Большинство ботов начинаются аккуратно и быстро портятся:

```csharp
if (update.Message?.Text == "/start") Start();
else if (update.Message?.Text == "/settings") OpenSettings();
else if (update.CallbackQuery?.Data.StartsWith("/change")) ChangeSettings();
// ...и так без конца
```

В таком коде трудно ориентироваться, его трудно тестировать и расширять. Данные кнопок делают всё ещё хуже: идентификатор объекта едет внутри строки, которую приходится разбирать вручную.

## Контроллеры и атрибуты

Маршрут — это атрибут на методе класса `TelegramController`. Вот настоящий контроллер из бота Boards. Он обрабатывает кнопку подтверждения удаления и достаёт идентификатор задачи из данных кнопки:

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

Контроллер занимает несколько строк, сервис внедряется, а идентификатор приходит типизированным параметром. В боте Boards больше десяти таких маршрутов, в боте недвижимости примерно столько же, и каждый — отдельный небольшой класс, который легко найти. `TelegramMessageRoute` обрабатывает сообщения (например, `/start`), `TelegramCallbackRoute` — нажатия кнопок, а для любых других типов обновлений можно написать свой атрибут.

## Быстрый старт

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

Режим работы библиотека выбирает по настройке `WebhookUrl`: если она задана, бот работает через вебхук (так нужно в продакшене), иначе — через long polling, который удобен на машине разработчика и не требует публичного адреса. Очередь обновлений в памяти может потерять их при перезапуске. В продакшене используйте `AddEfCoreUpdatesQueue<MyDbContext>` из пакета `Laraue.Telegram.NET.UpdatesQueue.EFCore`: он хранит очередь в вашей базе.

## Пользователи и роли

Пакет `Laraue.Telegram.NET.Authentication` находит вашего пользователя для каждого входящего обновления и кладёт его идентификатор в контекст запроса. От вас нужен только `ITelegramUserQueryService<TKey>`: как найти пользователя по Telegram id и как создать его при первом обновлении.

```csharp
services.AddTelegramCore(new TelegramBotClientOptions("YOUR_BOT_TOKEN"))
    .AddTelegramAuthentication<Guid, TelegramUserQueryService>();
```

После этого метод контроллера может принять `TelegramRequestContext<Guid>` и прочитать `UserId`. Чтобы не писать generic-тип в каждом методе, объявите `public sealed class RequestContext : TelegramRequestContext<Guid>` и передайте его третьим типом в `AddTelegramAuthentication` — так сделано в контроллере Boards выше. Роли проверяются атрибутом `[RequiresUserRole(...)]`, а источник ролей — ваш `IUserRoleProvider` или `StaticUserRoleProvider`, который читает их из конфигурации.

## Middleware

Запросы проходят через конвейер, как в ASP.NET. Middleware реализует `ITelegramMiddleware`, и выполняются они в том порядке, в котором добавлены:

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

## Вопрос пользователю и ответ в следующем сообщении

Некоторым командам нужен ответ в одном из следующих сообщений: «Сколько вам лет?» и затем число. Пакет `Laraue.Telegram.NET.Interceptors` запоминает, какой перехватчик должен получить следующее сообщение этого пользователя. `Interceptors.EFCore` хранит это состояние в вашей базе, поэтому диалог переживает перезапуск бота.

## Локализация, тесты и метрики

- **Локализация.** `Laraue.Telegram.NET.Localization` определяет язык каждого пользователя (реализуйте `BaseCultureInfoProvider`) и работает с обычными `.resx` файлами, поэтому нужная строка выбирается для каждого пользователя.
- **Интеграционные тесты.** `Laraue.Telegram.NET.Testing` содержит `TelegramTestHost`: вы отправляете обновления в настоящий конвейер и проверяете ответы бота. Бот Boards тестируется именно так.
- **Метрики и трассировка.** Ядро считает начатые и неудавшиеся обновления и время обработки через `System.Diagnostics`, без дополнительных зависимостей. `Laraue.Telegram.NET.OpenTelemetry` экспортирует их одной строкой.

## Пакеты

| Пакет | Назначение |
|---|---|
| `Laraue.Telegram.NET.Core` | Маршрутизация, контроллеры, middleware, DI |
| `Laraue.Telegram.NET.Authentication` | Пользователи и доступ по ролям |
| `Laraue.Telegram.NET.UpdatesQueue.EFCore` | Очередь обновлений в базе данных |
| `Laraue.Telegram.NET.Interceptors` (+ `.EFCore`) | Ожидание ответа пользователя на вопрос |
| `Laraue.Telegram.NET.Localization` | Язык каждого пользователя |
| `Laraue.Telegram.NET.Testing` | Интеграционные тесты бота |
| `Laraue.Telegram.NET.OpenTelemetry` | Экспорт метрик и трассировок |

Ставьте только то, что нужно: пакеты независимы. Исходный код и задачи: [github.com/Laraue/Laraue.Telegram.NET](https://github.com/Laraue/Laraue.Telegram.NET).
