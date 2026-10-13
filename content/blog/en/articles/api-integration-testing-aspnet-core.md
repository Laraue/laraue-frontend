---
title: API integration testing in ASP.NET Core — WebApplicationFactory, a real PostgreSQL and a typed controller proxy
description: Part 15 of the series about building a Telegram task tracker in a tiny team. Why we wrote our first integration tests when the app was already in production, how the test host on WebApplicationFactory with a real database works, and our own proxy that turns a controller method call into an HTTP request.
seoTitle: API Integration Testing in ASP.NET Core with a Typed Proxy
seoDescription: Part 15: API integration testing in ASP.NET Core with WebApplicationFactory and PostgreSQL, no Testcontainers, and a typed proxy to controllers.
type: article
series: architecture-first
part: 15
createdAt: 2026-10-12 10:10
updatedAt: 2026-10-13 12:23
projects: [boards]
tags: [devlog, dotnet, architecture, task-tracker, open-source]
---

> **Architecture First: Building a Jira Alternative in a Tiny Team, AI-Assisted** — Part 15.
> In the [previous article](spaces-in-a-task-tracker-data-model-and-migration) we added spaces. Organizations were the next step, but before them we wrote our first integration tests.

## The short version

How we started covering the backend with integration tests:

1. The tests start the real Web API through `WebApplicationFactory` and work against a real PostgreSQL database, both locally and in CI, without Testcontainers.
2. A test calls a controller method as an ordinary C# method, and our `Proxy<TController>` class turns that call into an HTTP request: it takes the route, the HTTP method and the parameters from the controller's attributes.
3. Tests are named "who, does what, under which condition": `User_ShouldNotDeleteOrganization_WhenHasNoAccess`.
4. The first tests were about organizations, and the organizations themselves were written together with them.
5. Later we moved the proxy into our NuGet package `Laraue.Core.Testing`, to use it in other projects.

## Why the tests appeared exactly then

The solution already had a test project, but it held only a list of test cases for saving Telegram messages, written as comments. Everything else was checked by hand.

By the time we finished spaces, the app was already in production and had active users. Next in the plan were organizations and access rights, changes that touch almost every API request. We did not want to break anything for people who were already using the boards, so before organizations we built the test infrastructure.

## The test host: the real API and a real database

The base is the standard `WebApplicationFactory<Program>` from `Microsoft.AspNetCore.Mvc.Testing`. It runs the Web API inside the test process with the same DI setup, middleware and authorization as in production, and gives an `HttpClient` that calls this API without a network.

We did not replace the database in the tests with anything: like production, they work with PostgreSQL, but with a separate test database. Its connection string is in the test project's `appsettings.json`, and in CI PostgreSQL runs as a GitHub Actions service container:

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

This way the tests check the SQL that EF Core generates, the database constraints and the migrations. The in-memory EF Core provider would check none of that.

We did not add Testcontainers, because everything already worked without it: locally the tests use an ordinary PostgreSQL, and in CI GitHub Actions starts the database itself. There was no point in adding a dependency that solves nothing for us.

Every test starts with a test scope. In the first version it cleaned the users table and could create a user:

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

There is one database for all the tests, so every test class is marked `[Collection("IntegrationTest")]`: xUnit does not run tests of one collection in parallel, and the tests do not get in each other's way.

## The proxy: a controller call instead of a URL

A typical integration test on `WebApplicationFactory` looks like this: build the URL as a string, serialize the body, send the request and parse the response. If a route or a parameter name changes in the controller, the test finds out only when it runs.

We wanted a test to look like a method call. Here is the first test for organizations:

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

`x => x.Create(...)` does not call the controller directly here. `Execute` takes an expression tree (`Expression<Func<TController, Task<T>>>`) rather than a delegate, and the proxy takes it apart:

