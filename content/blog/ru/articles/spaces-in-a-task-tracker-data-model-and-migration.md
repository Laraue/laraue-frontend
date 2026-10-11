---
title: Спейсы в таск-трекере — группировка досок по проектам, модель данных и миграция существующих пользователей
description: Часть 14 цикла о разработке Telegram-таск-трекера в одиночку. Как спейсы группируют доски по проектам, почему спейс хранится у доски, а не у issue, и SQL-миграция, которая дала каждому пользователю спейс по умолчанию.
seoTitle: Спейсы в таск-трекере: модель данных и миграция
seoDescription: Часть 14: как я добавил спейсы в таск-трекер — обязательный спейс у доски, строки по умолчанию вместо nullable-ключей и SQL-миграция данных.
type: article
series: architecture-first
part: 14
createdAt: 2026-10-11 14:00
updatedAt: 2026-10-11 14:00
projects: [boards]
tags: [devlog, dotnet, database, architecture, task-tracker]
---

> **Architecture First: как в одиночку с ИИ сделать альтернативу Jira** — Часть 14.
> В [предыдущей статье](telegram-login-widget-dotnet-auth) я добавил вход, который работает в браузере. Теперь над досками появляется новый уровень — спейсы, которые группируют доски по проектам.

## Краткое содержание

Как я сгруппировал доски по проектам в таск-трекере, не засорив модель данных nullable-колонками:

1. Добавил уровень группировки над доской. **Спейс** содержит доски, доска — issues. У спейса есть название и цвет (короткий ключ появился позже), и именно между спейсами переключается навигация.
2. Сначала повесил nullable `SpaceId` и на доску, и на issue, но спустя несколько итераций оставил спейс только у **доски**, как обязательный внешний ключ. Теперь issue находит свой спейс через `Issue → Status → Epic → Space`, и эта связь хранится ровно в одном месте.
3. Убрал состояние «доска без спейса»: у каждого пользователя есть спейс по умолчанию с доской Backlog, и каждый новый спейс создаётся сразу со своим Backlog.
4. Данные существующих пользователей перенёс прямо в миграции обычным SQL: один `insert … select` на уровень и один `update` для issues.
5. Строки по умолчанию пометил флагом `IsDefault` и запретил их удалять.
6. Весь код переноса между спейсами собрал в одном месте.

Всё это уложилось в двенадцать дней, схема за это время поменялась три раза. А вот систему пермишенов поверх неё мне пришлось переписывать несколько раз, прежде чем она стала покрывать все случаи, которые я смог придумать, — об этом в одной из следующих статей.

## Почему одних досок было недостаточно

Сначала Boards разрабатывал я один и сам же был его главным пользователем. Проблема была в том, что в эпиках у меня лежали и личные дела, и всё, что связано с Laraue. Доска (в коде — эпик) — это канбан-доска со своими колонками, а уровня выше, который бы их группировал, не было.

