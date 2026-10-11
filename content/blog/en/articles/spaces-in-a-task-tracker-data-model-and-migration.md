---
title: Spaces in a task tracker — grouping boards by project, the data model and migrating existing users
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

1. We added a grouping level above the board. A **space** contains boards, a board contains issues. The space carries a name and a color (a short key came later), and it is what the navigation switches between.
2. We first put a nullable `SpaceId` on both the board and the issue, but after several iterations kept the space on the **board** only, as a required foreign key. An issue now finds its space through `Issue → Status → Epic → Space`, and that link is stored in exactly one place.
3. We removed the "board without a space" state: every user has a default space with a default Backlog board, and every new space is created together with its own Backlog.
4. We migrated the existing users' data inside the migration with plain SQL: one `insert … select` per level and one `update` for the issues.
5. We marked the defaults with an `IsDefault` flag and forbade deleting them.
6. We moved all the code that moves things between spaces into one place.

We got to this shape in three steps in twelve days. The first version, which we rewrote almost at once, is the interesting part.

## Why boards were not enough

We are the developers of Laraue Boards and also some of its most active users, and after a few weeks of daily use one thing started to hurt. A board (an epic in the code) is a kanban board with its own columns, and all of them were in one flat list. Boards tied to personal life ended up next to project boards, and we wanted to keep them apart.

There were cheaper options than a new entity:

- **Tags on a board.** Flat, no hierarchy, and nothing to attach permissions to later.
- **A separate account for work.** Switching accounts is exactly the friction we wanted to remove.
- **Folders.** This is a space under another name, so we gave it a proper one.

