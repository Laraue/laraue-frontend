---
title: Спейсы в таск-трекере — группировка досок по проектам, модель данных и перенос данных существующих пользователей
description: Часть 14 цикла о разработке Telegram-таск-трекера небольшой командой. Как спейсы группируют доски по проектам, почему спейс хранится у доски, а не у issue, и SQL-миграция, которая дала каждому пользователю спейс по умолчанию.
seoTitle: Спейсы в таск-трекере: модель данных и миграция
seoDescription: Часть 14: как мы добавили спейсы в таск-трекер — обязательный спейс у доски, строки по умолчанию вместо nullable-ключей и SQL-миграция данных.
type: article
series: architecture-first
part: 14
createdAt: 2026-10-12 09:51
updatedAt: 2026-10-28
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: как небольшой командой с ИИ сделать альтернативу Jira** — Часть 14.
> В [предыдущей статье](telegram-login-widget-dotnet-auth) мы добавили вход, который работает в браузере. Теперь над досками появляется новый уровень — спейсы, которые группируют доски по проектам.

## Краткое содержание

Как мы сгруппировали доски по проектам в таск-трекере, не засорив модель данных nullable-колонками:

1. Добавили уровень группировки над доской. **Спейс** содержит доски, доска — issues. У спейса есть название и цвет (короткий ключ появился позже), и в интерфейсе переключаешься именно между спейсами.
2. Сначала повесили nullable `SpaceId` и на доску, и на issue, но спустя несколько итераций оставили спейс только у **доски**, как обязательный внешний ключ. Теперь issue находит свой спейс через `Issue → Status → Epic → Space`, и эта связь хранится ровно в одном месте.
3. Убрали состояние «доска без спейса»: у каждого пользователя есть спейс по умолчанию с доской Backlog, и каждый новый спейс создаётся сразу со своим Backlog.
4. Данные существующих пользователей перенесли прямо в миграции обычным SQL: один `insert … select` на уровень и один `update` для issues.
5. Строки по умолчанию пометили флагом `IsDefault` и запретили их удалять.

Всё это уложилось в двенадцать дней, схема за это время поменялась три раза. А вот систему прав доступа поверх неё нам пришлось переписывать несколько раз, прежде чем она стала покрывать все случаи, которые мы смогли придумать, — об этом в одной из следующих статей.

## Почему одних досок было недостаточно

Сначала над Boards работал один человек, он же был главным пользователем. Проблема была в том, что на досках вперемешку лежали и личные дела, и всё, что связано с Laraue. Доска (в коде — эпик) — это канбан-доска со своими колонками, а как разделить доски по проектам, было непонятно: для этого не хватало уровня выше.

