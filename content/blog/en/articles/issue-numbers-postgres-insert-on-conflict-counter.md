---
title: Sequential issue numbers — a counter on PostgreSQL INSERT ON CONFLICT, space keys and organization URLs
description: Part 18 of the series about building a Telegram task tracker solo. How issues got sequential numbers like BRD-42, why a counter on INSERT ... ON CONFLICT DO UPDATE suited them better than a PostgreSQL sequence, and how space keys and organization URLs work.
seoTitle: Sequential Issue Numbers with PostgreSQL INSERT ON CONFLICT
seoDescription: Part 18: sequential issue numbers like BRD-42 — a counter on PostgreSQL INSERT ON CONFLICT DO UPDATE instead of a sequence, space keys and organization slugs.
type: article
series: architecture-first
part: 18
createdAt: 2026-10-14 14:00
updatedAt: 2026-10-14 14:00
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 18.
> In the [previous article](access-control-without-roles-task-tracker-permissions) we went through access control. When several people work in an organization, they need a way to refer to each other's tasks, and an internal `id` is hard to say and remember.

## The short version

How tasks in Boards got short keys:

1. First we decided what links would look like, so we would not have to break them later: `/organizations/{organization}-{suffix}/issues/{space key}-{number}`.
2. An organization's address is a slug the user chooses plus a random four-character suffix. The address cannot be used to take someone else's name or to check whether an organization exists.
3. Every space has a three-character key, unique among the live spaces of the organization. The key of a deleted space can be taken again.
4. Issue numbers in a space go in sequence: 1, 2, 3 and so on. The last issued number is stored in a counter table and incremented with a single `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` query.
5. When a board moves to another space, its issues get new numbers in that space.

## First, what links look like

While a task has no readable name, the only way to link to it is to copy the URL from the address bar. We needed task numbers, and instead of inventing something new we took Jira's approach: `BRD-42`, where `BRD` is the space key and `42` is the task number in it.

But before building the numbers, we had to decide what a full link to a task would look like. Links take on a life of their own: they are sent to chats and pasted into other tasks and documents. If the format changes after links have spread, all of them stop working. That is why organization addresses appeared before issue numbers.

## The organization address: a slug and a random suffix

The first idea is to use the organization's name as its address: `/organizations/laraue`. That has two problems. Anyone can create an organization with someone else's name and take an address they have nothing to do with. And the address can be used to check whether an organization exists, for example whether Boards has a `laraue` organization.

So the address has two parts: a slug the user chooses and a random four-character suffix the app generates.

```csharp
/// <summary>
/// Organization slug. The public name to access this organization.
/// </summary>
[MaxLength(64)]
public string Slug { get; set; } = string.Empty;

/// <summary>
/// Postfix to allow slugs be ununique and make it harder to access something else organization.
/// </summary>
[MaxLength(4)]
public string SlugPostfix { get; set; } = string.Empty;
```

The slug does not have to be unique: two organizations can both be called `laraue`, but their addresses differ, for example `laraue-a1B2` and `laraue-x7Kq`. Someone else's address cannot be guessed from the name, and taking names is pointless.

## The space key

A space key is three characters the user sets when creating a space, for example `BRD`. The app converts it to upper case. The key must be unique within the organization, but only among spaces that are not deleted: spaces are soft-deleted, and the key of a deleted space can be taken again. For that the database has a partial unique index:

```csharp
modelBuilder.Entity<Space>()
    .HasIndex(x => new { x.OrganizationId, x.Key })
    .IsUnique()
    .HasDatabaseName(Constraints.SpaceKeyIndexName)
    .HasFilter("deleted_at IS NULL");
```

This index had a story in production. In the logs we found a `500` error when creating a space: `duplicate key value violates unique constraint "ix_spaces_organization_id_key"`. The service did not check whether the key was free and relied only on the index, so the user got a server error instead of a clear message.

