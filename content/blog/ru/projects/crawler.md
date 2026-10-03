---
title: Библиотека для парсинга сайтов на C# — строго типизированный краулер для .NET
type: project
name: Laraue.Crawling
tags: [dotnet, crawling, open-source]
repository: https://github.com/win7user10/Laraue.Crawling
language: C#
license: MIT
description: Laraue.Crawling — библиотека для парсинга сайтов на C# с типизированными схемами для статического HTML, страниц с JavaScript и XML и базовым классом для задач по расписанию. С её помощью мы собрали более 100 тысяч объявлений.
seoTitle: Библиотека парсинга сайтов на C#: типизированный краулер
seoDescription: Laraue.Crawling: типизированный парсинг сайтов на C# для HTML, JS-страниц и XML, с задачами по расписанию. Собрала 100 тысяч+ объявлений.
createdAt: 2025-03-04
updatedAt: 2026-10-03 10:13
---
Большинство парсеров на C# работают до тех пор, пока сайт не поменяет вёрстку. Тогда ломается селектор, и вы смотрите на клубок строк без типов, без тестов и без понятного места для правки. **Laraue.Crawling** ставит между вашим кодом и парсером типизированную схему: вы один раз описываете страницу C# моделями и селекторами, а библиотека заполняет модели.

Это не игрушка. На ней работал краулер нашего [сервиса по недвижимости](real-estate), который собрал больше 100 тысяч объявлений с двух крупных сайтов. Сервис больше не собирает новые объявления, потому что мы не нашли законного способа сделать из него продукт, но библиотека существует отдельно от него, и мы продолжаем её поддерживать.

