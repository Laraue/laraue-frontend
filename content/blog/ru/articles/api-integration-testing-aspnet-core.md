---
title: Интеграционное тестирование API в ASP.NET Core — WebApplicationFactory, настоящий PostgreSQL и типизированный прокси к контроллерам
description: Часть 15 цикла о разработке Telegram-таск-трекера в одиночку. Почему мы написали первые интеграционные тесты, когда приложение уже работало в продакшене, как устроен тестовый хост на WebApplicationFactory с настоящей базой и собственный прокси, который превращает вызов метода контроллера в HTTP-запрос.
seoTitle: Интеграционное тестирование API в ASP.NET Core
seoDescription: Часть 15: тестирование API в ASP.NET Core на WebApplicationFactory и PostgreSQL без Testcontainers и прокси, который строит HTTP-запрос из вызова метода.
type: article
series: architecture-first
part: 15
createdAt: 2026-10-12 14:00
updatedAt: 2026-10-12 14:00
projects: [boards]
tags: [devlog, dotnet, architecture, task-tracker, open-source]
---

> **Architecture First: как в одиночку с ИИ сделать альтернативу Jira** — Часть 15.
> В [предыдущей статье](spaces-in-a-task-tracker-data-model-and-migration) мы добавили спейсы. Следующим шагом были организации, но перед ними мы написали первые интеграционные тесты.

## Краткое содержание

Как мы начали покрывать бэкенд интеграционными тестами:

1. Тесты поднимают настоящий Web API через `WebApplicationFactory` и работают с настоящей базой PostgreSQL, локально и в CI, без Testcontainers.
2. Тест вызывает метод контроллера как обычный C#-метод, а наш класс `Proxy<TController>` превращает этот вызов в HTTP-запрос: адрес, метод и параметры он берёт из атрибутов контроллера.
3. Тесты называли по схеме «кто, что делает, при каком условии»: `User_ShouldNotDeleteOrganization_WhenHasNoAccess`.
4. Первые тесты были про организации, и сами организации писались вместе с ними.
5. Позже прокси вынесли в наш NuGet-пакет `Laraue.Core.Testing`, чтобы использовать его в других проектах.

## Почему тесты появились именно тогда

Тестовый проект в решении был и раньше, но в нём был только список тест-кейсов для сохранения сообщений из Telegram в виде комментариев. Всё остальное проверялось вручную.

Когда мы закончили со спейсами, приложение уже работало в продакшене, и у него были активные пользователи. Следующими в плане стояли организации и права доступа — изменения, которые затрагивают почти каждый запрос к API. Ломать что-то для людей, которые уже пользуются досками, не хотелось, поэтому перед организациями мы написали инфраструктуру для тестов.

## Тестовый хост: настоящий API и настоящая база

В основе — стандартный `WebApplicationFactory<Program>` из `Microsoft.AspNetCore.Mvc.Testing`. Он запускает Web API прямо в процессе тестов с теми же настройками DI, middleware и авторизации, что и в продакшене, и даёт `HttpClient`, который обращается к этому API без сети.

Базу данных в тестах мы ничем не заменяли: тесты работают с PostgreSQL, как и продакшен, но с отдельной тестовой базой. Строка подключения к ней лежит в `appsettings.json` тестового проекта, а в CI PostgreSQL запускается как сервисный контейнер GitHub Actions:

```yaml
services:
  postgres:
    image: postgres
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
    ports:
      - "5432:5432"
```

Благодаря этому тесты проверяют и SQL, который генерирует EF Core, и ограничения в базе, и миграции. С in-memory провайдером EF Core ничего из этого проверить бы не получилось.

Testcontainers мы не подключали, потому что без него всё и так работало: локально тесты ходят в обычный PostgreSQL, а в CI базу поднимает сам GitHub Actions. Добавлять зависимость, которая ничего не решает, не было смысла.

Каждый тест сначала создаёт тестовый скоуп. В первой версии скоуп очищал таблицу пользователей и умел создавать пользователя:

```csharp
public class WebApiTestHostScope : IDisposable
{
    private readonly IServiceScope _scope;
    public DatabaseContext Database => _scope.ServiceProvider.GetRequiredService<DatabaseContext>();

    public WebApiTestHostScope(IServiceScope scope)
    {
        _scope = scope;
        Database.Users.ExecuteDelete(); // Cleanup before test run
    }

    public async Task<Guid> CreateUser()
    {
        var user = new User();
        Database.Users.Add(user);
        await Database.SaveChangesAsync();
        return user.Id;
    }

    public void Dispose() => _scope.Dispose();
}
```

База одна на все тесты, поэтому все тестовые классы помечены `[Collection("IntegrationTest")]`: xUnit не запускает тесты одной коллекции параллельно, и тесты не мешают друг другу.

## Прокси: вызов контроллера вместо URL

В обычном интеграционном тесте на `WebApplicationFactory` нужно собрать URL строкой, сериализовать тело, отправить запрос и разобрать ответ. Если в контроллере поменяется маршрут или имя параметра, тест узнает об этом только при запуске.

Мы хотели, чтобы тест выглядел как вызов метода. Так выглядел первый тест для организаций:

```csharp
[Collection("IntegrationTest")]
public class OrganizationControllerTests(WebApiTestHost host) : IClassFixture<WebApiTestHost>
{
    private readonly Proxy<OrganizationsController> _organizationsController =
        host.Controller<OrganizationsController>();

    [Fact]
    public async Task CreateOrganization_ShouldCreateNewOrganization_Always()
    {
        using var testScope = host.CreateTestScope();
        var userId = await testScope.CreateUser();

        var newId = await _organizationsController
            .WithAuthorization(userId)
            .Execute(x => x.Create(
                new CreateOrganizationRequest
                {
                    Name = "Org 1",
                    Color = "#ffffff"
                }));

        var organizations = await testScope.Database.Organizations.ToListAsyncEF();

        var organization = Assert.Single(organizations);
        Assert.Equal("Org 1", organization.Name);
        Assert.Equal(userId, organization.OwnerId);
        Assert.Equal(newId, organization.Id);
    }
}
```

`x => x.Create(...)` здесь не вызывает контроллер напрямую. `Execute` принимает не делегат, а дерево выражений (`Expression<Func<TController, Task<T>>>`), и прокси разбирает его:

```csharp
public async Task<T?> Execute<T>(Expression<Func<TController, Task<T>>> makeCall)
{
    var controller = typeof(TController);
    var controllerPath = controller.GetCustomAttribute<RouteAttribute>()!.Template;

    var method = ((MethodCallExpression)makeCall.Body).Method;
    var httpAttribute = method.GetCustomAttribute(typeof(HttpMethodAttribute), true)
        ?? throw new InvalidOperationException(
            $"Method {method} should be marked as HTTP attribute, e.g. [HttpGet] to be called.");

    // для каждого аргумента: [FromQuery] -> строка запроса, [FromBody] -> тело,
    // значения берутся из инициализатора объекта в выражении

    var response = await (httpAttribute switch
    {
        HttpGetAttribute => client.GetAsync(fullPath),
        HttpPostAttribute => client.PostAsJsonAsync(fullPath, body),
        _ => throw new InvalidOperationException($"Requests with {httpAttribute} are not supported")
    });

    await HandleNonSuccessCode(response);
    return await response.Content.ReadFromJsonAsync<T>();
}
```

Что делает прокси:

- Берёт маршрут из атрибута `[Route]` на контроллере, а HTTP-метод — из `[HttpGet]` или `[HttpPost]` на вызываемом методе.
- Смотрит на атрибуты параметров метода: значения параметров с `[FromQuery]` уходят в строку запроса, с `[FromBody]` — в тело.
- Отправляет настоящий HTTP-запрос через клиент `WebApplicationFactory`, поэтому срабатывают маршрутизация, валидация, авторизация и сериализация — всё, через что проходит запрос от фронтенда.
- Если запрос завершился ошибкой, бросает исключение с методом, адресом, статусом, телом запроса и телом ответа, чтобы по упавшему тесту сразу было видно, что пошло не так.