The fix has two parts. Before saving, the service checks that no live space of the organization has this key. And if two requests with the same key arrive at once, both pass the check and the second fails on the index. So a uniqueness violation (PostgreSQL error code `23505`) with this index's name is turned into the same validation error.

A second bug turned up at the same time. Issue search built a dictionary of spaces by key and did not exclude deleted spaces. When a deleted space and a live one in the same organization ended up with the same key, the dictionary failed on the duplicate, and the whole search failed with it.

## The issue number: why not a sequence

PostgreSQL has a ready-made mechanism for numbers: sequences. But a sequence allows gaps: if the transaction that took a number rolls back, that number never comes back. We wanted the numbers in a space to go one after another, with no holes.

So the last issued number is stored in a separate table, one row per space:

```csharp
public class SpaceCounter
{
    public long SpaceId { get; set; }
    public int LastNumber { get; set; }
}
```

One query issues the next number:

```sql
INSERT INTO space_counters (space_id, last_number)
VALUES ({0}, {1})
ON CONFLICT (space_id) DO UPDATE
SET last_number = space_counters.last_number + {1}
RETURNING last_number
```

If the space has no row yet, the query creates it. If it has one, the query increments `last_number` and returns the new value. So there is no separate check for whether the counter exists, and therefore no race between the check and the insert.

The query runs inside the same transaction that creates the issue:

```csharp
private async Task<int> GetLastNumber(long spaceId, int count, CancellationToken cancellationToken)
{
    context.Database.EnsureTransactionStarted();

    var query = FormattableStringFactory.Create(SqlQuery, spaceId, count);
    var result = await context.Database
        .SqlQuery<int>(query)
        .ToListAsyncEF(cancellationToken);

    return result.First();
}
```

This is exactly what removes the gaps. The `UPDATE` locks the counter row until the end of the transaction, so a second request for a number in the same space waits until the first one finishes. If the transaction rolls back, the counter increment rolls back with it, and the next issue gets the same number. The price is that issues of one space are created one at a time, which is not noticeable in a task tracker.

The second parameter, `count`, reserves several numbers at once. It is needed when a board is moved, described below. In the first version, the method that returns the first number of the reserved range was off by one (`last - count + 2` instead of `last - count + 1`). It was found and fixed together with the mass-move tests.

## Numbers for existing issues

By the time numbers appeared, users already had issues. A migration numbered them within each space in the order they were created and wrote the last number into the counters:

```sql
WITH issue_counters as (
    select i.id, e.space_id, row_number() over (partition by e.space_id order by i.id) as number from issues i
    inner join statuses s on i.status_id = s.id
    inner join epics e on s.epic_id = e.id
    order by i.id
)
insert into issue_numbers
select ic.id, ic.space_id, ic.number
from issue_counters ic;
```

In the first version of the migration, `row_number()` had no `order by i.id`. Without it PostgreSQL numbers rows in an arbitrary order, and old tasks could have got their numbers mixed up. We found both bugs by asking AI what would happen in different cases, and fixed them in one commit.

## Moving a board to another space

An issue number is a number within a space. When a board moves to another space, its issues get new numbers there: the service reserves as many numbers in the new space's counter as there are issues moving, and hands them out in order.

The old key stops working after the move. There is no redirect from the old key to the new one yet: boards are rarely moved, and a redirect will be easy to add when it is needed.

## Results

- **The link format was decided up front.** Organization addresses appeared before issue numbers, so links would not have to be broken later.
- **An organization address cannot be taken.** The user chooses the slug, and a random suffix makes the address unique and impossible to guess.
- **A space key is unique among live spaces.** A partial unique index guarantees it, and handling error `23505` covers the race on creation.
- **Sequential numbers.** Instead of a PostgreSQL sequence, a counter table and `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` inside the issue's transaction.
- **A move changes numbers.** There is no redirect from old keys yet.

## What comes next

From here Boards started to grow wider: issues got attributes, comments, attachments and a change history, and a second developer joined the project. The next article is about attributes.
