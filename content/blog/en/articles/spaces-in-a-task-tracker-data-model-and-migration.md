---
title: Spaces in a task tracker — grouping boards by project, the data model and moving existing users' data
description: Part 14 of building a Telegram task tracker solo. How spaces group boards by project, why the space lives on the board and not on the issue, and the SQL migration that gave every existing user a default space.
seoTitle: Spaces in a Task Tracker: Data Model and Migration
seoDescription: Part 14: how we added spaces to a task tracker — a required space on the board, default rows instead of nullable keys, and a SQL migration for existing users.
type: article
series: architecture-first
part: 14
createdAt: 2026-10-11 14:00
updatedAt: 2026-10-11 14:00
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 14.
> The [previous article](telegram-login-widget-dotnet-auth) added a login that works in a browser. Now the boards themselves get a new level above them: spaces, which group boards by project.

## The short version

How we grouped boards by project in a task tracker without turning the data model into a tangle of nullable columns:

1. We added a grouping level above the board. A **space** contains boards, a board contains issues. The space carries a name and a color (a short key came later), and in the interface you switch between spaces.
2. We first put a nullable `SpaceId` on both the board and the issue, but after several iterations kept the space on the **board** only, as a required foreign key. An issue now finds its space through `Issue → Status → Epic → Space`, and that link is stored in exactly one place.
3. We removed the "board without a space" state: every user has a default space with a default Backlog board, and every new space is created together with its own Backlog.
4. We migrated the existing users' data inside the migration with plain SQL: one `insert … select` per level and one `update` for the issues.
5. We marked the defaults with an `IsDefault` flag and forbade deleting them.

All of this fit into twelve days, and the schema changed three times along the way. The permissions system on top of it took us several rewrites before it covered every case we could think of, and that is a story for one of the next articles.

## Why boards were not enough

At first Boards was built by one person, who was also its main user. The problem was that the boards mixed personal affairs with everything related to Laraue. A board (an epic in the code) is a kanban board with its own columns, and there was no level above it that would let us split boards by project.

