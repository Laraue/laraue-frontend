---
title: Laraue.CmsBackend (в архиве): Markdown как API на .NET
type: project
name: Laraue.CmsBackend
tags: [dotnet, open-source]
repository: https://github.com/win7user10/Laraue.CmsBackend
language: C#
license: MIT
description: Laraue.CmsBackend отдавала Markdown файлы с frontmatter как типизированный REST API на .NET. Этот блог работал на ней около года. Теперь она в архиве: что умела, как выглядел код и чему мы научились.
seoDescription: Архивная .NET библиотека: Markdown файлы с frontmatter как типизированный REST API. Как работала, какую ошибку с SSR мы допустили и почему отказались.
createdAt: 2025-11-01
updatedAt: 2026-10-03 09:35
---
**Laraue.CmsBackend в архиве.** Это была .NET библиотека, которая превращала Markdown файлы с frontmatter в типизированный REST API, и около года на ней работал этот блог. В октябре 2026 мы отказались от неё и перенесли контент в приложение на Nuxt: поддерживать в согласованном состоянии API и фронтенд оказалось дороже, чем пользы от API. [Подробно об этом в статье](../articles/why-we-dropped-cms-backend-for-nuxt-ssr).

Репозиторий открыт и доступен только для чтения. Эта страница — всё, что осталось от проекта: что умела библиотека, как выглядел код и одна ошибка, о которой больше нигде не написано.

|              |                                                                       |
|--------------|-----------------------------------------------------------------------|
| Язык         | C#, .NET 10                                                           |
| Тип проекта  | Библиотека                                                            |
| Статус       | В архиве, только чтение                                               |
| Лицензия     | MIT                                                                   |
| NuGet        | ![latest version](https://img.shields.io/nuget/v/Laraue.CmsBackend)  |
| Загрузки     | ![downloads](https://img.shields.io/nuget/dt/Laraue.CmsBackend)      |
| GitHub       | [Laraue.CmsBackend](https://github.com/win7user10/Laraue.CmsBackend) |

## Что умела библиотека

Идея была такой: хранить блог в `.md` файлах в Git, отдельно от фронтенда, и забирать их через API без базы данных. Библиотека делала четыре вещи:

- **Типизированные схемы контента.** C# класс с `required` свойствами описывает frontmatter. Файл без обязательного поля роняет приложение при запуске, а не превращается позже в сломанную страницу.
- **Фильтрация и сортировка.** Запрос по любому полю frontmatter, список тегов, постраничная выдача.
- **Рендеринг.** Тело Markdown превращалось в HTML, а для оглавления строился список внутренних ссылок.
- **Проекция свойств.** Запрос перечислял нужные поля, и возвращались только они, поэтому списки оставались лёгкими.

## Как это выглядело в коде

Тип контента, Markdown файл и хост. Тип наследуется от `BaseContentType`:

```csharp
public class Article : BaseContentType
{
    public required string[] Projects { get; init; }
    public required string Description { get; init; }
}
```

Файлы повторяют структуру адресов фронтенда (`blog/articles/article1.md`):

```markdown
---
title: О моём проекте
projects: [Project1, Project2]
description: Короткое описание
---
Здесь текст статьи.
```

Хост читает папку один раз при запуске:

```csharp
var cmsBackend = new CmsBackendBuilder(
        new MarkdownParser(
            new MarkdownToHtmlTransformer(),
            new ArticleInnerLinksGenerator()),
        new MarkdownProcessor())
    .AddContentType<Article>()
    .AddContentFolder("blog")
    .Build();
```

Эндпоинт сам выбирает, какие поля вернуть и в какой DTO их положить. Так выглядел список статей в контроллере настоящего блога ([полный код](https://github.com/Laraue/Laraue.Apps.Blog/blob/main/src/Laraue.Apps.Blog.ApiHost/Controllers/BlogController.cs)):

```csharp
[HttpPost("list")]
public IShortPaginatedResult<CardItem> GetList([FromBody] GetCardsRequest request)
{
    return cmsBackend.GetEntities<CardItem>(new GetEntitiesRequest
    {
        FromPath = request.Path,
        LanguageCode = request.LanguageCode,
        Properties = ["fileName", "title", "description", "path", "length(content)", "tags"],
        Pagination = request.Pagination,
    });
}
```

В `Properties` можно было писать и выражения: `length(content)` возвращало размер отрендеренного текста, а `format(createdAt, "dd MMM yyyy")` форматировало дату на сервере. Второе оказалось ошибкой, о ней ниже.

## Чему мы научились

**Не отказывайтесь от SSR на сайте с контентом.** Первая версия блога работала без серверного рендеринга. Рассуждение казалось разумным: Google умеет выполнять JavaScript, API отвечал быстро, а без SSR проще инфраструктура. На деле новые статьи неделями не попадали в индекс. Исправили включением рендеринга на сервере: теперь поисковый робот получает готовый HTML с первого запроса. Если людей к вам приводит поиск, не рассчитывайте, что робот дождётся вашего JavaScript.

**Не заставляйте API форматировать данные для страницы.** Из-за форматирования даты на сервере русские страницы показывали «26 Jun 2026», а чтобы это исправить, пришлось менять контракт бэкенда, а не страницу. То же повторилось с названиями проектов, ошибками рендерера и каждым новым DTO для списка. Полный перечень — [в статье](../articles/why-we-dropped-cms-backend-for-nuxt-ssr).

**Отдельный API для контента оправдан не всегда.** Он нужен, когда контент правят не разработчики через админку, когда один и тот же контент берут несколько клиентов (сайт, приложение, рассылка) или когда у контента свой цикл публикации. У нас ничего из этого не было: небольшая команда, один сайт, контент в Git.

## Если вы выбираете сейчас

Если ваш сайт на Nuxt, сначала посмотрите [Nuxt Content](https://content.nuxt.com). Это та же идея, но её поддерживают другие люди, а контент лежит рядом со страницами. Мы заменили библиотеку собственным небольшим каталогом, около 700 строк на TypeScript, потому что наши задачи были простыми.

Код бэкенда блога, который работал на этой библиотеке, по-прежнему доступен в репозитории [Laraue.Apps.Blog](https://github.com/Laraue/Laraue.Apps.Blog), если нужен живой пример для чтения. С самими файлами помогут наши инструменты: [конвертер Markdown в HTML](https://laraue.com/ru/markdown-converter) показывает живой предпросмотр, а [переводчик Markdown](https://laraue.com/ru/markdown-translator) переводит текст `.md` файла и сохраняет заголовки, блоки кода и таблицы.
