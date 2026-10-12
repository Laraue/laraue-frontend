---
title: Task change history — an audit log in one transaction instead of EF Core interceptors, temporal tables and event sourcing
description: Part 20 of the series about building a Telegram task tracker solo. How Boards got a change history for tasks, why we write it explicitly in services in the same transaction as the changes themselves, and why EF Core interceptors, temporal tables and event sourcing did not fit.
seoTitle: Audit Log in ASP.NET Core: Change History in One Transaction
seoDescription: Part 20: an audit log in a task tracker — why change history is written in services in the same transaction, not with EF Core interceptors or event sourcing.
type: article
series: architecture-first
part: 20
createdAt: 2026-10-14 14:00
updatedAt: 2026-10-14 14:00
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 20.
> In the [previous article](custom-fields-postgresql-eav-vs-jsonb) tasks got attributes. When several people can change a task, sooner or later someone asks: who changed this, and when?

## The short version

How we built the change history of tasks:

1. The history lives in two tables: a record of the action (who, when, which entity, what was done) and the list of changed fields with their old and new values.
2. The service that changes the task writes the records itself, in the same transaction. If the change is not saved, there is no history record either, and vice versa.
3. EF Core interceptors and temporal tables did not fit: deciding what counts as a change and how to show it is business logic, and it belongs neither in an interceptor nor in the database.
4. Event sourcing did not fit either: the history must always match the data, while events need a bus, and values can drift from the history for a while.
5. The history stores values in the form they are shown in, so it stays readable even if an attribute is renamed or deleted later.
6. The table is called `OrganizationLog`, not "issue history": other entities will write to it later.

## Why a task needs a history

While one person uses the tasks, the question "who changed this" does not come up. In an organization several members work on the same task: someone moves it to another status, someone changes the assignee or an attribute, someone removes an attachment. Without a history there is no way to understand how the task got to its current state.

We wanted the history to answer that question honestly: what it records is what really happened.

## The model: an action record and the changed fields

One user action is one record in `OrganizationLog`:

```csharp
public class OrganizationLog
{
    public long Id { get; set; }

    public long? EntityId { get; set; }
    public LogEntityType EntityType { get; set; }

    public long OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public Guid OwnerId { get; set; }
    public User? Owner { get; set; }

    public DateTime CreatedAt { get; set; }

    public LogAction Action { get; set; }

    public List<OrganizationLogItem>? Items { get; set; }
}

public enum LogEntityType
{
    Issue,
    Comment,
}

public enum LogAction
{
    Create,
    Update,
    Delete,
}
```

If one action changed several fields, such as the text, the assignee and two attributes, the record gets several `OrganizationLogItem` elements:

```csharp
public class OrganizationLogItem
{
    public long Id { get; set; }

    public long OrganizationLogId { get; set; }
    public OrganizationLog? OrganizationLog { get; set; }

    public PropertyType PropertyType { get; set; }

    [MaxLength(36)]
    public string? ParentId { get; set; }

    [MaxLength(36)]
    public string? OldValueId { get; set; }

    [MaxLength(36)]
    public string? NewValueId { get; set; }

    [MaxLength(255)]
    public string? PropertyName { get; set; }

    [MaxLength(4096)]
    public string? OldDisplayValue { get; set; }

    [MaxLength(4096)]
    public string? NewDisplayValue { get; set; }
}
```

`PropertyType` says what exactly changed: the text, the status, the assignee, an attribute, an attachment, the board or the space. For references to other entities their id is stored (`OldValueId`, `NewValueId`), and next to it the value to show the user (`OldDisplayValue`, `NewDisplayValue`).

The display values are there for a reason. If the history stored only the id of an attribute or a list option, then after the attribute is renamed the history would show the new name, and after it is deleted it would show nothing at all. The history should show what the user saw at the moment of the change. The attribute name is also saved in the history item (`PropertyName`) for the same reason.

The table is called `OrganizationLog`, not `IssueHistory`, and a record has an entity type: today these are tasks and comments, but later we want to log other entities too, and that will not need a new table.

## Where to write the history

For the history to match what happened, it has to be saved together with the change itself, in one transaction. If the change rolls back, there must be no history record, and if the history record is not saved, the change must not be saved either.