Типы проверяются при компиляции: если поменять сигнатуру метода контроллера или переименовать DTO, тест перестанет компилироваться. А из теста можно одним переходом попасть прямо в метод контроллера.

Почему мы не взяли готовую библиотеку, например Refit, или не написали запросы через `HttpClient` вручную? Мы стараемся не добавлять зависимость, если свою реализацию можно сделать за несколько часов и потом переиспользовать в других проектах. Первая версия прокси заняла чуть больше ста строк.

## Как называли тесты

Первые два теста назывались по схеме «действие, ожидаемый результат, условие»: `CreateOrganization_ShouldCreateNewOrganization_Always`. Уже в следующих тестах для организаций появилась другая схема, которая и прижилась: сначала тот, кто действует, потом результат, потом условие.

```
User_ShouldViewAvailableOrganizations_WhenHasPermissions
User_ShouldNotViewOrganizations_WhenHasNotPermissions
User_ShouldNotDeleteOrganization_WhenHasNoAccess
```

Когда в системе есть права доступа, главное в тесте — кто выполняет действие: у владельца оно должно получаться, а у участника без прав — нет. Поэтому тесты часто идут парами, `…_WhenHasAccess` и `…_WhenHasNotAccess`, и по списку названий видно, какие случаи уже проверены.

## Как это выросло

Дальше тесты писали вместе с новой функциональностью, и тестовая инфраструктура постепенно росла:

- **Прокси.** Добавились `PUT` и `DELETE`, параметры в пути, формы с файлами и разбор ошибок: на ответ `400`, `403` или `404` прокси добавляет вложенное исключение `BadRequestException`, `ForbiddenException` или `NotFoundException`, и тест может проверить, почему запрос не прошёл.
- **Авторизация.** Вместо одного `WithAuthorization` появились `WithUserAuthorization` и `WithOrganizationAuthorization`: токен пользователя и токен пользователя внутри организации.
- **Подготовка данных.** Для тестов на права появился билдер организации: тест описывает владельца, участников и их права, а билдер создаёт организацию со спейсом по умолчанию и доской Backlog — так же, как это делает приложение.
- **Внешние сервисы.** Сервисы, до которых тесты не могут дойти (Billing по gRPC, проверка токена Google, ИИ), подменяются моками Moq прямо в тестовом хосте.

Сейчас в тестовом проекте больше сорока классов и около шестисот тестов. Прокси за это время вырос примерно до шестисот строк, и мы вынесли его в наш NuGet-пакет [`Laraue.Core.Testing`](https://www.nuget.org/packages/Laraue.Core.Testing) ([исходный код прокси](https://github.com/Laraue/Laraue.Core/blob/HEAD/src/Laraue.Core.Testing/Http/Proxy.cs)): в проекте Boards остались только расширения для авторизации, потому что они зависят от сервиса токенов самого приложения.

## Итоги

- **Тесты появились, когда появилось что терять.** Приложением уже пользовались, а впереди были большие изменения, поэтому сначала мы написали тесты.
- **API тестируется целиком.** Каждый тест проходит через маршрутизацию, авторизацию, валидацию и настоящую базу PostgreSQL.
- **Тест выглядит как вызов метода.** Прокси строит HTTP-запрос по атрибутам контроллера, и компилятор следит, чтобы тесты не отставали от API.
- **Своё вместо зависимости.** Прокси написали за несколько часов, а потом вынесли в пакет, чтобы использовать и в других проектах.

Код тестов открыт: [тесты Boards на GitHub](https://github.com/Laraue/Laraue.Apps.Boards/tree/main/tests/Laraue.Apps.Boards.IntegrationTests).

## Что дальше

Когда тесты появились, можно было браться за организации. [Следующая статья](multi-tenancy-saas-task-tracker-organizations) — о том, как приложение перешло от одного пользователя ко многим: организации, личная организация каждого пользователя и код приглашения.