The idea is not new. Confluence has spaces, Trello and Notion have workspaces, Jira has projects, Linear has teams. We went with **space**: a named, colored group of boards that you switch to as a whole. The product vocabulary became **Space → Board → Issue**, and in the code a board is an `Epic`. The [documentation](https://boards.laraue.com/en/documentation) uses "board" and "epic" interchangeably.

## Groundwork: the rename and two small tables (April 11–12)

Before spaces, the code had been renamed to the vocabulary you saw in [part 9](issue-board-telegram-mini-app): `Card` became `Issue`, `CardCategory` became `Epic`, `CardStatus` became `Status`. It took two migrations on April 11 (`RenameMainEntities` and `RenameEntitiesFks`), and they were worth doing before adding anything new on top of the old names.

The same weekend added two small things that spaces would use:

- `TouchedAt` on the epic, so that boards are sorted by the last activity in them.
- A `UserPreferences` table, one row per user, to remember what the user used last. The current space would live there.

## The first version: a nullable SpaceId on the board and on the issue (April 14)

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

Both `Epic` and `Issue` got a reference to it:

```csharp
public long? SpaceId { get; set; }
public Space? Space { get; set; }
```

Five migrations, all written on April 13–14, show how the day went:

| Migration | What it did |
|---|---|
| `CreateSpaces` | the `spaces` table |
| `CreateSpacePreference` | `space_id` in the user preferences: the space the user was last in |
| `AddSpaceIdToEpic` | nullable `space_id` with an index and a foreign key on `epics` |
| `AddSpaceIdToIssue` | the same on `issues` |
| `MakeSpaceIdInPreferencesNullable` | a user may have no space selected yet |

It was the obvious first version. The board of a space is a query over issues, so each issue carried its own `SpaceId` next to the epic's. Everything was nullable because the existing boards and issues had no space yet, and a nullable column lets the migration pass without touching the data.

The frontend followed the same day. A space switcher popup (`LnbSpacePopup`) appeared on April 14, and the edit-space and delete-space modals on April 17. The texts came in English and Russian together (the commits of April 17 touch both locale files).

## Can a foreign key be nullable?

Yes. SQL lets a foreign key column be `NULL` in PostgreSQL, SQL Server, MySQL and SQLite alike: a row with `NULL` is simply not checked against the parent table, and it means "no parent". So the real question is not "can it?" but "is *no parent* a state that exists in your domain?"

- **Nullable is right when absence is a real state.** In our own model an issue created in the web app has no Telegram message behind it, so `Issue.TelegramMessageId` is `long?`, and the code that reads it expects `null`.
- **Nullable is wrong when absence is only a gap in the data.** A board with no space is not a state the product has. It is a board the migration has not reached yet, and every reader of that column has to invent a meaning for `null`.

In the second case, make the key required and give the "nothing yet" case a row: a default space, the "default row" approach from part 9. The rest of this article is how we got to that conclusion, including the wrong turn.

## A nullable key again, and what part 9 already said

[Part 9](issue-board-telegram-mini-app) has a whole section about exactly this choice: a nullable foreign key or a default row. We knew the argument and took the shortest path anyway, because it got a working version out fastest. Every `space_id` was `bigint null`, which meant that every piece of code reading one had to answer "what does an issue without a space mean?", and the honest answer was that it meant nothing.

On April 23 we wrote the migration that removed the "no space" state. Trimmed to the part about spaces, it looked like this:

```sql
insert into spaces (name, color, creator_id, created_at, updated_at, organization_id, is_default)
select 'Default Space', '#50b3b3', o.owner_id, o.created_at, o.created_at, o.id, true
from organizations o
where o.type = 1;

insert into epics (name, user_id, color, created_at, touched_at, updated_at, organization_id, space_id, is_default)
select 'Backlog', s.creator_id, '#ff0000', s.created_at, s.created_at, s.created_at, s.organization_id, s.id, true
from spaces s;

update issues i
set space_id = s.id,
    organization_id = s.organization_id
from spaces s
where i.space_id is null and s.is_default = true and s.creator_id = i.user_id;
```

That is the core of the data migration: one default space for every user, one Backlog board in every space, and every existing issue moved under it. The full script had a few more statements. The first of them created a *Personal* organization for each user, and that is the `organizations` table in the first `from` clause above. We come back to it in the next article.

The file itself did not survive. It was deleted three days later in the commit that reshaped the schema, but the rule it encoded stayed in the code.

## The final shape: the space lives on the board only (April 26)

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

In EF Core a filter by space is a walk along that chain. Two real lines from the backend:

```csharp
query = query.Where(i => i.Status!.Epic!.Space!.Key == spaceKey);
```

```csharp
.Where(x => x.Status!.Epic!.Space!.OrganizationId == issueData.OrganizationId)
```

The price is a few joins. The gain is that there is exactly one place that says where an issue lives. Moving a board to another space means updating one `epics` row, not rewriting the `space_id` of every issue in it, and the two can never disagree, because the second copy does not exist.

A day earlier, on April 25, an `IsDefault` flag had appeared on spaces and boards. Together with the required foreign key it gave the final rule: **there is always a space and always a board to put an issue in.**

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

The Backlog is created with `IsDefault = true` (see [`CoreSpacesService.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.Services/CoreSpacesService.cs)). A default space and a default Backlog cannot be deleted: otherwise "there is always a place for an issue" becomes false the moment someone deletes it. In May we fixed the places where the API still reported such items as deletable (a commit on May 11) and forbade granting the delete permission on them (May 12), each with a test.

## Moving issues and boards between spaces

The first move UI was written on April 16, two days after the spaces themselves: a modal to move an issue, with two pickers inside it, one for the board and one for the space. On May 19 and 20 the movement logic was rewritten into one place, together with a test class for mass moves. By then there were three kinds of move (an issue to another board, a board to another space, and a whole space), and the three copies of the same logic would have drifted apart.

The product rule that came out of it is simple, and the [documentation](https://boards.laraue.com/en/documentation) states it: a board's space is set when the board is created and stays fixed. Moving a space or a board along with everything inside it is a separate, deliberate action, which moves it between organizations.

## Deleting a space

Delete went through three versions: the modal on April 17, a rewrite of the logic on June 4, and in September a soft delete. Today a space is marked as deleted together with everything below it, in one transaction, so that nothing stays attached to a space that no longer exists. The method walks the same chain as the queries above, from the bottom up:

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

Four `ExecuteUpdateAsync` calls instead of loading anything into memory, and the transaction makes them all or nothing. The test that pins it down has the name it deserves: `User_ShouldSoftDeleteSpaceAndAllDescendants_WhenSpaceIsDeleted`.

## Conclusions

- **Put the relation at the narrowest level that can carry it.** The space belongs to the board. The issue gets it for free, and moving things stays a one-row operation.
- **Prefer a default row to a null.** Every nullable key is a question that every reader of the data has to answer again. "Every user has a space and every space has a Backlog" is an invariant you can test.
- **A data migration is part of the feature.** A few dozen lines of SQL decided whether the existing users would open the app and see their boards, and they were worth writing and reading as carefully as the model.
- **Change the shape of the schema early.** The model changed three times in twelve days. That was cheap while the app had a handful of users and expensive to even imagine a few months later.

If you are curious how we name integration tests, [`SpacesControllerTests.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/tests/Laraue.Apps.Boards.IntegrationTests/SpacesControllerTests.cs) is a good place to look: every test says who does what and under which condition.

## What comes next

Spaces answered one question: "mine or the project's". The migration above already hints at the next one: it had to create a *Personal* organization for every user, because a space is going to belong to someone other than a single person. The next article is about organizations: how the app went from one user to many, what a join code is, and why one of the first tests we wrote for them was "create organization".
