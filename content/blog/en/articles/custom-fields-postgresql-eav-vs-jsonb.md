---
title: Custom fields for tasks — EAV vs JSONB in PostgreSQL, a separate table per type and filtering by values
description: Part 19 of the series about building a Telegram task tracker solo. How we added attributes (custom fields) to issues, why we chose an EAV model with a separate value table per type instead of a JSONB column, and how filtering tasks by attribute values works.
seoTitle: Custom Fields in PostgreSQL: EAV vs JSONB in a Task Tracker
seoDescription: Part 19: custom fields in PostgreSQL — why EAV with a table per value type instead of JSONB, foreign keys, indexes and filtering tasks by values.
type: article
series: architecture-first
part: 19
createdAt: 2026-10-14 14:00
updatedAt: 2026-10-14 14:00
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: Building a Jira Alternative Solo, AI-Assisted** — Part 19.
> In the [previous article](issue-numbers-postgres-insert-on-conflict-counter) tasks got numbers like `BRD-42`. From there Boards started to get new features, and the first of them was attributes: fields that users define themselves.

## The short version

How we added custom fields to Boards:

1. An attribute is a field an organization creates itself: "Priority", "Client", "Estimate". An attribute has a name, a color and a type.
2. Values are stored with the EAV (entity–attribute–value) model: a "task — attribute — value" row in a separate table.
3. Every value type has its own table: text, a list option, an integer, a decimal, a date, a date and time.
4. We decided against a JSONB column: it is a feature of a particular database provider, it can only be indexed with GIN indexes, and we needed foreign keys so that integrity rules work at the database level.
5. We started with two types, text and list, checked that everything worked, and only then extended the set of attribute types.
6. A filter by an attribute is a `JOIN` with the value table of the right type.

## Why a task needs custom fields

An issue in Boards has a fixed set of fields: text, status, assignee. But every team has its own data it wants to keep in a task: priority, client, estimate in hours, due date. Adding a column to the `issues` table for each such need is not an option: there are endlessly many of them, and different organizations need different ones.

So the organization defines the fields itself. An attribute is created once and is then available in every space and on every board of the organization:

```csharp
public class Attribute
{
    public long Id { get; set; }

    public long OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    [MaxLength(255)]
    public required string Name { get; set; }

    [MaxLength(7)]
    public required string Color { get; set; }

    public required AttributeType AttributeType { get; set; }

    public List<AttributeListValue>? AttributeListValues { get; set; }
}

public enum AttributeType
{
    Text,
    List,
}
```

A "list" attribute has a set of options (`AttributeListValue`), and a task picks one of them.

## Where to store the values: EAV or JSONB

There are two common ways to store custom fields.

**JSONB.** The task gets an `attributes jsonb` column holding an object like `{"12": "High", "15": "Acme Inc."}`. One column, no new tables, and PostgreSQL can index JSONB and search in it.

**EAV (entity–attribute–value).** Values live in a separate table, one row per "task — attribute" pair. There are more tables, and getting a task with all its fields takes extra queries.

We chose EAV. JSONB had three drawbacks for us.

- **A feature of a particular provider.** JSONB is a PostgreSQL feature, and we try not to tie the data model to the features of one database. Tables with foreign keys work in any relational database.
- **Indexes.** JSONB is indexed with a GIN index, and we do not use GIN where GiST will do. Besides, a JSONB value is stored as one document: changing one field updates the index for the whole document, and task fields change all the time.
- **No foreign keys.** Inside JSONB you cannot reference another table, so integrity rules would have to live in code. We wanted them to work at the database level: in EAV a value is an ordinary row with foreign keys to the task, the attribute and the list option, and the behavior on their deletion is defined in the database itself.

## A separate table per type

Values could be stored in one table with a column per type: `text_value`, `int_value`, `date_value` and so on. But then only one column is filled in each row, the rest are `null`, and the table grows with empty values. We made one table per type, so as not to store batches of `null` and to keep the tables compact.

