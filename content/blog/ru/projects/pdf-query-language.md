---
title: Как написать интерпретатор языка запросов на C# — разбор на реальном примере
type: project
name: PdfQL
tags: [dotnet, open-source]
repository: https://github.com/Laraue/Laraue.PdfQL
language: C#
license: AGPL-3.0
description: Разбор архитектуры интерпретатора языка запросов на C# — лексер, парсер, AST и конвейерный исполнитель — на примере открытого проекта PdfQL. Практический разбор для .NET-разработчиков.
seoTitle: Интерпретатор языка запросов на C#: разбор на примере
seoDescription: Интерпретатор языка запросов на C# по шагам — лексер, парсер, AST и исполнитель — на примере открытого проекта PdfQL.
createdAt: 2025-03-04
updatedAt: 2026-10-28
---
Написать **интерпретатор языка запросов на C#** — задача, которая пугает, пока не разобьёшь её на части. В этой статье разбираем архитектуру и ключевые решения [PdfQL](https://github.com/Laraue/Laraue.PdfQL) — открытой библиотеки на C# с конвейерным языком запросов для извлечения структурированных данных из PDF.

PdfQL — это исследование, а не продукт и не production-библиотека. Мы хотели проверить, насколько практичен единый язык запросов для документов (сначала PDF, потом другие форматы), и сама концепция нам по-прежнему нравится. В реализации есть работающие **сканер, парсер, AST и исполнитель конвейера** на C# под .NET 10, так что проект может пригодиться как пример тем, кто делает DSL или интерпретатор на .NET.