[![NuGet](https://img.shields.io/nuget/v/Laraue.Crawling.Common)](https://www.nuget.org/packages/Laraue.Crawling.Common)
[![Downloads](https://img.shields.io/nuget/dt/Laraue.Crawling.Common)](https://www.nuget.org/packages/Laraue.Crawling.Common)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/win7user10/Laraue.Crawling)

## Зачем схема, а не селекторы в коде

Обычно берут парсер (AngleSharp или HtmlAgilityPack для статики, PuppeteerSharp или Playwright для страниц с JavaScript) и пишут извлечение данных прямо в коде. Для разового скрипта это нормально. Для кода, который живёт месяцами, — больно. Схема даёт:

- **Типы.** Модели — обычные C# record, поэтому неверный тип обнаруживается при компиляции.
- **Одно место для правки.** Сайт изменился — вы меняете одну схему, а не селекторы по всему коду.
- **Тесты.** Схема — обычный объект: разберите сохранённый HTML-файл и проверьте модель.
- **Одинаковая форма для разных парсеров.** Статические и динамические схемы строят модели одним способом.

## Быстрый старт

```bash
dotnet add package Laraue.Crawling.Static.AngleSharp
```

```csharp
public record ProductPage(string Title, string Price) : ICrawlingModel;

var schema = new AngleSharpSchemaBuilder<ProductPage>()
    .HasProperty(x => x.Title, "h1.title")
    .HasProperty(x => x.Price, ".price")
    .Build();

var parser = new AngleSharpParser(new NullLoggerFactory());
var model = await parser.RunAsync(schema, html);

Console.WriteLine(model.Title);
```

Вложенные объекты и списки описываются через `HasObjectProperty` и `HasArrayProperty` с вложенным построителем, поэтому страница с пользователем и списком собак превращается во вложенные record одним выражением.

## Статика, динамика и XML

- **Статический HTML** (`Laraue.Crawling.Static.AngleSharp`): быстро, без браузера, для страниц, которым JavaScript не нужен.
- **Страницы с JavaScript** (`Laraue.Crawling.Dynamic.PuppeterSharp`): настоящий headless-браузер через PuppeteerSharp. Построитель называется `PuppeterSharpSchemaBuilder`. И пакет, и класс пишутся «Puppeter», без второй «e»: именно так они названы на NuGet, поэтому копируйте имя точно. Обработчики получают дескриптор элемента PuppeteerSharp, а не строку HTML.
- **XML** (`Laraue.Crawling.Static.Xml`): `XmlSchemaBuilder` для лент, карт сайта и XML-ответов.

Когда один HTML-элемент нужно разложить на несколько свойств (например, «Боб Мартин 37» на имя, фамилию и возраст), `BindManually` отдаёт вам элемент, и вы связываете свойства сами.

## Схема из продакшена

Это часть схемы, которая читает одну страницу выдачи сайта объявлений в нашем сервисе по недвижимости. `HasArrayProperty` разбирает карточки, `BindManually` — ссылку, а `Map` превращает текст цены в число ([весь файл](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Crawling.AppServices/Cian/CianCrawlingSchema.cs)):

```csharp
return new PuppeterSharpSchemaBuilder<CrawlingResult>()
    .HasArrayProperty(x => x.Advertisements, "article", pageBuilder =>
    {
        pageBuilder.HasProperty(x => x.ShortDescription, "div[data-name=Description]");
        pageBuilder.BindManually(async (e, b) =>
        {
            var linkElement = await e.QuerySelectorAsync("div[data-name=LinkArea] a");
            var href = await linkElement.GetAttributeValueAsync("href");
            // ... строим идентификатор и ссылку из адреса
        });
        pageBuilder.HasProperty(
            x => x.TotalPrice,
            builder => builder
                .UseSelector("span[data-mark=MainPrice]")
                .Map(s => long.Parse(s.GetOnlyDigits())));
        pageBuilder.HasArrayProperty(
            x => x.ImageLinks,
            "div[data-name=Gallery] img",
            el => el!.GetAttributeValueAsync("src"));
    })
    .Build();
```

Селекторы — то, что ломается при изменении сайта, и все они лежат в одном файле.

## Задачи по расписанию

В пакете `Laraue.Crawling.Crawler` есть `BaseCrawlerJob<TModel, TLink, TState>` — базовый класс для краулера, который работает как hosted service. Цикл он выполняет сам: взять следующую ссылку, разобрать её, обработать результат, подождать, повторить. Вы реализуете шаги: `GetNextLinkAsync`, `ParseLinkAsync`, `AfterLinkParsedAsync`, `OnSessionStartAsync`, `OnSessionFinishAsync` и `GetTimeToWait`.

Две вещи в нём появились из настоящего парсинга:

- Любой шаг может выбросить `SessionInterruptedException`, и текущая сессия завершится корректно. Дальше задача ждёт столько, сколько вернёт `GetTimeToWait`.
- Если сайт распознал краулер, выбросите `CrawlerHasBeenDetectedException`. Задача запишет это в лог и выполнит переключение состояния, которое вы приложили к исключению (например, откроет новую сессию браузера), вместо того чтобы остановиться.

В нашем сервисе на каждый сайт объявлений была одна задача, которая читала страницы выдачи от самых свежих объявлений назад. В настройках репозитория сессия запускается раз в четыре часа, а пауза между страницами случайная: от 2 до 10 секунд для одного сайта и от 35 до 45 секунд для другого.

## Подойдёт ли вам

Берите, если вам нужны типизированные схемы и проверяемые селекторы: она под лицензией MIT, поддерживается и достаточно мала, чтобы прочитать её за вечер. Для быстрого скрипта в один файл используйте AngleSharp или PuppeteerSharp напрямую — библиотека лишь оборачивает их.

## Пакеты

| Пакет | Назначение |
|---|---|
| `Laraue.Crawling.Common` | Базовые абстракции и интерфейсы |
| `Laraue.Crawling.Static.AngleSharp` | Статический HTML через AngleSharp |
| `Laraue.Crawling.Dynamic.PuppeterSharp` | Страницы с JavaScript через PuppeteerSharp |
| `Laraue.Crawling.Static.Xml` | XML-деревья |
| `Laraue.Crawling.Crawler` | `BaseCrawlerJob` для парсинга по расписанию |

Исходный код: [github.com/win7user10/Laraue.Crawling](https://github.com/win7user10/Laraue.Crawling). Сайты объявлений, для которых её писали, здесь не разбираются, потому что сервис, который её использовал, больше не собирает новые объявления; эту историю рассказывает [страница проекта по недвижимости](real-estate).