We looked at how Jira solves it, where work is grouped by projects, and adapted that. We called the new entity a **space**, which is also what Confluence calls its sections. A space is a group of boards with a name and a color. The product hierarchy became **Space → Board → Issue**. The [documentation](https://boards.laraue.com/en/documentation) uses "board" and "epic" interchangeably.

## Groundwork: the rename and user preferences

Before we started on spaces, we renamed the main entities. We had started to mix up our own names, so we decided to bring them to one form: `Card` became `Issue`, `CardCategory` became `Epic`, `CardStatus` became `Status`. You have already seen the new names in [part 9](issue-board-telegram-mini-app). It took two migrations, `RenameMainEntities` and `RenameEntitiesFks`, and it was better to do it before anything new was built on top of the old names.

While at it, we added a couple of small features:

- `TouchedAt` on the epic, so that boards are sorted by the last activity in them.
- A `UserPreferences` table: one row per user with their settings. First it stored the chosen sort order of the boards (by last activity or alphabetical), and later the last selected space was added.

## The first version: a nullable SpaceId on the board and on the issue

The first commits ([`dbe944d`](https://github.com/Laraue/Laraue.Apps.Boards/commit/dbe944d) and [`526bfbc`](https://github.com/Laraue/Laraue.Apps.Boards/commit/526bfbc)) added a `Space` entity and CRUD for it:

```csharp
public class Space
{
    public long Id { get; set; }

    [MaxLength(128)]
    public required string Name { get; set; }

    [MaxLength(7)]
    public string? Color { get; set; }

    public Guid CreatorId { get; set; }
    public User? Creator { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>Epics linked to the space.</summary>
    public IList<Epic>? Epics { get; set; }
}
```

Both `Epic` and `Issue` got a reference to the space:

```csharp
public long? SpaceId { get; set; }
public Space? Space { get; set; }
```

The first variant consisted of five migrations:

| Migration | What it did |
|---|---|
| [`CreateSpaces`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260413113436_CreateSpaces.cs) | the `spaces` table |
| [`CreateSpacePreference`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414073038_CreateSpacePreference.cs) | `space_id` in the user preferences: the space the user was last in |
| [`AddSpaceIdToEpic`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414120632_AddSpaceIdToEpic.cs) | nullable `space_id` with an index and a foreign key on `epics` |
| [`AddSpaceIdToIssue`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414123244_AddSpaceIdToIssue.cs) | the same on `issues` |
| [`MakeSpaceIdInPreferencesNullable`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414123835_MakeSpaceIdInPreferencesNullable.cs) | a user may have no space selected yet |

We wanted to get all the issues of a space with one query, without a join through the epic, so we added `SpaceId` not only to the epic but to the issue itself. We made the columns nullable because the tables already had rows with no space yet: the migration adds an empty column, and the existing data does not have to be touched.

## When a foreign key can be null

Technically, a foreign key column can be `NULL` in PostgreSQL, SQL Server, MySQL and SQLite alike: a row with `NULL` is not checked against the parent table, and it means "no parent". What matters more is whether *no parent* is a state that exists in your domain. The answer decides whether you need `NULL`.

- **Nullable is right when absence is a real state.** In the Boards model an issue created in the web app has no Telegram message behind it, so `Issue.TelegramMessageId` is `long?`, and the code that reads it expects `null`.
- **Nullable is wrong when absence is only a gap in the data.** A board with no space should not exist in the product: if a board has no space, the migration simply has not reached it yet, and every reader of that column has to invent a meaning for `null`.

In the second case it is better to make the key required and create a real record for the "nothing yet" case, for example a default space. This approach is covered in detail in [part 9](issue-board-telegram-mini-app). The rest of this article is how we got there, including the wrong turn.

## What the nullable keys got in the way of

Every `space_id` column allowed `null` (`bigint null`), so everywhere it was read, the code had to handle the case "an issue has no space" separately, although the product should never have such a state.

To remove that state, we wrote a migration. Trimmed to the part about spaces, boards and issues, it looked like this:

```sql
insert into spaces (name, color, creator_id, created_at, updated_at, organization_id, is_default)
select 'Default Space', '#50b3b3', o.owner_id, o.created_at, o.created_at, o.id, true
from organizations o
where o.type = 1;

insert into epics (name, user_id, color, created_at, touched_at, updated_at, organization_id, space_id, is_default)
select 'Backlog', s.creator_id, '#ff0000', s.created_at, s.created_at, s.created_at, s.organization_id, s.id, true
from spaces s;

insert into statuses (name, epic_id, color, sort_order)
select 'New', e.id, '#dda61b', -1
from epics e
where e.is_default = true;

update issues i
set space_id = s.id,
    organization_id = s.organization_id
from spaces s
where i.space_id is null and s.is_default = true and s.creator_id = i.user_id;

update issues i
set epic_id = e.id
from epics e
where i.epic_id is null and e.space_id = i.space_id and e.user_id = i.user_id;

update issues i
set status_id = (select id from statuses s where s.epic_id = i.epic_id order by s.sort_order limit 1)
where i.status_id is null;
```

Here is what happens:

- A **default space** is created for every user. Every space belongs to an organization, so the same migration also created a "personal organization" for every user, with that user as its only member (in the query above that is the `organizations` table). What organizations are is the subject of the next article.
- A **Backlog** board with a New status is created for every space. Before, an issue without a board and status (`epic_id` and `status_id` are `null`) was considered to be in the backlog; now there is an ordinary board for that. Boards belong to spaces, so every space has its own Backlog.
- All the existing issues without a board move to the Backlog of their owner's space and get the first status of that board.

The full script had other statements too (membership in the organization, access rights), but they are not about spaces.

## The final shape: the space lives on the board only

The commit [`a095e69`](https://github.com/Laraue/Laraue.Apps.Boards/commit/a095e69) has a modest message — "app is now closer to target org DB schema" — and a large diff: 23 files, 1457 insertions, 341 deletions. Two of its migrations did the main work. In model terms:

```diff
 public class Epic
 {
-    public long? SpaceId { get; set; }
+    public long SpaceId { get; set; }
 }

 public class Issue
 {
-    public long? EpicId { get; set; }
-    public long? SpaceId { get; set; }
-    public long? StatusId { get; set; }
+    public long StatusId { get; set; }
 }
```

The space became **required on the board**, and the issue lost both `EpicId` and `SpaceId`. Of the whole hierarchy, the issue now references only its status. A status belongs to an epic, an epic belongs to a space:

```
Issue → Status → Epic → Space
```

To select the issues of a space in EF Core, it is enough to follow the navigation properties from the status to the epic. This is what the filter by space looked like in the code at the time:

```csharp
query = query.Where(x => x.Status!.Epic!.SpaceId == request.SpaceId);
```

Queries got a few more joins, but an issue's space is now stored in one place only. To move a board to another space, it is enough to change `space_id` on the board itself, and the issues on it stay untouched. If the space were also stored on the issue, it would have to be changed on every issue of the board, and missing one would leave an issue and its board in different spaces.

Shortly before that, spaces and boards got an `IsDefault` flag that marks the default space and board. Together with the required foreign key it guarantees that **a user always has at least one space, and in it a board where an issue can be added.**

## Default rows in code

When a user creates a new space, a Backlog board is created with it, and both are saved to the database in one operation:

```csharp
var entity = new Space
{
    CreatorId = creatorId,
    Name = name,
    Color = color,
    CreatedAt = dateTime,
    UpdatedAt = dateTime,
    OrganizationId = organizationId,
    Epics = new List<Epic>
    {
        OrganizationDefaults.GetNewBacklogEpicEntity(creatorId, dateTime)
    }
};

context.Spaces.Add(entity);
```

The Backlog is created with `IsDefault = true` (see [`CoreSpacesService.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/a095e69/src/Laraue.Apps.StructuredMessages.Services/CoreSpacesService.cs)). A default space and a default Backlog cannot be deleted: otherwise a user could be left without a space or without a board to add an issue to.

## Moving and deleting

At first only a single issue could be moved: the move dialog let you pick a space and a board. Later we added moving a board to another space and moving a whole space, and gathered all the movement logic in one service.

We first made deleting a space a hard delete, because it was quicker. Later we rewrote it as a soft delete, because deleting data for good is too dangerous.

## Results

- **The space is stored on the board only.** An issue gets it through its status and epic, and moving a board changes one row.
- **Default rows instead of null.** Every user has a default space, every space has a Backlog, and neither can be deleted.
- **The existing users' data was moved by an SQL migration.** A few dozen lines decided whether users would see their boards after the update.
- **We changed the schema while it was cheap.** The model changed three times while the app had a handful of users. A few months later such changes would have cost much more.

## What comes next

Spaces helped separate personal boards from work ones. But the migration above already created a personal organization for every user: we were preparing for several people working in one space. Organizations touched almost every API request, and the app already had users, so before them we wrote the first integration tests. They are the subject of the [next article](aspnet-core-integration-tests-typed-controller-proxy).