Мы посмотрели, как это решено в Jira, где работа сгруппирована по проектам, и адаптировали под себя. Новую сущность назвали **спейс** — так же называются разделы в Confluence. Спейс — это группа досок с названием и цветом. В продукте получилась такая иерархия: **Спейс → Доска → Issue**. В [документации](https://boards.laraue.com/ru/documentation) «доска» и «эпик» используются как синонимы.

## Подготовка: переименование и настройки пользователя

Перед тем как начать делать спейсы, мы переименовали основные сущности. Мы сами начали путаться в названиях, поэтому решили привести их к одному виду: `Card` стал `Issue`, `CardCategory` — `Epic`, `CardStatus` — `Status`. Новые названия вы уже видели в [части 9](issue-board-telegram-mini-app). Понадобились две миграции, `RenameMainEntities` и `RenameEntitiesFks`, и лучше было сделать это до того, как поверх старых названий появится что-то новое.

Заодно добавили пару небольших функций:

- `TouchedAt` у эпика — чтобы доски сортировались по последней активности в них.
- Таблица `UserPreferences`: одна строка на пользователя с его настройками. Сначала в ней хранился выбранный порядок сортировки досок (по последней активности или по алфавиту), а позже добавился и последний выбранный спейс.

## Первая версия: nullable SpaceId у доски и у issue

Первые коммиты ([`dbe944d`](https://github.com/Laraue/Laraue.Apps.Boards/commit/dbe944d) и [`526bfbc`](https://github.com/Laraue/Laraue.Apps.Boards/commit/526bfbc)) добавили сущность `Space` и CRUD для неё:

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

И `Epic`, и `Issue` получили ссылку на спейс:

```csharp
public long? SpaceId { get; set; }
public Space? Space { get; set; }
```

Первый вариант состоял из пяти миграций:

| Миграция | Что сделала |
|---|---|
| [`CreateSpaces`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260413113436_CreateSpaces.cs) | таблица `spaces` |
| [`CreateSpacePreference`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414073038_CreateSpacePreference.cs) | `space_id` в настройках пользователя: спейс, в котором он был в последний раз |
| [`AddSpaceIdToEpic`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414120632_AddSpaceIdToEpic.cs) | nullable `space_id` с индексом и внешним ключом в `epics` |
| [`AddSpaceIdToIssue`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414123244_AddSpaceIdToIssue.cs) | то же в `issues` |
| [`MakeSpaceIdInPreferencesNullable`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.DataAccess/Migrations/20260414123835_MakeSpaceIdInPreferencesNullable.cs) | у пользователя может быть ещё не выбран спейс |

Мы хотели получать все issues спейса одним запросом, без join через эпик, поэтому добавили `SpaceId` не только эпику, но и самому issue. Колонки сделали nullable, потому что в таблицах уже были строки, у которых спейса ещё не было: миграция добавляет пустую колонку, и существующие данные не приходится трогать.

## Когда внешний ключ может быть пустым

Технически столбец внешнего ключа может быть `NULL` — и в PostgreSQL, и в SQL Server, MySQL, SQLite: строка с `NULL` не проверяется по родительской таблице и означает «родителя нет». Важнее другое: существует ли в вашей предметной области состояние *родителя нет*. От ответа зависит, нужен ли `NULL`.

- **Nullable уместен, когда отсутствие — настоящее состояние.** В модели Boards issue, созданный в веб-приложении, не связан ни с каким сообщением Telegram, поэтому `Issue.TelegramMessageId` — это `long?`, и код, который его читает, ожидает `null`.
- **Nullable неверен, когда отсутствие — просто пробел в данных.** Доски без спейса в продукте быть не должно: если у доски нет спейса, значит, до неё просто не дошла миграция, и каждому, кто читает эту колонку, приходится придумывать смысл для `null`.

Во втором случае ключ лучше сделать обязательным, а для случая «пока ничего нет» завести настоящую запись — например, спейс по умолчанию. Этот подход подробно разбирался в [части 9](issue-board-telegram-mini-app). Остальная статья — о том, как мы к нему пришли, включая неверный шаг.

## Чем мешали nullable-ключи

Каждая колонка `space_id` допускала `null` (`bigint null`), поэтому везде, где её читали, приходилось отдельно обрабатывать случай «у issue нет спейса» — хотя в продукте такого состояния быть не должно.

Чтобы убрать это состояние, мы написали миграцию. В сокращённом виде, только про спейсы, доски и issues, она выглядела так:

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

Что здесь происходит:

- Для каждого пользователя создаётся **спейс по умолчанию**. Каждый спейс принадлежит организации, поэтому той же миграцией для каждого пользователя создавалась и «личная организация»: в ней состоит только он сам (в запросе выше это таблица `organizations`). Что такое организации — в следующей статье.
- Для каждого спейса создаётся доска **Backlog** со статусом New. Раньше issue без доски и статуса (`epic_id` и `status_id` равны `null`) считался лежащим в бэклоге, теперь для этого есть обычная доска. Доски принадлежат спейсам, поэтому Backlog свой в каждом спейсе.
- Все существующие issues без доски переезжают в Backlog спейса своего владельца и получают первый статус этой доски.

В полном скрипте были и другие запросы (членство в организации, права доступа), но к спейсам они не относятся.

## Итоговая форма: спейс живёт только у доски

У коммита [`a095e69`](https://github.com/Laraue/Laraue.Apps.Boards/commit/a095e69) скромное сообщение — «app is now closer to target org DB schema» — и большой diff: 23 файла, 1457 добавленных и 341 удалённая строка. Основную работу сделали две его миграции. В терминах модели:

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

Спейс стал **обязательным у доски**, а issue лишился и `EpicId`, и `SpaceId`. Из всей иерархии у issue осталась только ссылка на статус. Статус принадлежит эпику, эпик принадлежит спейсу:

```
Issue → Status → Epic → Space
```

Чтобы выбрать issues спейса, в EF Core достаточно пройти по навигационным свойствам от статуса к эпику. Так выглядел фильтр по спейсу в коде того времени:

```csharp
query = query.Where(x => x.Status!.Epic!.SpaceId == request.SpaceId);
```

Запросы стали сложнее на несколько join'ов, зато спейс issue теперь хранится только в одном месте. Чтобы перенести доску в другой спейс, достаточно поменять `space_id` у самой доски, а issues на ней трогать не нужно. Если бы спейс хранился и у issue, его пришлось бы менять у каждого issue на доске, а если где-то забыть, issue и его доска оказались бы в разных спейсах.

Незадолго до этого у спейсов и досок появился флаг `IsDefault`, которым помечаются спейс и доска по умолчанию. Вместе с обязательным внешним ключом это даёт гарантию: **у пользователя всегда есть хотя бы один спейс, а в нём — доска, на которую можно добавить issue.**

## Строки по умолчанию в коде

Когда пользователь создаёт новый спейс, вместе с ним сразу создаётся доска Backlog, и в базу они сохраняются одной операцией:

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

Backlog создаётся с `IsDefault = true` (см. [`CoreSpacesService.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/a095e69/src/Laraue.Apps.StructuredMessages.Services/CoreSpacesService.cs)). Спейс по умолчанию и Backlog по умолчанию нельзя удалять: иначе пользователь мог бы остаться без спейса или без доски, на которую можно добавить issue.

## Перенос и удаление

Сначала можно было перенести только отдельный issue: в окне переноса выбирались спейс и доска. Позже добавились перенос доски в другой спейс и перенос спейса целиком, и всю логику переноса собрали в одном сервисе.

Удаление спейса мы сначала сделали полным: так было быстрее. Позже переписали его на мягкое удаление, потому что удалять данные безвозвратно слишком опасно.

## Итоги

- **Спейс хранится только у доски.** Issue получает его через статус и эпик, а при переносе доски меняется одна строка.
- **Вместо null — строки по умолчанию.** У каждого пользователя есть спейс по умолчанию, у каждого спейса — Backlog, и удалить их нельзя.
- **Данные существующих пользователей перенесли миграцией на SQL.** От нескольких десятков строк зависело, увидят ли пользователи свои доски после обновления.
- **Схему меняли, пока это было дёшево.** Модель менялась три раза, пока в приложении были единицы пользователей. Через несколько месяцев такие изменения обошлись бы гораздо дороже.

## Что дальше

Спейсы помогли отделить личные доски от рабочих. Но миграция выше уже создавала для каждого пользователя личную организацию: мы готовились к тому, что в одном спейсе будут работать несколько человек. Организации затрагивали почти каждый запрос к API, а приложением уже пользовались, поэтому перед ними мы написали первые интеграционные тесты. О них — [следующая статья](api-integration-testing-aspnet-core).