The first version had two such tables:

```csharp
public class IssueAttributeTextValue
{
    public long IssueId { get; set; }
    public Issue? Issue { get; set; }

    public long AttributeId { get; set; }
    public Attribute? Attribute { get; set; }

    [MaxLength(255)]
    public required string Text { get; set; }
}

public class IssueAttributeListValue
{
    public long Id { get; set; }

    public long IssueId { get; set; }
    public Issue? Issue { get; set; }

    public long AttributeId { get; set; }
    public Attribute? Attribute { get; set; }

    public long AttributeListValueId { get; set; }
    public AttributeListValue? AttributeListValue { get; set; }
}
```

The primary key in both tables is the `(IssueId, AttributeId)` pair: a task can have only one value of each attribute. All foreign keys cascade on delete. If a task, an attribute or a list option is deleted, the database removes all related values itself, and the code does not have to do anything about it.

## Two types first

The first version had only text and list. We wanted to check first that the model worked: values are saved, shown in tasks and on boards, and the filter works on them. Numbers and dates were added later, once it was clear that the approach had paid off.

By then it was clear that the saving logic was the same for all simple types: find the task's old values, update the changed ones, add the new ones, delete the removed ones and record the changes in the history. It moved into a shared base class, and each type only has to say how to create a row and how to display the value:

```csharp
public class IntegerAttributeUpdater
    : ScalarAttributeUpdater<IssueAttributeIntegerValue, long, SetIssueIntegerAttributeRequest>
{
    protected override IssueAttributeIntegerValue CreateEntity(long issueId, long attributeId, long value) => new()
    {
        IssueId = issueId,
        AttributeId = attributeId,
        Value = value,
    };

    protected override string FormatValue(long value) => value.ToString(CultureInfo.InvariantCulture);
}
```

A new attribute type is now a new value table, a model class and a small class like this one. The list works differently, since its value points to a predefined option, so it is handled separately.

## Filtering by attributes

On a board, tasks can be filtered by attribute values. Each filter becomes a `JOIN` with the value table of the right type:

```csharp
if (filterType == AttributeType.Text)
{
    query = query.InnerJoin(
        context.IssueAttributeTextValues,
        (i, a) => i.Id == a.IssueId
            && a.AttributeId == filter.Key
            && a.Text.ILike(filterValue.AsSearchable()),
        (i, a) => i);
}

if (filterType == AttributeType.List)
{
    query = query.InnerJoin(
        context.IssueAttributeListValues,
        (i, a) => i.Id == a.IssueId
            && a.AttributeId == filter.Key
            && ((IEnumerable<long>)listAndValues).Contains(a.AttributeListValueId),
        (i, a) => i);
}
```

Several filters mean several `JOIN`s, and a task is in the result only if it matches all of them. Text is matched by substring, and for a list several options can be selected.

We added indexes for the filters. For text, a trigram GIN index (`gin_trgm_ops`), so that a substring search with `ILIKE` does not scan the whole table. It is a specialized index for full-text search, and if you need good speed there is no alternative to it. Where we can choose between GIN and GiST, we pick GiST. For lists, a regular index on the selected option. The primary key starts with `IssueId`, so the values of one task are also read by index.

## Results

- **The organization defines the fields.** An attribute is created once and is available in every space of the organization.
- **EAV instead of JSONB.** Values live in regular tables with foreign keys, not in a document inside the task.
- **A table per type.** So the database has no rows where only one of several columns is filled.
- **Cascade delete in the database.** Deleting a task, an attribute or a list option removes the values without any code.
- **Two types first.** Numbers and dates were added once the model was tested on text and list.
- **A filter is a `JOIN`.** Each condition joins tasks with the value table of the right type.

## What comes next

After attributes, tasks got comments, attachments and a change history, and a second developer joined the project. That is the subject of the next articles.
