---
title: Триггеры в EF Core на C# — fluent-синтаксис и деревья выражений для генерации SQL
type: project
name: Laraue.EfCoreTriggers
tags: [dotnet, database, open-source]
repository: https://github.com/win7user10/Laraue.EfCoreTriggers
language: C#
license: MIT
description: Разбор библиотеки Laraue.EfCoreTriggers — как определять триггеры базы данных на C#, как деревья выражений транслируются в SQL, и как расширить библиотеку под новый провайдер БД.
seoTitle: Триггеры EF Core на C#: fluent-синтаксис и деревья выражений
seoDescription: Laraue.EfCoreTriggers: триггеры БД на C# с fluent-синтаксисом, трансляция деревьев выражений в SQL и расширение под новый провайдер.
createdAt: 2025-03-04
updatedAt: 2026-10-28
---
**Триггеры базы данных в EF Core** всегда были инструментом второго сорта. Обычный способ — SQL-строка прямо в миграции: модель о ней не знает, после первого же переименования колонки она расходится со схемой, а компилятор её не проверяет. [Laraue.EfCoreTriggers](https://github.com/win7user10/Laraue.EfCoreTriggers) решает эту проблему: триггеры описываются **fluent-синтаксисом на C#**, как индексы и внешние ключи, а SQL генерируется из **деревьев выражений**, привязанных к модели сущностей.

|             |                                                                                  |
|-------------|----------------------------------------------------------------------------------|
| Язык        | C#                                                                               |
| Фреймворк   | .NET Standard 2.1 / .NET 6 / .NET 8 / .NET 9 / .NET 10                           |
| Тип проекта | Библиотека                                                                       |
| Статус      | Поддерживается, в наших проектах не используется                                 |
| Лицензия    | MIT                                                                              |
| NuGet       | ![последняя версия](https://img.shields.io/nuget/v/Laraue.EfCoreTriggers.Common) |
| Загрузки    | ![загрузки](https://img.shields.io/nuget/dt/Laraue.EfCoreTriggers.Common)        |
| GitHub      | [Laraue.EfCoreTriggers](https://github.com/win7user10/Laraue.EfCoreTriggers)     |

**Откуда она взялась.** Мы написали библиотеку в 2020 году для нашего веб-краулера, который вот уже пять лет лежит в архиве. А библиотека живёт до сих пор: на октябрь 2026 у неё 140 звёзд и 25 форков на GitHub и 138 релизов на NuGet, последние из них — 2026 года. В собственных проектах мы ею больше не пользуемся, поэтому эта страница рассказывает, что библиотека умеет и как устроена, а не как она ведёт себя под нашей боевой нагрузкой.

---

## Когда триггеры оправданы

Большинство современных .NET-приложений не зря держат бизнес-логику в приложении. Триггеры добавляют скрытое поведение на уровне БД, и разобраться в системе становится труднее.

И всё же есть три случая, когда триггеры оправданы:

**Легаси-системы без полного покрытия тестами.** Чтобы добавить реакцию на события в коде приложения, придётся менять места, которые вы, возможно, не до конца понимаете. Триггер на стороне БД добавляет поведение — аудит строк, пересчёт балансов, каскадное мягкое удаление — не трогая приложение.

**Прямой доступ к базе данных.** Когда пользователи или внешние системы пишут в БД напрямую, в обход приложения, его логика уже не может гарантировать инварианты. Триггеры — последняя линия обороны.

**Инфраструктура с ограниченным бюджетом.** Держать шину сообщений (Kafka, RabbitMQ) ради внутренних событий дорого. В простых случаях журнал событий на триггерах в той же БД дешевле и проще в обслуживании, особенно для небольшой команды.

---

## Проблема с сырыми SQL-триггерами в EF Core

Стандартный способ добавить триггер в миграции EF Core:

```csharp
migrationBuilder.Sql("CREATE TRIGGER tr_after_update_transaction ...");
```

Это работает, но со временем ломается двумя способами:

1. **Переименовали колонку** — триггер молча перестаёт работать или падает в рантайме: EF Core не знает, что триггер на неё ссылается.
2. **Найти триггеры** можно, только перерыв файлы миграций или запросив БД напрямую. В модели их не видно.

Библиотека решает обе проблемы. Триггеры описываются в модели сущностей, рядом с теми сущностями, на которые ссылаются. А раз они записаны выражениями, переименование колонки даёт ошибку компиляции C#, а не сюрприз в рантайме.

---

## Быстрый старт

Установите пакет для вашего провайдера БД:

```
dotnet add package Laraue.EfCoreTriggers.PostgreSql
dotnet add package Laraue.EfCoreTriggers.SqlServer
dotnet add package Laraue.EfCoreTriggers.MySql
dotnet add package Laraue.EfCoreTriggers.SqlLite
dotnet add package Laraue.EfCoreTriggers.Oracle
```

Определите триггер в `OnModelCreating`:

```csharp
modelBuilder.Entity<Transaction>()
    .AfterUpdate(trigger => trigger
        .Action(action => action
            .Condition(tableRefs => tableRefs.Old.IsVerified && tableRefs.New.IsVerified)
            .Update<UserBalance>(
                (tableRefs, userBalances) => userBalances.UserId == tableRefs.Old.UserId,
                (tableRefs, oldBalance) => new UserBalance
                {
                    Balance = oldBalance.Balance + tableRefs.New.Value - tableRefs.Old.Value
                })));
```

Зарегистрируйте провайдер в `DbContextOptionsBuilder`:

```csharp
var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseNpgsql(connectionString)
    .UsePostgreSqlTriggers()
    .Options;
```

Запустите `dotnet ef migrations add AddTransactionTrigger`. Метод `Up` миграции будет содержать полный SQL `CREATE TRIGGER`, а `Down` — соответствующий `DROP TRIGGER`. С этого момента переименование `Transaction.Value` или `UserBalance.Balance` приведёт к ошибке компиляции в определении триггера.

---

## Какие триггеры поддерживает каждая база

Не во всех базах есть все виды триггеров, и библиотека не изобретает недостающие. Вот таблица из репозитория:

| Триггер           | PostgreSQL | SQL Server | SQLite | MySQL | Oracle |
|-------------------|------------|------------|--------|-------|--------|
| Before Insert     | +          | -          | +      | +     | +      |
| After Insert      | +          | +          | +      | +     | +      |
| Instead Of Insert | +          | +          | +      | -     | +      |
| Before Update     | +          | -          | +      | +     | +      |
| After Update      | +          | +          | +      | +     | +      |
| Instead Of Update | +          | +          | +      | -     | +      |
| Before Delete     | +          | -          | +      | +     | +      |
| After Delete      | +          | +          | +      | +     | +      |
| Instead Of Delete | +          | +          | +      | -     | +      |

После срабатывания триггер может выполнить такие действия: `Insert`, `InsertIfNotExists`, `Update`, `Upsert`, `Delete` и `ExecuteRawSql`.

Старший номер версии пакета совпадает со старшим номером версии EF Core: 10.x требует .NET 10, 9.x и 8.x — .NET 8, 7.x и 6.x — .NET 6, а 5.x нацелен на .NET Standard 2.1.

---

## Как это работает: от C# выражений к SQL

Здесь сложность библиотеки оправдана. Вызов `.AfterUpdate(...).Action(...)` ничего не выполняет: он строит описание триггера в виде графа объектов. Затем этот граф обходит конвейер посетителей (visitor pipeline), который и генерирует SQL.

### Шаг 1: Объект триггера

При вызове `AfterUpdate(...)` метод расширения на `EntityTypeBuilderExtensions` создаёт экземпляр `Trigger<TTriggerEntity, TTriggerEntityRefs>` ([исходник](https://github.com/win7user10/Laraue.EfCoreTriggers/blob/master/src/Laraue.Linq2Triggers.Core/TriggerBuilders/Trigger.cs)) и сохраняет его как аннотацию модели EF Core на типе сущности.

```csharp
public sealed class Trigger<TTriggerEntity, TTriggerEntityRefs> : ITrigger
    where TTriggerEntity : class
    where TTriggerEntityRefs : ITableRef<TTriggerEntity>
{
    public TriggerEvent TriggerEvent { get; }    // Insert / Update / Delete
    public TriggerTime TriggerTime { get; }      // Before / After / InsteadOf
    public IList<TriggerActionsGroup> Actions { get; } = new List<TriggerActionsGroup>();
    public string Name { get; private set; }

    public Trigger<TTriggerEntity, TTriggerEntityRefs> Action(
        Action<TriggerActionsGroup<TTriggerEntity, TTriggerEntityRefs>> triggerAction)
    {
        var action = new TriggerActionsGroup<TTriggerEntity, TTriggerEntityRefs>();
        triggerAction(action);
        Actions.Add(action);
        return this;
    }
}
```

Каждый вызов `.Action(...)` добавляет `TriggerActionsGroup` в список. В группе хранятся необязательное условие и список действий (Update, Delete, Insert, Upsert). Сам триггер — простой объект C#, без SQL и без внутренностей EF Core.

### Шаг 2: Чтение схемы EF Core

Библиотеке нужны **имена колонок и таблиц** такими, какими их видит EF Core, а не имена свойств C#. Свойство `IsVerified` может соответствовать колонке `is_verified` или `IsVerified` — в зависимости от соглашений об именовании.

`EfCoreDbSchemaRetriever` ([исходник](https://github.com/win7user10/Laraue.EfCoreTriggers/blob/master/src/Laraue.EfCoreTriggers.Common/SqlGeneration/EfCoreDbSchemaRetriever.cs)) оборачивает `IModel` EF Core и отвечает на вопросы, которые задаёт генератор SQL при обходе посетителями: *какое имя таблицы у этого CLR-типа? какое имя колонки у этого свойства?*

Это **адаптер между ядром библиотеки и EF Core**, и именно поэтому ядро (`Laraue.Linq2Triggers.Core`) можно использовать вообще без EF Core, реализовав `IDbSchemaRetriever` для любого источника схемы.

### Шаг 3: Интеграция с миграциями через TriggerModelDiffer

EF Core генерирует миграции, сравнивая два снапшота `IModel` и создавая объекты `MigrationOperation`. Библиотека встраивается в этот процесс через `TriggerModelDiffer` ([исходник](https://github.com/win7user10/Laraue.EfCoreTriggers/blob/master/src/Laraue.EfCoreTriggers.Common/Migrations/TriggerModelDiffer.cs)), который оборачивает встроенный `IMigrationsModelDiffer` EF Core.

`TriggerModelDiffer` просматривает аннотации каждого типа сущности в обоих снапшотах. Если аннотация триггера появилась, изменилась или исчезла, он добавляет в список операций миграции соответствующую `SqlOperation` со сгенерированным SQL. Дальше EF Core сам записывает её в файл миграции.

Именно **так SQL триггеров попадает в миграции без ручной работы**: differ замечает изменение и сам генерирует SQL.

---

## Архитектура посетителей деревьев выражений

Самая интересная с технической стороны часть библиотеки — **конвейер посетителей**, который переводит деревья выражений C# в SQL.

### Паттерн регистрации сервисов провайдера

Каждый провайдер БД регистрирует свои сервисы через расширение `IServiceCollection`. Регистрация MySQL провайдера ([исходник](https://github.com/win7user10/Laraue.EfCoreTriggers/blob/master/src/Laraue.Linq2Triggers.Providers.MySql/Extensions/ServiceCollectionExtensions.cs)) показывает её целиком:

```csharp
public static void AddBaseMySqlServices(this IServiceCollection serviceCollection)
{
    serviceCollection
        .AddDefaultServices()
        .AddScoped<SqlTypeMappings, MySqlTypeMappings>()
        .AddScoped<ITriggerVisitor, MySqlTriggerVisitor>()
        .AddTriggerActionVisitor<TriggerUpsertAction, MySqlTriggerUpsertActionVisitor>()
        .AddScoped<ISqlGenerator, MySqlSqlGenerator>()
        // Конвертеры вызовов методов — каждый маппит C# метод на SQL-эквивалент
        .AddMethodCallConverter<ConcatStringViaConcatFuncVisitor>()
        .AddMethodCallConverter<StringToUpperViaUpperFuncVisitor>()
        .AddMethodCallConverter<StringContainsViaInstrFuncVisitor>()
        .AddMethodCallConverter<MathAbsVisitor>()
        // ... остальные конвертеры
        // Конвертеры доступа к членам — маппят C# свойства/поля на SQL-эквиваленты
        .AddMemberAccessConverter<Converters.MemberAccess.DateTimeOffset.NowVisitor>()
        .AddMemberAccessConverter<Converters.MemberAccess.DateTime.UtcNowVisitor>();
}
```

Каждый провайдер регистрирует:
- свой `ISqlGenerator` — экранирование таблиц и колонок и синтаксис ссылок на строки `OLD`/`NEW` (он разный в MySQL, PostgreSQL, SQLite и SQL Server);
- свой `ITriggerVisitor` — внешний блок `CREATE TRIGGER` в синтаксисе провайдера;
- набор **конвертеров вызовов методов** — переводят методы C# вроде `string.Contains()` или `Math.Abs()` в нужную SQL-функцию этого провайдера;
- набор **конвертеров доступа к членам** — переводят свойства C# вроде `DateTime.UtcNow` в соответствующее SQL-выражение.

Благодаря регистрации через коллекцию сервисов **добавить новый провайдер БД просто**: реализовать нужные интерфейсы, зарегистрировать сервисы — и готово. Конвейер посетителей и обход деревьев выражений берутся из ядра.

### Посетители выражений: трансляция C# в SQL

Когда генератор SQL встречает выражение вроде:

```csharp
tableRefs.Old.IsVerified && tableRefs.New.IsVerified
```

он должен получить примерно такое:

```sql
OLD.is_verified = TRUE AND NEW.is_verified = TRUE
```

`MemberExpressionVisitor` ([исходник](https://github.com/win7user10/Laraue.EfCoreTriggers/blob/master/src/Laraue.Linq2Triggers.Core/Visitors/ExpressionVisitors/MemberExpressionVisitor.cs)) обрабатывает узлы `MemberExpression` — обращения к свойствам объектов. Его метод `Visit` выбирает ветку по виду выражения:

```csharp
public override SqlBuilder Visit(MemberExpression expression, VisitedMembers visitedMembers)
{
    switch (memberExpression.Expression)
    {
        // Статический член (например, DateTime.UtcNow)
        case null:
            return Visit(memberExpression); // делегирует в цепочку IMemberAccessVisitor

        // Доступ к колонке (например, tableRefs.Old.Balance)
        case MemberExpression nestedMemberExpression:
            return GetColumnSql(nestedMemberExpression, memberExpression.Member, visitedMembers);

        // Захваченная переменная (замыкание)
        case ConstantExpression constantExpression when memberExpression.Member is FieldInfo fieldInfo:
            var value = fieldInfo.GetValue(constantExpression.Value);
            return _expressionVisitorFactory.Visit(Expression.Constant(value), visitedMembers);
    }

    // Ссылка на строку OLD/NEW
    if (memberExpression.Member.TryGetNewTableRef(out _))
        return _generator.NewEntityPrefix;   // "NEW"

    return memberExpression.Member.TryGetOldTableRef(out _)
        ? _generator.OldEntityPrefix         // "OLD"
        : GetColumnSql(memberExpression.Expression.Type, memberExpression.Member, argumentType);
}
```

Посетитель различает четыре случая: доступ к статическому члену (обрабатывается подключаемыми конвертерами `IMemberAccessVisitor`), доступ к колонке (разрешается через `IDbSchemaRetriever`), захваченные переменные замыкания (вычисляются в момент генерации) и ссылки на строки `OLD`/`NEW` (переводятся в синтаксис провайдера).

Для статических членов вроде `DateTime.UtcNow` посетитель перебирает зарегистрированные `IMemberAccessVisitor`, пока не найдёт первый с `IsApplicable = true`. Конвертер MySQL `DateTimeOffset.NowVisitor` переводит `DateTimeOffset.Now` в `NOW()`, а PostgreSQL может перевести то же свойство в `NOW() AT TIME ZONE 'UTC'`. Одно и то же дерево выражений даёт разный SQL для разных провайдеров, и в ядре посетителя нет логики под конкретный провайдер.

### Посетители действий: генерация тела SQL

У каждого типа действия триггера свой посетитель. `TriggerDeleteActionVisitor` ([исходник](https://github.com/win7user10/Laraue.EfCoreTriggers/blob/master/src/Laraue.Linq2Triggers.Core/Visitors/TriggerVisitors/TriggerDeleteActionVisitor.cs)) — простейший пример:

```csharp
public sealed class TriggerDeleteActionVisitor : ITriggerActionVisitor<TriggerDeleteAction>
{
    public SqlBuilder Visit(TriggerDeleteAction triggerAction, VisitedMembers visitedMembers)
    {
        var tableType = triggerAction.Predicate.Parameters.Last().Type;
        var triggerCondition = new TriggerCondition(triggerAction.Predicate);
        var conditionStatement = _factory.Visit(triggerCondition, visitedMembers);

        return new SqlBuilder()
            .Append($"DELETE FROM {_sqlGenerator.GetTableSql(tableType)}")
            .AppendNewLine("WHERE ")
            .Append(conditionStatement)
            .Append(";");
    }
}
```

`Predicate` — это C# лямбда, написанная пользователем в определении триггера, например `(tableRefs, balances) => tableRefs.Old.UserId == balances.UserId`. Посетитель передаёт её фабрике посетителей выражений, которая рекурсивно обходит каждый узел (бинарное выражение, доступ к члену, константу) и строит SQL для `WHERE`. Результат добавляется в `SqlBuilder`.

### Провайдерно-специфичные обёртки триггеров

Синтаксис `CREATE TRIGGER` в разных БД сильно отличается. PostgreSQL требует отдельную trigger function; MySQL использует блоки `BEGIN...END`; SQL Server — `AS BEGIN...END`. Каждый провайдер реализует `ITriggerVisitor`, который оборачивает сгенерированный SQL действий в правильную конструкцию. Посетитель PostgreSQL генерирует и функцию, и объявление триггера, а MySQL и SQLite обходятся телом внутри самого триггера.

---

## Использование без EF Core

Поскольку `EfCoreDbSchemaRetriever` — лишь одна из реализаций `IDbSchemaRetriever`, ядро генерации триггеров можно использовать независимо от EF Core. Достаточно реализовать `IDbSchemaRetriever`, который берёт сведения о схеме откуда угодно — из маппингов колонок Dapper, из атрибутов, из словаря в коде, — и SQL триггеров можно генерировать без зависимости от EF Core.

Так библиотека пригодится и как **генератор SQL триггеров** в инструментах миграций или управления схемой, которые не используют EF Core.

---

## Расширение библиотеки: добавление нового провайдера БД

Чтобы добавить новый провайдер (так в v10.4.0 появилась поддержка Oracle):

1. **Реализуйте `ISqlGenerator`** — переопределите экранирование таблиц/колонок, синтаксис ссылок на строки `OLD`/`NEW` и маппинги типов
2. **Реализуйте `ITriggerVisitor`** — оберните SQL действий в корректный синтаксис `CREATE TRIGGER` для вашей БД
3. **Зарегистрируйте сервисы** — создайте класс `ServiceCollectionExtensions` по образцу MySQL; зарегистрируйте `ISqlGenerator`, `ITriggerVisitor` и провайдерно-специфичные конвертеры методов/членов
4. **Добавьте конвертеры методов** для встроенных C# методов, транслирующихся иначе в вашей БД (например, `string.Contains` → `INSTR` в MySQL vs `CHARINDEX` в SQL Server vs `position()` в PostgreSQL)

Архитектура устроена так, что **для нового провайдера не нужно менять ядро библиотеки**. Каждый провайдер — самостоятельный пакет.

---

## Поддерживаемые базы данных

| Провайдер | Пакет |
|---|---|
| PostgreSQL | `Laraue.EfCoreTriggers.PostgreSql` |
| SQL Server | `Laraue.EfCoreTriggers.SqlServer` |
| MySQL | `Laraue.EfCoreTriggers.MySql` |
| SQLite | `Laraue.EfCoreTriggers.SqlLite` (на NuGet имя пишется именно так) |
| Oracle | `Laraue.EfCoreTriggers.Oracle` |

---

## Бесплатно, с платной поддержкой

Библиотека бесплатна и останется открытой, в том числе для коммерческого использования (MIT). Если компании нужна конкретная возможность, исправление в её сроки или помощь с внедрением, работу можно заказать: результат попадёт в публичный репозиторий, и им воспользуются все. Пишите на sales@laraue.com и укажите «EfCoreTriggers».

---

## История версий

- **Ноябрь 2020** Первый релиз с поддержкой PostgreSQL
- **Декабрь 2020** Добавлены провайдеры SQL Server, SQLite и MySQL
- **Декабрь 2022** Стабильный релиз с полной поддержкой математических и строковых функций
- **Декабрь 2025** Ядро логики триггеров вынесено в пакеты, не зависящие от провайдера (`Laraue.Linq2Triggers.Core`), так что библиотеку можно использовать без EF Core
- **Февраль 2026** Добавлен провайдер Oracle (v10.4.0); поддержка shadow properties; интеграционные тесты на CI
- **Август 2026** Исправление: создание и удаление триггеров в SQL Server внутри идемпотентных скриптов миграций
