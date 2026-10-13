---
title: Task comments — permissions, background loading and API pagination without COUNT
description: Part 22 of the series about building a Telegram task tracker in a tiny team. How task comments work in Boards: who can read, write and edit them, why they load in a separate background request, and how pagination works without a COUNT query.
seoTitle: API Pagination Without COUNT: Comments in a Task Tracker
seoDescription: Part 22: task comments — read and edit permissions, a separate background request, and API pagination without COUNT by fetching one extra row.
type: article
series: architecture-first
part: 22
createdAt: 2026-10-13 11:11
updatedAt: 2026-10-13 12:23
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative in a Tiny Team, AI-Assisted** — Part 22.
> In the [previous article](telegram-as-file-storage-web-app) we let the web app attach images to tasks. Almost at the same time as attachments, tasks got comments.

## The short version

How task comments work:

1. A comment is text up to 4096 characters, an author, creation and update dates, and a list of attachments.
2. Anyone with access to a task sees its comments. Anyone who can update the task can write them.
3. Only the author can edit or delete a comment. Nobody can edit other people's comments yet: users have not needed that so far.
4. Comments load in a separate background request, so a task opens right away even if the discussion is long.
5. Pagination does not count all comments: the query fetches one row more than needed and uses it to tell whether there is a next page.
6. Creating, editing and deleting comments end up in the task's change history.

## The model

```csharp
public class IssueComment
{
    public long Id { get; set; }

    [MaxLength(Constraints.MaxCommentLength)]
    public required string Text { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Guid OwnerId { get; set; }
    public User? Owner { get; set; }

    public long IssueId { get; set; }
    public Issue? Issue { get; set; }

    public List<IssueCommentAttachment> Attachments { get; set; } = [];
}
```

Comment attachments use the same `Attachment` model as task attachments, which we went through in the [previous article](telegram-as-file-storage-web-app). A comment is linked to an attachment through its own `IssueCommentAttachment` table, and uploading, validating and storing files work the same way as for tasks.

## Who can read, write and edit

Comment permissions build on the task permissions we covered in [part 17](access-control-without-roles-task-tracker-permissions):

- **Reading** comments is open to anyone with access to the task.
- **Writing** a comment requires the right to update the task.
- **Editing and deleting** a comment is only for its author. Task permissions do not matter here: even an organization administrator cannot change someone else's comment.

The check in the service for editing a comment is simple:

```csharp
if (comment?.OwnerId != request.AuthData.UserId)
    throw new ForbiddenException($"Comment: {request.CommentId} is not exists or not available to edit");
```

We have not added a way to edit other people's comments yet: users have not needed it so far.

The UI needs to know whether to show "Edit" and "Delete" on a comment. So the `CanModify` flag is computed right in the query that loads the comments, and there is no need to check permissions for each comment separately.

## A separate request, loaded in the background

Comments are not part of the response that returns a task. They have their own paginated request, and the UI sends it in the background once the task is already open. This way the task opens quickly even with a long discussion under it: the user already sees the task while the comments are loading.

## Pagination without COUNT

Regular pagination returns the total number of records along with the page, so the UI can show "page 3 of 12". For that the database needs a second query: a `COUNT(*)` over all matching records.

Comments do not need the total: it is enough to know whether there is a next page. So we use short pagination: the query fetches one record more than the page size.

```csharp
public static async Task<ShortPaginatedResult<TEntity>> ShortPaginateEFAsync<TEntity>(
    this IQueryable<TEntity> query,
    IPaginationData pagination,
    CancellationToken ct = default)
    where TEntity : class
{
    var skip = pagination.Page * pagination.PerPage;

    var data = await query.Skip(skip)
        .Take(pagination.PerPage + 1)
        .AsNoTracking()
        .ToListAsync(ct);

    return ShortPaginatedResultUtil.BuildResult(pagination, data);
}
```

If more records came back than the page size, there is a next page. The extra record is dropped, and the response keeps only the `HasNextPage` flag:

```csharp
var hasNextPage = data.Count > request.PerPage;
if (hasNextPage)
{
    data = data.Take(request.PerPage).ToList();
}

return new ShortPaginatedResult<TEntity>(request.Page, request.PerPage, hasNextPage, data);
```

This way a page loads with one query instead of two. Today the web app requests the first page of 100 comments, and if the response has `HasNextPage = true`, it can load the next one.

Both kinds of pagination, the short one and the full one that also counts the total number of records, live in our `Laraue.Core` package ([source code](https://github.com/Laraue/Laraue.Core)). We use the full one where the user sees that number, for example for the number of tasks in a board column.

Comments of a task are sorted by `Id`, that is, in the order they were created, and pages are taken with `Skip`/`Take`. This is offset pagination, not cursor pagination: for the comments of one task it is enough.

## Comments in the history

Creating, editing and deleting a comment are recorded in the [change history](audit-log-change-history-one-transaction) the same way as changes to the task itself: in the same transaction, with the `Comment` entity type. So the history shows who changed a comment, when, and what the text was before.

## Results

- **Anyone with access to a task can read, anyone who can update it can write.**
- **Only the author edits and deletes.** Nobody can edit other people's comments yet: there has been no need for it.
- **A separate background request.** The task opens right away, and comments load while the user is reading it.
- **Pagination without COUNT.** The query fetches one record more than the page size to tell whether there is a next page.
- **The same attachments and the same history.** Comments use the shared attachment model and write to the shared audit log.

## What comes next

The comments UI, like the history UI, was built by Nikolay, the frontend developer who was already working on the project with us by then. The [next article](frontend-rewrite-nuxt-architecture-vitest) is about what changed in the project when a second person came in.