There are several common ways to keep a history. Here is why they did not fit us.

**An EF Core interceptor.** You can intercept `SaveChanges`, look in the `ChangeTracker` for changed properties and record them. But an interceptor sees only columns. It does not know that a change of `StatusId` is a move to another status that should be shown by the status name, that an attribute change lives in a separate value table, or that the attribute has a name. Deciding what counts as a change and how to show it is business logic, and an interceptor is not the place for it.

**Temporal tables.** The database itself keeps previous versions of rows. It is the same problem, only one level lower: instead of a history of changes you get copies of values, and the logic of what actually happened ends up at the database level.

**Event sourcing.** Changes are written as events, and both the current state and the history are built from them. This approach works well when the app already has an event bus and when the history and the data are allowed to be out of sync for a while. We needed the opposite: the history is what really happened, and it has to be written in the same transaction as the change.

So the history is written by the service that changes the data.

## What it looks like in code

The work is split the same way as in the rest of the backend: the host service checks permissions and manages the transaction, and the Core service changes the data (more in the [article about our engineering principles](how-we-build-engineering-principles)). There we also wrote that creating an issue must add a history record whether the request came from the Telegram bot or the web API. That is why the history is written in the Core service.

The host service opens the transaction and commits it when everything is ready:

```csharp
await using var transaction = await context.Database.BeginTransactionAsync(ct);

await issuesService.Update(
    issueId,
    request.AuthData.UserId,
    request.Content,
    request.AssigneeId,
    attributeUpdateRequests,
    uploadedFiles,
    request.RemoveAttachmentIds,
    ct);

await transaction.CommitAsync(ct);
```

The Core service compares the old and new values, changes only what changed, and adds a history item for every change:

```csharp
var change = new OrganizationLog
{
    CreatedAt = date,
    EntityId = issueId,
    EntityType = LogEntityType.Issue,
    Items = [],
    OrganizationId = issueData.OrganizationId,
    OwnerId = updaterId,
    Action = LogAction.Update,
};

var oldContent = issueData.Content;
if (oldContent != content)
{
    settersBuilder += builder => builder.SetProperty(x => x.Content, content);
    change.Items.Add(GetContentLogItem(oldContent, content));
}

// ... the same for the assignee

await context.Issues
    .Where(x => x.Id == issueId)
    .ExecuteUpdateAsync(settersBuilder, cancellationToken);

change.Items.AddRange(await AttachIssueFiles(issueId, updaterId, newFiles, cancellationToken));
change.Items.AddRange(await DetachIssueAttachments(issueId, deleteAttachmentIds, cancellationToken));
change.Items.AddRange(await UpdateAttributes(issueId, issueData.OrganizationId, attributes, cancellationToken));

if (change.Items.Count != 0)
{
    context.Add(change);
    await context.SaveChangesAsync(cancellationToken);
}
```

The methods that change attachments and attributes return their own history items, and the record is saved only if something actually changed. Saving a task without changes leaves no empty records in the history.

The Core service does not open a transaction itself, but it requires one to be open already. If it is called without a transaction, it fails right away instead of writing the changes and the history separately:

```csharp
public static void EnsureTransactionStarted(this DatabaseFacade facade)
{
    if (facade.CurrentTransaction == null)
        throw new InvalidOperationException("Database transaction is required.");
}
```

## What the user sees

In the web app the task page got a "History" tab next to the comments. Each record shows who did what and when, and inside it the changed fields with their old and new values. Creating and deleting a task also end up in the history, as do changes to comments. The history UI was built by Nikolay, the frontend developer who had joined the project by then.

## Results

- **The history is what really happened.** The history record and the change itself are saved in one transaction.
- **The service writes the history, not the infrastructure.** What counts as a change and how to show it is business logic, so neither EF Core interceptors nor temporal tables fit.
- **No event sourcing.** We have no event bus, and the history drifting from the data would be unacceptable.
- **Display values are saved in the history.** That keeps it readable after attributes are renamed or deleted.
- **One table for all entities.** Tasks and comments write to it today, other entities will later.

## What comes next

Shortly before the history, tasks got attachments from the web app and comments. That is the subject of the next article.
