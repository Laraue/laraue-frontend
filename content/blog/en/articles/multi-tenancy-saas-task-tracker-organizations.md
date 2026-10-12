---
title: Multi-tenancy in a SaaS task tracker — organizations, a personal organization for every user and a separate organization JWT
description: Part 16 of the series about building a Telegram task tracker solo. How we added organizations to Boards: a shared-database data model, a personal organization for every user, joining by an invite code, and a separate JWT issued when a user enters an organization.
seoTitle: Multi-Tenancy in a SaaS Task Tracker: Organizations
seoDescription: Part 16: multi-tenancy in a task tracker — organizations in a shared database, a personal organization per user, invite codes and an organization JWT.
type: article
series: architecture-first
part: 16
createdAt: 2026-10-13 14:00
updatedAt: 2026-10-13 14:00
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 16.
> In the [previous article](api-integration-testing-aspnet-core) we wrote our first integration tests. With them in place we could take on organizations, a change that touched almost every API request.

## The short version

How we made Boards multi-tenant:

1. A new level appeared above spaces: the **organization**. The hierarchy became Organization → Space → Board → Issue.
2. All organizations live in one database: a space stores a reference to its organization, and all data is filtered through it.
3. Every user has a **personal organization**. It is created at sign-up, it cannot be deleted, and its members cannot be managed.
4. People join a regular organization with an eight-character **invite code**. The code can be reissued, a member can leave, and an administrator can revoke a member's access.
5. A user gets **two kinds of tokens**: the regular JWT says who they are, and entering an organization issues a second JWT with its id.
6. About twenty migrations that piled up during the work were merged into one before the release.

## Why we needed organizations

After spaces, personal affairs and the Laraue work lived in different spaces, but under one user. We wanted to keep personal tasks in Boards and move all the Laraue work to a separate place, where other people could be invited later. That required an entity that owns spaces and in which future teammates can be granted rights.

Such an entity is usually called a tenant, and an app in which many tenants share one system is called multi-tenant. In Boards the tenant is the organization.

## The data model: one database for everyone

There are three common ways to separate tenant data: a database per tenant, a schema per tenant in a shared database, or shared tables with a column that points to the tenant. Boards uses the third: all organizations live in the same tables.

```csharp
/// <summary>
/// The unit that can has spaces, boards, issues.
/// </summary>
public class Organization
{
    public long Id { get; set; }

    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(7)]
    public required string Color { get; set; }

    public Guid OwnerId { get; set; }
    public User? Owner { get; set; }

    public OrganizationType Type { get; set; }

    [MaxLength(8)]
    public string JoinCode { get; set; } = string.Empty;

    public IList<Space>? Spaces { get; set; }
    public IList<OrganizationUser>? Users { get; set; }
}

public enum OrganizationType
{
    Organization = 0,
    Personal = 1,
}
```

The link to the organization is stored on the space, and boards and issues find it through the space, just as an issue finds its space through its status and board ([part 14](spaces-in-a-task-tracker-data-model-and-migration)). Members are stored in a separate `OrganizationUser` table: one row per "user — organization" pair, together with the user's rights in that organization. Rights are the subject of the next article.

## The personal organization

If a user can have no organization, every request gets a "no organization" case that has to be handled somewhere. We had already run into this with spaces and solved it the same way: every user gets a personal organization right at sign-up.

```csharp
user.Organizations = new List<Organization>
{
    OrganizationDefaults.GetNewOrganizationEntity(
        user.Id,
        "Personal",
        Palette.RandomColor(),
        timestamp,
        OrganizationType.Personal)
};
```

A default space and a Backlog board are created together with the organization. For users who had signed up earlier, personal organizations were created by a migration; we went through its SQL in [part 14](spaces-in-a-task-tracker-data-model-and-migration).

A personal organization differs from a regular one in its type and in the owner's rights: the owner can rename it but cannot delete it or manage its members, so nobody can be invited into it either. This way the user always has a place for their own tasks, and nobody else sees them.

## Joining with an invite code

Every organization has an eight-character code. It is generated with `RandomNumberGenerator` rather than `Random`, because the code gives access to the organization and must not be guessable:

```csharp
public static class StringGenerator
{
    private const string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    public static string GenerateJoinCode() => GenerateRandomString(8);

    private static string GenerateRandomString(int length)
    {
        return string.Create(length, (chars: Chars, length), (span, state) =>
        {
            var charsArr = state.chars;
            for (var i = 0; i < state.length; i++)
                span[i] = charsArr[RandomNumberGenerator.GetInt32(charsArr.Length)];
        });
    }
}
```

The owner sends the code to a person, who enters it in the app and becomes a member with no rights. An administrator of the organization grants them rights later. The other member operations came afterwards: reissuing the code if it got to the wrong person, leaving an organization, and revoking a member's access.

## Two tokens: the user and the organization

Before organizations a user had one JWT with their id (we described how the Telegram sign-in issues it in [part 13](telegram-login-widget-dotnet-auth)). With organizations every request got a question: which organization is the user working in right now, and are they a member of it?

We could have passed the organization id with every request and checked membership every time. We did it differently: the check runs once, when the user enters an organization, and the user gets a second token that already contains the organization.

```csharp
public string CreateOrganizationToken(long organizationId, Guid userId)
{
    var claims = new List<Claim>
    {
        new("orgId", organizationId.ToString()),
        new("id", userId.ToString()),
    };

    var jwt = new JwtSecurityToken(
        issuer: Issuer,
        audience: OrganizationAudience,
        claims: claims,
        signingCredentials: new SigningCredentials(
            GetSymmetricSecurityKey(options.Value.Key),
            SecurityAlgorithms.HmacSha256));

    return new JwtSecurityTokenHandler().WriteToken(jwt);
}
```

The two tokens have different audiences, and in ASP.NET Core they are two authentication schemes: `AuthSchemas.User` and `AuthSchemas.Organization`. A controller states explicitly which token it accepts:

```csharp
[Authorize(AuthenticationSchemes = AuthSchemas.User)]
[Route("/api/organizations")]
public class OrganizationsController : ControllerBase
{
    [HttpPost("join/{code}")]
    public Task Join(string code, CancellationToken cancellationToken = default) { ... }

    [HttpPost("login")]
    public Task<string> Login([FromBody] LoginRequest request, CancellationToken cancellationToken = default) { ... }

    [Authorize(AuthenticationSchemes = AuthSchemas.Organization)]
    [HttpGet("current")]
    public Task<OrganizationDto> GetOrganization(CancellationToken cancellationToken = default) { ... }
}
```

Creating an organization, joining it with a code or entering it works with the user token. Everything that happens inside an organization (spaces, boards, issues, members) requires the organization token.

The token does not replace the rights check. Every action inside an organization still checks the member's rights in the `OrganizationUser` table, so if a member's access is revoked, their next request fails even with a valid token. If an organization does not exist or the user has no access to it, the API answers `404` rather than `403`, so as not to reveal that the organization exists.

## One migration instead of twenty

Organizations took almost three weeks, and during that time about twenty migrations piled up in the project: new tables, renames, a rewritten rights table, dropping columns that turned out to be unnecessary. None of them had reached production yet.

We have a rule of "one pull request, one migration" (it is described in the [article about the backend architecture](clean-dotnet-telegram-bot-architecture)), so that the project does not collect dozens of files with intermediate steps. Before the release we rolled the database back to its state before organizations, deleted all the intermediate migrations and generated one, `AddOrganizations`. The SQL that moved the existing users' data went into it too.

## Results

- **The tenant is the organization.** All organizations are stored in shared tables, and only the space has a link to the organization.
- **Every user has a personal organization.** It is created at sign-up, so the code has no "the user has no organization" case.
- **Joining with an invite code.** The code is generated with a cryptographically secure generator, it can be reissued, and a member can be removed.
- **A separate token for the organization.** Membership is checked once on entering, and rights on every action.
- **One migration per change.** Twenty intermediate migrations became one before the release.

## What comes next

An organization answers the question "whose is this". The next question is "who can do what": create spaces, see other people's boards, delete issues. We rewrote the rights system several times, looking for a balance between flexibility and simplicity, and that is the subject of the next article.