|              |                                                                      |
|--------------|----------------------------------------------------------------------|
| Язык         | C#                                                                   |
| Фреймворк    | .NET 10                                                              |
| Тип проекта  | Библиотека                                                           |
| Статус       | Исследование, на паузе; демо-сервис остановлен                       |
| Лицензия     | AGPL-3.0                                                             |
| NuGet        | ![последняя версия](https://img.shields.io/nuget/v/Laraue.PdfQL)     |
| Загрузки     | ![загрузки](https://img.shields.io/nuget/dt/Laraue.PdfQL)            |
| GitHub       | [Laraue.PdfQL](https://github.com/Laraue/Laraue.PdfQL)           |
| Демо-приложение | [Laraue.Apps.PdfQL](https://github.com/Laraue/Laraue.Apps.PdfQL) (в архиве) |

---

## Зачем вообще писать язык запросов?

Извлечение структурированных данных из PDF на C# — таблиц, строк, конкретных ячеек — обычно превращается в повторяющийся и хрупкий императивный код: открыть документ, найти элементы по позиции, пройтись циклом по строкам, вручную применить условия. Каждая новая задача — снова тот же шаблонный код.

Идея PdfQL — выражать такие операции **декларативно**, как SQL выражает запросы к базе данных. Вместо императивного кода на C#, который ищет таблицы со значением "Name" в колонке 4 и возвращает колонку 1, достаточно написать:

```pdfql
select(tables)
    ->filter((item) => item.GetCell(4).Text() == 'Name')
    ->selectMany(tableRows)
    ->map((item) => item.GetCell(1))
```

Библиотека парсит эту строку, строит план выполнения и запускает его на PDF-документе. Это и есть основной цикл любого интерпретатора, и статья — о том, как он устроен.

---

## Почему не SQL-синтаксис

Когда проектируешь язык запросов, первое желание — взять синтаксис, похожий на SQL. Он всем знаком, понятен, и для него много инструментов.

Но SQL рассчитан на **реляционные данные с join'ами**, а у документов такой структуры нет: PDF-файлы почти никогда не соединяют друг с другом. Основные операции другие: выбрать тип элемента, отфильтровать по условию, преобразовать результат. Это не `SELECT ... FROM ... WHERE` — это **конвейер стадий**.

Ближе всего к этому конвейер агрегации MongoDB: каждая стадия получает результат предыдущей, преобразует его и передаёт дальше. PdfQL берёт эту модель как есть, а стадии соединяет оператором `->`. Синтаксис намеренно ближе к цепочке вызовов методов в функциональном стиле, чем к SQL.

Если концепция выйдет за рамки PDF, язык будет переименован в DocQL — та же модель конвейера, применённая к любому формату документов.

---

## Архитектура: три слоя

Интерпретатор языка запросов решает три отдельные задачи:

1. **Сканер** — превращает строку запроса в плоский список токенов
2. **Парсер** — превращает список токенов в структурированное дерево (AST)
3. **Исполнитель** — обходит AST и выполняет каждую операцию над данными

В PdfQL есть и четвёртый слой, связанный с предметной областью: **DocumentObjectsExtractor**. Ещё до запуска исполнителя он превращает байты PDF в типизированную последовательность объектов документа (таблицы, абзацы, изображения, формы).

---

## Слой 1: Сканер

Задача сканера — **токенизация**: разбить строку запроса на осмысленные единицы, отбросив пробелы и переносы строк.

Полный словарь токенов определён в [`TokenType.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Scanning/TokenType.cs):

```csharp
public enum TokenType
{
    Identifier, String, Integer,
    Comma, Dot,
    LessThan, GreaterThan, LessOrEqualThan, GreaterOrEqualThan,
    Assign, Equal, NotEqual, Not,
    Minus, Plus, Divide, Multiply,
    LeftParentheses, RightParentheses,
    LeftBracket, RightBracket,
    Lambda,       // =>
    NextPipeline, // ->
    False, True, Null,
    New, Eof,
}
```

[`Scanner`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Scanning/Scanner.cs) разбирает входную строку посимвольно во внутреннем классе `ScannerImplementation`. Главное здесь — сканер следит сразу за **абсолютной позицией** (смещением в исходной строке, чтобы вырезать лексемы) и **относительной** (номером столбца в текущей строке для сообщений об ошибках). Двухсимвольные операторы `->`, `=>`, `==`, `!=` обрабатывает вспомогательный метод `PopNextCharIf`: он забирает следующий символ, только если тот подходит под условие:

```csharp
case '-':
    AddToken(PopNextCharIf(c => c == '>') ? TokenType.NextPipeline : TokenType.Minus);
    break;
case '=':
    AddToken(PopNextCharIf(c => c == '>')
        ? TokenType.Lambda
        : PopNextCharIf(c => c == '=')
            ? TokenType.Equal
            : TokenType.Assign);
    break;
```

Сканер возвращает `ScanResult`, содержащий и массив токенов, и объекты `ScanError` — так при некорректном вводе вызывающий код получает понятное описание ошибок, а не исключения.

---

## Слой 2: Парсер и AST

Парсер берёт плоский поток токенов и строит **Abstract Syntax Tree (AST)** — иерархическую структуру, отражающую грамматику запроса.

Базовый узел AST намеренно минимальный: [`Expr.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Parsing/Expressions/Expr.cs) — просто пустой record:

```csharp
public record Expr
{
}
```

От него наследуются все типы выражений. `record` в C# даёт структурное равенство бесплатно, поэтому юнит-тесты парсера получаются простыми: ожидаемое и фактическое дерево сравниваются без собственной логики равенства.

Конкретный пример — [`BinaryExpr.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Parsing/Expressions/BinaryExpr.cs), представляющий любое двуоперандное выражение (`==`, `!=`, `<`, `>`, `+` и т.д.):

```csharp
public record BinaryExpr : Expr
{
    public BinaryExpr(Expr left, Token @operator, Expr right)
    {
        Left = left;
        Operator = @operator;
        Right = right;
    }

    public Expr Left { get; init; }
    public Token Operator { get; init; }  // хранит TokenType и фактический lexeme
    public Expr Right { get; init; }

    public override string ToString() => $"{Left} {Operator.Lexeme} {Right}";
}
```

Поле `Operator` хранит весь `Token`, а не только тип оператора, чтобы в сообщении об ошибке можно было показать точный текст и позицию. А рекурсивный `ToString()` позволяет распечатать всё дерево — при отладке парсера в отрыве от остального кода это очень выручает.

[`Parser`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Parsing/Parser.cs) построен на **рекурсивном спуске**: каждое правило грамматики — это метод, который вызывает методы для вложенных правил. Для парсера, написанного вручную, это самый читаемый подход, и на C# он хорошо ложится без генераторов парсеров вроде ANTLR.

---

## Слой 3: Исполнитель

Исполнитель **обходит AST и выполняет его**. Для конвейерной модели PdfQL это означает:

1. Начать с полной последовательности объектов документа, извлечённых из PDF
2. Для каждой стадии конвейера применить операцию стадии к текущей последовательности
3. Вернуть финальную последовательность

Каждый тип стадии соответствует известной операции над последовательностью:

| Стадия | Операция | Эквивалент в LINQ |
|---|---|---|
| `select(tables)` | Фильтр по типу | `OfType<Table>()` |
| `filter((x) => ...)` | Применение предиката | `Where(x => ...)` |
| `selectMany(tableRows)` | Разворачивание вложенной коллекции | `SelectMany(x => x.Rows)` |
| `map((x) => ...)` | Проекция в новое значение | `Select(x => ...)` |

Узлы лямбда-выражений в AST во время выполнения компилируются в делегаты `Func<>`. Имя параметра становится аргументом делегата, а тело выражения (в нём могут быть `BinaryExpr`, вызовы методов, доступ к свойствам и литералы) вычисляется рекурсивно.

---

## Генерация анонимных типов в рантайме через Reflection.Emit

Одна из самых необычных частей реализации — [`AnonymousTypeRegistry.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/DelegateCompiling/AnonymousTypeRegistry.cs). Когда стадия `map` превращает объекты документа во что-то новое — например, возвращает только текст ячейки, а не весь объект, — исполнителю нужно создавать типы результата, **структура которых становится известна только после разбора запроса во время выполнения**.

Обычный анонимный тип C# (`new { Name = "x" }`) здесь не годится: его структура должна быть известна при компиляции. Поэтому `AnonymousTypeRegistry` создаёт настоящие CLR-типы на лету с помощью `System.Reflection.Emit`:

```csharp
public class AnonymousTypeRegistry
{
    private readonly string _moduleName;
    private readonly HashSet<AnonymousTypeProperties> _declaredProperties = new();
    private readonly Dictionary<AnonymousTypeProperties, Type> _anonymousClassNames = new();

    public Type GetAnonymousType(AnonymousTypeProperties anonymousTypeProperties)
    {
        if (_declaredProperties.Add(anonymousTypeProperties))
        {
            var typeName = $"PdfQLAnonymousType_{_declaredProperties.Count}";
            var type = AnonymousTypeBuilder.CreateType(_moduleName, typeName, anonymousTypeProperties);
            _anonymousClassNames.Add(anonymousTypeProperties, type);
        }

        return _anonymousClassNames[anonymousTypeProperties];
    }
}
```

`AnonymousTypeProperties` наследуется от `ReadOnlyDictionary<string, Type>`: ключи — имена свойств, значения — их CLR-типы. `GetHashCode` и `Equals` считают XOR по всем парам «имя — тип», чтобы реестр не создавал одинаковые типы повторно: два запроса, которые оба возвращают `{ Text: string }`, используют один и тот же сгенерированный тип.

Такой приём — генерация типов во время выполнения и их кеширование по структурному равенству — в экосистеме .NET **описан плохо**. Большинство статей о `Reflection.Emit` рассказывают о генерации методов, а о создании полноценных именованных типов со свойствами, их регистрации в модуле и устранении дублей по структуре пишут крайне редко. Реализация в PdfQL — работающий и читаемый пример этой техники.

---

## Демо-приложение

У PdfQL было рабочее демо: можно было загрузить PDF, написать запрос и получить результат в JSON, а готовые пресеты (извлечь все таблицы, все изображения) внутри превращались в запросы на PdfQL. Мы его убрали и остановили сервис: не нашли способа сделать из проекта продукт, а времени на него сейчас нет. Сама идея нам по-прежнему кажется интересной, но мы пока не знаем, для чего она могла бы пригодиться.

Веб-API, на котором работало демо, лежит в архивном репозитории: [github.com/Laraue/Laraue.Apps.PdfQL](https://github.com/Laraue/Laraue.Apps.PdfQL). Это тонкая обёртка над библиотекой на ASP.NET Core, и она по-прежнему может пригодиться как пример того, как разместить PdfQL в веб-приложении. Сама библиотека не в архиве и находится в организации Laraue: [github.com/Laraue/Laraue.PdfQL](https://github.com/Laraue/Laraue.PdfQL).

---

## Исходный код

Полная реализация на [github.com/Laraue/Laraue.PdfQL](https://github.com/Laraue/Laraue.PdfQL). Ключевые файлы:

- [`Interpreter/Scanning/TokenType.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Scanning/TokenType.cs) — полный словарь токенов
- [`Interpreter/Scanning/Scanner.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Scanning/Scanner.cs) — реализация сканера
- [`Interpreter/Parsing/Expressions/Expr.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Parsing/Expressions/Expr.cs) — базовый узел AST
- [`Interpreter/Parsing/Expressions/BinaryExpr.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Parsing/Expressions/BinaryExpr.cs) — узел бинарного выражения
- [`Interpreter/Parsing/Parser.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/Parsing/Parser.cs) — рекурсивно-спускающий парсер
- [`Interpreter/DelegateCompiling/AnonymousTypeRegistry.cs`](https://github.com/Laraue/Laraue.PdfQL/blob/main/src/Laraue.PdfQL/Interpreter/DelegateCompiling/AnonymousTypeRegistry.cs) — генерация типов в рантайме

Проект распространяется под лицензией AGPL-3.0.

---

## Что дальше

Текущая реализация покрывает извлечение таблиц с фильтрацией. Проект на паузе, поэтому расширения ниже — это идеи, а не план:

- **Поддержка обычного текста** — `select(textRows)`, `select(words)`, `select(sentences)`
- **Поддержка изображений** — возврат изображений по условиям; функции вроде `resize(600, 400)`
- **Рефакторинг** — отвязать исполнитель от типов, специфичных для PDF, чтобы полноценно реализовать идею DocQL
- **Пользовательские функции** — регистрация собственных функций, вызываемых из лямбд запроса