```csharp
public async Task<T?> Execute<T>(Expression<Func<TController, Task<T>>> makeCall)
{
    var controller = typeof(TController);
    var controllerPath = controller.GetCustomAttribute<RouteAttribute>()!.Template;

    var method = ((MethodCallExpression)makeCall.Body).Method;
    var httpAttribute = method.GetCustomAttribute(typeof(HttpMethodAttribute), true)
        ?? throw new InvalidOperationException(
            $"Method {method} should be marked as HTTP attribute, e.g. [HttpGet] to be called.");

    // for every argument: [FromQuery] -> query string, [FromBody] -> body,
    // the values come from the object initializer in the expression

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

What the proxy does:

- Takes the route from the `[Route]` attribute on the controller, and the HTTP method from `[HttpGet]` or `[HttpPost]` on the called method.
- Looks at the attributes of the method's parameters: values of `[FromQuery]` parameters go to the query string, values of `[FromBody]` parameters go to the body.
- Sends a real HTTP request through the `WebApplicationFactory` client, so routing, validation, authorization and serialization all run, everything a request from the frontend goes through.
- If the request fails, throws an exception with the method, URL, status, request body and response body, so a failed test shows right away what went wrong.

Types are checked at compile time: if the controller method's signature changes or a DTO is renamed, the test stops compiling. And "go to definition" from the test leads straight to the controller method.

Why didn't we take a ready-made library such as Refit, or write the requests with `HttpClient` by hand? We try not to add a dependency when our own implementation can be made in a few hours and reused in other projects. The first version of the proxy was a little over a hundred lines.

## How we named the tests

The first two tests were named "action, expected result, condition": `CreateOrganization_ShouldCreateNewOrganization_Always`. Already in the next organization tests another scheme appeared, and it stuck: first who acts, then the result, then the condition.

```
User_ShouldViewAvailableOrganizations_WhenHasPermissions
User_ShouldNotViewOrganizations_WhenHasNotPermissions
User_ShouldNotDeleteOrganization_WhenHasNoAccess
```

When a system has access rights, the main thing in a test is who performs the action: it has to succeed for the owner and fail for a member without rights. So tests often come in pairs, `…_WhenHasAccess` and `…_WhenHasNotAccess`, and the list of names shows which cases are already covered.

## How it grew

From then on we wrote tests together with new features, and the test infrastructure gradually grew:

- **The proxy.** It got `PUT` and `DELETE`, path parameters, forms with files and error parsing: on a `400`, `403` or `404` response the proxy puts a `BadRequestException`, `ForbiddenException` or `NotFoundException` into the inner exception, and the test can check why the request failed.
- **Authorization.** The single `WithAuthorization` became `WithUserAuthorization` and `WithOrganizationAuthorization`: a user token and a token of a user inside an organization.
- **Test data.** For the access-rights tests we added an organization builder: the test describes the owner, the members and their rights, and the builder creates the organization with a default space and a Backlog board, the same way the app does.
- **External services.** Services the tests cannot reach (Billing over gRPC, Google token validation, AI) are replaced with Moq mocks right in the test host.

Today the test project has more than forty classes and about six hundred tests. The proxy grew to about six hundred lines, and we moved it into our NuGet package [`Laraue.Core.Testing`](https://www.nuget.org/packages/Laraue.Core.Testing) ([the proxy's source code](https://github.com/Laraue/Laraue.Core/blob/HEAD/src/Laraue.Core.Testing/Http/Proxy.cs)). Only the authorization extensions stayed in Boards, because they depend on the app's own token service.

## Results

- **Tests appeared when there was something to lose.** The app was already in use, and big changes were ahead, so we wrote the tests first.
- **The API is tested as a whole.** Every test goes through routing, authorization, validation and a real PostgreSQL database.
- **A test looks like a method call.** The proxy builds the HTTP request from the controller's attributes, and the compiler makes sure the tests keep up with the API.
- **Our own code instead of a dependency.** The proxy took a few hours to write, and later we moved it into a package to use it in other projects too.

The test code is open: [Boards tests on GitHub](https://github.com/Laraue/Laraue.Apps.Boards/tree/main/tests/Laraue.Apps.Boards.IntegrationTests).

## What comes next

Once the tests were in place, we could take on organizations. The [next article](multi-tenancy-saas-task-tracker-organizations) is about how the app went from one user to many: organizations, a personal organization for every user, and join codes.