Идея не новая: в Confluence есть spaces, в Jira работа сгруппирована по проектам. Я посмотрел, как это решено в Jira, и адаптировал под себя. Новую сущность я назвал **спейс**: именованная цветная группа досок, на которую переключаешься целиком. Словарь продукта стал таким: **Спейс → Доска → Issue**, а в коде доска — это `Epic`. В [документации](https://boards.laraue.com/ru/documentation) «доска» и «эпик» используются как синонимы.

## Подготовка: переименование и настройки пользователя

Перед тем как начать делать спейсы, я переименовал основные сущности: `Card` стал `Issue`, `CardCategory` — `Epic`, `CardStatus` — `Status`. Эти названия вы видели в [части 9](issue-board-telegram-mini-app). Понадобились две миграции, `RenameMainEntities` и `RenameEntitiesFks`, и лучше было сделать это до того, как поверх старых названий появится что-то новое.

Заодно добавил ещё пару небольших фич:

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

И `Epic`, и `Issue` получили ссылку на него:

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

Чтобы получить все issues спейса одним запросом, я добавил `SpaceId` не только эпику, но и самой issue. Колонки сделал nullable: у уже существующих эпиков и issues спейса ещё не было, а с nullable миграция проходит, не трогая данные.

## Может ли внешний ключ быть nullable?

Да. В SQL столбец внешнего ключа может быть `NULL` — и в PostgreSQL, и в SQL Server, MySQL, SQLite: строка с `NULL` просто не проверяется по родительской таблице и означает «родителя нет». Поэтому настоящий вопрос не «можно ли?», а «существует ли в вашей предметной области состояние *родителя нет*?»

- **Nullable уместен, когда отсутствие — настоящее состояние.** В модели Boards issue, созданная в веб-приложении, не связана ни с каким сообщением Telegram, поэтому `Issue.TelegramMessageId` — это `long?`, и код, который его читает, ожидает `null`.
- **Nullable неверен, когда отсутствие — просто пробел в данных.** Доски без спейса в продукте не бывает: это доска, до которой ещё не дошла миграция, и каждому, кто читает эту колонку, приходится придумывать смысл для `null`.

Во втором случае ключ лучше сделать обязательным, а для случая «пока ничего нет» завести настоящую запись — например, спейс по умолчанию. Этот подход подробно разбирался в [части 9](issue-board-telegram-mini-app). Остальная статья — о том, как я к нему пришёл, включая неверный шаг.

## Чем мешали nullable-ключи

Каждый `space_id` был `bigint null`, поэтому везде, где его читали, приходилось отдельно обрабатывать случай «у issue нет спейса» — хотя в продукте такого состояния быть не должно.

Чтобы убрать это состояние, я написал миграцию. В сокращённом виде, только про спейсы, она выглядела так:

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

Что здесь происходит:

- Для каждого пользователя создаётся **спейс по умолчанию**. Каждый спейс принадлежит организации, поэтому той же миграцией для каждого пользователя создавалась и «личная организация»: одна, и состоит из него одного (в запросе выше это таблица `organizations`). Что такое организации — в следующей статье.
- Для каждого спейса создаётся доска **Backlog**. Issue не может жить вне доски: свой спейс она находит через статус и эпик. Раньше issue без доски (`epic_id = null`) считалась лежащей в бэклоге, теперь для этого есть обычная доска Backlog. Доски принадлежат спейсам, поэтому Backlog свой в каждом спейсе.
- Все существующие issues переезжают в Backlog спейса своего владельца.

В полном скрипте были и другие запросы (членство в организации, права доступа), но для спейсов важно только это.

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

Спейс стал **обязательным у доски**, а issue лишилась и `EpicId`, и `SpaceId`. Теперь issue знает ровно одно — свой статус. Статус принадлежит эпику, эпик принадлежит спейсу:

```
Issue → Status → Epic → Space
```

В EF Core фильтр по спейсу — это проход по этой цепочке. Две настоящие строки из бэкенда:

```csharp
query = query.Where(i => i.Status!.Epic!.Space!.Key == spaceKey);
```

```csharp
.Where(x => x.Status!.Epic!.Space!.OrganizationId == issueData.OrganizationId)
```

Цена — несколько join'ов. Выгода — ровно одно место, которое говорит, где живёт issue. Перенос доски в другой спейс — это обновление одной строки `epics`, а не переписывание `space_id` у каждой issue в ней, и два значения никогда не разойдутся, потому что второй копии нет.

Незадолго до этого у спейсов и досок появился флаг `IsDefault`. Вместе с обязательным внешним ключом он дал итоговое правило: **всегда есть спейс и всегда есть доска, в которую можно положить issue.**

## Строки по умолчанию в коде

То же правило есть в коде, который создаёт спейс. Каждый новый спейс создаётся вместе со своей доской Backlog, одним `SaveChanges`:

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

Backlog создаётся с `IsDefault = true` (см. [`CoreSpacesService.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/src/Laraue.Apps.Boards.Services/CoreSpacesService.cs)). Спейс по умолчанию и Backlog по умолчанию нельзя удалять: иначе «всегда есть куда положить issue» перестаёт быть правдой, как только кто-то их удалит. Позже я поправил места, где API всё ещё сообщал, что такие сущности можно удалить, и запретил выдавать право на удаление для них — каждый раз с тестом.

## Перенос issues и досок между спейсами

Первый интерфейс переноса появился почти сразу после самих спейсов: модальное окно для переноса issue с двумя списками внутри — для доски и для спейса. Позже логика переноса была переписана в одно место вместе с тестовым классом для массового переноса. К тому времени видов переноса было три (issue на другую доску, доска в другой спейс и спейс целиком), и три копии одной логики наверняка бы разошлись.

Продуктовое правило, которое из этого получилось, простое, и [документация](https://boards.laraue.com/ru/documentation) его описывает: спейс доски задаётся при её создании и дальше не меняется. Перенос спейса или доски со всем содержимым — отдельное осознанное действие, которое переносит их между организациями.

## Удаление спейса

Удаление прошло три версии: сначала диалог подтверждения, затем переписанная логика, а позже — мягкое удаление. Сегодня спейс помечается удалённым вместе со всем, что ниже, в одной транзакции, чтобы ничего не оставалось привязанным к несуществующему спейсу. Метод идёт по той же цепочке, что и запросы выше, снизу вверх:

```csharp
await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

var epicIds = context.Epics.Where(x => x.SpaceId == id).Select(x => (long?)x.Id);
var statusIds = context.Statuses.Where(x => epicIds.Contains(x.EpicId)).Select(x => (long?)x.Id);

await context.Issues
    .Where(x => statusIds.Contains(x.StatusId))
    .ExecuteUpdateAsync(u => u
        .SetProperty(p => p.DeletedAt, deletedAt)
        .SetProperty(p => p.DeletedByUserId, deleterId), cancellationToken);

// дальше такое же обновление для статусов, эпиков и в конце самого спейса

await transaction.CommitAsync(cancellationToken);
```

Четыре вызова `ExecuteUpdateAsync` вместо загрузки чего-либо в память, а транзакция делает их единым целым. Тест, который это фиксирует, говорит сам за себя: `User_ShouldSoftDeleteSpaceAndAllDescendants_WhenSpaceIsDeleted`.

## Выводы

- **Храните связь на самом узком уровне, где она нужна.** Спейс принадлежит доске. Issue получает его бесплатно, а перенос остаётся операцией над одной строкой.
- **Строка по умолчанию лучше null.** Каждый nullable-ключ — это вопрос, на который каждый читатель данных должен отвечать заново. «У каждого пользователя есть спейс, а у каждого спейса есть Backlog» — это инвариант, который можно протестировать.
- **Миграция данных — часть функциональности.** От нескольких десятков строк SQL зависело, увидят ли существующие пользователи свои доски после обновления, и писать и перечитывать их стоило так же внимательно, как модель.
- **Меняйте форму схемы рано.** Модель менялась три раза за двенадцать дней. Это было дёшево, пока в приложении были единицы пользователей, и стало бы дорого через несколько месяцев.

Если интересно, как называются интеграционные тесты, загляните в [`SpacesControllerTests.cs`](https://github.com/Laraue/Laraue.Apps.Boards/blob/main/tests/Laraue.Apps.Boards.IntegrationTests/SpacesControllerTests.cs): каждый тест говорит, кто что делает и при каком условии.

## Что дальше

Спейсы ответили на один вопрос: «моё или проектное». Миграция выше уже намекает на следующий: ей пришлось создавать для каждого пользователя *личную* организацию, потому что спейс будет принадлежать не только одному человеку. Следующая статья — про организации: как приложение перешло от одного пользователя ко многим, что такое код приглашения и почему один из первых тестов, которые я для них написал, назывался «создать организацию».
