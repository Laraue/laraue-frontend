---
title: Access control in a task tracker without roles — an alternative to RBAC, four versions of the model and space-level permissions
description: Part 17 of the series about building a Telegram task tracker solo. Why Boards has no roles, how the permission system went through four versions looking for a balance between flexibility and simplicity, and why permissions are now granted only on the organization and the space.
seoTitle: Role-Based Access Control Without Roles in a Task Tracker
seoDescription: Part 17: access control in a task tracker without roles (RBAC) — four versions of the model, flags versus bool columns, and space-level permissions.
type: article
series: architecture-first
part: 17
createdAt: 2026-10-14 14:00
updatedAt: 2026-10-14 14:00
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 17.
> In the [previous article](multi-tenancy-saas-task-tracker-organizations) we added organizations, which other people can be invited into. Now we had to decide what each of them is allowed to do.

## The short version

How we built access control in Boards:

1. There are no roles: every member of an organization is granted permissions directly. That is enough for current needs, and roles can be added later if users ask for them.
2. Permissions come in two kinds: permissions on objects (spaces, boards, issues) and administrative ones (managing members, renaming the organization and so on).
3. Object permissions can be granted on the whole organization or on a specific space. The effective permissions are the union of the two levels.
4. The model had four versions. After each one we came up with cases it could not express, and changed it.
5. We dropped permissions on individual boards: the queries became too complex and the setup too confusing.
6. Flags in one column were replaced with separate bool columns, because the database cannot use an index for flags.

## Why no roles

The best-known approach to permissions is RBAC (role based access control). A user is assigned a role, such as "admin", "member" or "viewer", and the permissions belong to the role. This is convenient when there are many users and few sets of permissions.

Boards has no roles. Every member of an organization has their own set of permissions, and an administrator configures it directly. While organizations are small, this is enough: a role would be needed to avoid configuring the same thing for dozens of people, and there are no such organizations yet. If users ask for roles, they can be added later: a role is just a saved set of the same permissions.

The rest of the article is about how that set works and how many times we changed it.

## The first version: one set of flags

The first version appeared a couple of days after organizations. A member had one set of permissions as flags:

```csharp
[Flags]
public enum AccessLevel : byte
{
    Read = 1,
    Create = 2,
    Update = 4,
    Delete = 8,
    Manage = 16,
}
```

The same flags could be granted on a specific space or a specific board. If the reference to the space or board was empty, the permissions applied to all of them.

After every version we checked which cases it could express and which it could not. In the first version you could not let a person rename the organization without also letting them manage members: `Manage` was in the same set of flags as the object permissions.

## The second version: administrative permissions apart

In the second version the administrative permissions moved to a separate set, and the object permissions kept only read, create, update and delete:

```csharp
[Flags]
public enum AdminAccessLevel : byte
{
    None = 0,
    CreateSpaces = 1,
    ManagePermissions = 2,
    UpdateOrganization = 4,
    DeleteOrganization = 8,
    All = CreateSpaces | ManagePermissions | DeleteOrganization | UpdateOrganization,
}
```

But the second version also had cases it could not express. For example, a member should see a space and create issues in it, but not rename the space itself. One set of flags per space is not enough for that: "create" is about what is inside the space, while "update" and "delete" are about the space itself.

## The third version: permissions on an entity and on its children

In the third version permissions split into two groups. A member got levels for a whole type of entity: all spaces, all boards and all issues of the organization. Direct permissions on a space or a board now consisted of permissions on the entity itself and permissions on its children:

```csharp
public class DirectSpacePermission
{
    public long SpaceId { get; set; }
    public long OrganizationUserId { get; set; }

    public ChildrenAccessLevel ChildrenIssuesAccessLevel { get; set; }
    public ChildrenAccessLevel ChildrenEpicsAccessLevel { get; set; }
    public EntityAccessLevel EntityAccessLevel { get; set; }
}

[Flags]
public enum EntityAccessLevel : byte
{
    None = 0,
    Read = 1,
    Update = 4,
    Delete = 8,
    All = Read | Update | Delete
}
```

`EntityAccessLevel` has no `Create`: you can only create something inside an entity, so that permission exists only in `ChildrenAccessLevel`. Boards had the same kind of table.

