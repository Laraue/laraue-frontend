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
6. We moved all the code that moves things between spaces into one place.

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

The space became **required on the board**, and the issue lost both `EpicId` and `SpaceId`. An issue now knows one thing: its status. A status belongs to an epic, an epic belongs to a space:

```
Issue → Status → Epic → Space
```

In EF Core a filter by space is a walk along that chain. Two lines from the backend code:

```csharp
query = query.Where(i => i.Status!.Epic!.Space!.Key == spaceKey);
```

```csharp
.Where(x => x.Status!.Epic!.Space!.OrganizationId == issueData.OrganizationId)
```

Queries got a few more joins, but an issue's space is now stored in one place only. To move a board to another space, it is enough to change `space_id` in one `epics` row, not on every issue on the board. The values have nothing to disagree about: there is no second copy.

Shortly before that, an `IsDefault` flag had appeared on spaces and boards. Together with the required foreign key it gave the final rule: **there is always a space and always a board to put an issue in.**

## Default rows in code

The same rule is in the code that creates a space. Every new space is created together with its Backlog board, in one `SaveChanges`:

```csharp
var entity = new Space
{
    CreatorId = creatorId,
    Name = name,
    Color = color,
    CreatedAt = dateTime,
    UpdatedAt = dateTime,
    Key = key.ToUpper(),
    OrganizationId = organizationId,
    Epics = new List<Epic>
    {
        OrganizationDefaults.GetNewBacklogEpicEntity(creatorId, dateTime)
    }
};

context.Spaces.Add(entity);
```

The Backlog is created with `IsDefault = true` (see [`CoreSpacesService.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.Services/CoreSpacesService.cs)). A default space and a default Backlog cannot be deleted: without them the rule "there is always a place for an issue" would stop holding. Later we fixed the places where the API still reported such items as deletable and forbade granting the delete permission on them, each time with a test.

## Moving issues and boards between spaces

The first move UI appeared almost right after the spaces themselves: a modal to move an issue, with two pickers inside it, one for the board and one for the space. Later all the movement logic was gathered in one service and covered with mass-move tests. By then there were three kinds of move (an issue to another board, a board to another space, and a whole space), and the three copies of the same logic would have drifted apart.

The rule for users turned out simple, and it is described in the [documentation](https://boards.laraue.com/en/documentation): a board's space is chosen when the board is created and cannot be changed in the board settings. Moving a board or a space along with everything inside it is a separate action, and it works across organizations too.

## Deleting a space

Delete was rewritten three times: first a confirmation dialog, then a rewrite of the logic, and later a soft delete. Today a space is marked as deleted together with everything below it, in one transaction, so that nothing stays attached to a space that no longer exists. The method walks the same chain as the queries above, from the bottom up:

```csharp
await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

var epicIds = context.Epics.Where(x => x.SpaceId == id).Select(x => (long?)x.Id);
var statusIds = context.Statuses.Where(x => epicIds.Contains(x.EpicId)).Select(x => (long?)x.Id);

await context.Issues
    .Where(x => statusIds.Contains(x.StatusId))
    .ExecuteUpdateAsync(u => u
        .SetProperty(p => p.DeletedAt, deletedAt)
        .SetProperty(p => p.DeletedByUserId, deleterId), cancellationToken);

// the same update follows for the statuses, the epics and finally the space itself

await transaction.CommitAsync(cancellationToken);
```

Four `ExecuteUpdateAsync` calls instead of loading anything into memory, and the transaction makes them all or nothing. The name of the test that checks it speaks for itself: `User_ShouldSoftDeleteSpaceAndAllDescendants_WhenSpaceIsDeleted`.

## Conclusions

- **Put the relation at the narrowest level that can carry it.** The space is stored on the board. The issue gets it through the board, and moving a board changes one row.
- **Prefer a default row to a null.** Every nullable key is a question that every reader of the data has to answer again. "Every user has a space and every space has a Backlog" is an invariant you can test.
- **A data migration is part of the feature.** A few dozen lines of SQL decided whether the existing users would open the app and see their boards, and they were worth writing and reading as carefully as the model.
- **Change the shape of the schema early.** The model changed three times in twelve days. That was cheap while the app had a handful of users and expensive to even imagine a few months later.

Examples of the integration tests are in [`SpacesControllerTests.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/tests/Laraue.Apps.Boards.IntegrationTests/SpacesControllerTests.cs): the name of every test tells who does what and under which condition.

## What comes next

Spaces answered one question: "mine or the project's". The migration above already hints at the next one: it had to create a *Personal* organization for every user, because a space is going to belong to someone other than a single person. The next article is about organizations: how the app went from one user to many, what a join code is, and why one of the first tests we wrote for them was "create organization".