The model could now express almost any case, but at a price. To find out whether a user can update an issue, we had to check their level in the organization, their direct permissions on the space and their direct permissions on the board. The query "which issues can this user see" turned into a union of several sources of permissions.

## The fourth version: permissions only down to the space

In the fourth version we made two changes.

**We dropped permissions on individual boards.** Queries with three levels of permissions became too complex, and they would have slowed down as the data grew. Board permissions also complicated the UI: an administrator would have to configure permissions for every board in every space. We decided the space was enough as the access boundary: if a board has to be shown to other people, it can be moved to a separate space.

**We replaced flags with separate columns.** While permissions are stored as flags in one column, the check "can this member create issues" becomes a bitwise operation, `(issues_access_level & 2) <> 0`. A regular index does not work for such a condition, and as the tables grew that would become a problem. A separate `can_create_issues` column is filtered with a plain comparison:

```csharp
public class OrganizationUser
{
    public long Id { get; set; }
    public long OrganizationId { get; set; }
    public Guid UserId { get; set; }
    public AdminAccessLevel AdminAccessLevel { get; set; }

    public bool CanRead { get; set; }
    public bool CanCreateSpaces { get; set; }
    public bool CanUpdateSpaces { get; set; }
    public bool CanDeleteSpaces { get; set; }
    public bool CanCreateEpics { get; set; }
    public bool CanUpdateEpics { get; set; }
    public bool CanDeleteEpics { get; set; }
    public bool CanCreateIssues { get; set; }
    public bool CanUpdateIssues { get; set; }
    public bool CanDeleteIssues { get; set; }
}
```

Direct permissions on a space have the same set of columns, without creating spaces. Administrative permissions stayed as flags: they are checked for a single member rather than used to filter lists.

Along the way, four permission-checking services (for spaces, boards, statuses and issues) were merged into one `AccessService`.

## How the check works now

A member has two levels of permissions: on the whole organization and on specific spaces. The effective permissions on a space are their union: if a permission exists on at least one level, the member has it.

```csharp
public AccessLevels Merge(AccessLevels? other)
{
    if (other is null)
        return this;

    return new AccessLevels
    {
        CanRead = CanRead | other.CanRead,
        CanCreateEpic = CanCreateEpic | other.CanCreateEpic,
        CanUpdateIssue = CanUpdateIssue | other.CanUpdateIssue,
        // ... and so on for every permission
    };
}
```

The list of spaces a user can see is built the same way: if they can read everything in the organization, it is one query; otherwise it is the spaces they have a direct read permission on.

```csharp
public async Task<T> GetAvailableSpaces<T>(
    OrganizationAuthData authData,
    Func<IQueryable<Space>, Task<T>> map,
    CancellationToken cancellationToken)
{
    var canGloballyRead = await GetUserData(authData, x => x.CanRead, cancellationToken);
    if (canGloballyRead)
        return await map(GetAllSpacesQuery(authData));

    var query = context.DirectSpacePermissions
        .Where(sos => sos.OrganizationUser!.OrganizationId == authData.OrganizationId)
        .Where(sos => sos.OrganizationUser!.UserId == authData.UserId)
        .Where(sos => sos.CanRead)
        .Select(sos => sos.Space!);

    return await map(query);
}
```

The service returns a query rather than a ready list, and the calling code adds its own conditions to it. So the permission filter and the data filter run in the database as one SQL query.

Besides permissions, the model's own rules apply. A default space and a default board cannot be deleted even if the member has the delete permission, and the delete permission cannot be granted on them. Every such case is pinned down by an integration test.

Administrative permissions have only grown since then: mass moving of boards, managing attributes, linking Telegram chats, viewing billing. Each new action needs only a new flag.

## Results

- **Permissions without roles.** Every member is granted permissions directly. Roles can be added later if they are needed.
- **Two kinds of permissions.** Object permissions and administrative permissions are stored and checked separately.
- **Two levels.** Permissions are granted on the organization or on a space and combined with "or".
- **The access boundary is the space.** We dropped permissions on individual boards for the sake of simple queries and a clear setup.
- **Columns instead of flags.** Permissions used to filter lists are stored as separate bool columns.
- **Four versions of the model.** Each next version appeared after the previous one could not express a new case.

## What comes next

When several people work in one organization, they need a way to refer to issues in conversation. An internal `id` does not work for that. The next article is about how spaces got short keys and issues got numbers like `BRD-42`.
