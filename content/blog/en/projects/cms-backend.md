---
title: Laraue.CmsBackend: Markdown API in .NET (Not Developed)
type: project
name: Laraue.CmsBackend
tags: [dotnet, open-source]
repository: https://github.com/win7user10/Laraue.CmsBackend
language: C#
license: MIT
description: Laraue.CmsBackend served Markdown files with frontmatter as a typed REST API in .NET. This blog ran on it for about a year. Now it has no new commits: what it did, how the code looked, and what we learned.
seoDescription: A .NET library that served Markdown files with frontmatter as a typed REST API. How it worked, the SSR mistake we made, and why we dropped it.
createdAt: 2025-11-01
updatedAt: 2026-10-03 10:29
---
**Laraue.CmsBackend is no longer developed.** It was a .NET library that turned Markdown files with frontmatter into a typed REST API, and this blog ran on it for about a year. We stopped using it in October 2026 and moved the content into the Nuxt app, because keeping an API and a frontend in sync cost more than the API gave us. [The full story is in this article](../articles/why-we-dropped-cms-backend-for-nuxt-ssr).

The repository stays public, but we no longer develop or use the library. This page is what is left of the project: what the library did, how the code looked, and the one mistake that is not written down anywhere else.

|              |                                                                       |
|--------------|-----------------------------------------------------------------------|
| Language     | C#, .NET 10                                                           |
| Project type | Library                                                               |
| Status       | Public, not archived, no new commits                                  |
| License      | MIT                                                                   |
| NuGet        | ![latest version](https://img.shields.io/nuget/v/Laraue.CmsBackend)  |
| Downloads    | ![downloads](https://img.shields.io/nuget/dt/Laraue.CmsBackend)      |
| GitHub       | [Laraue.CmsBackend](https://github.com/win7user10/Laraue.CmsBackend) |

## What the library did

The idea: keep the blog as `.md` files in Git, away from the frontend, and ask for them over an API, with no database. The library covered four things:

- **Typed content schemas.** A C# class with `required` properties describes the frontmatter. A file that misses a required field fails when the application starts, not later as a broken page.
- **Filtering and sorting.** Query by any frontmatter field, get the list of tags, paginate.
- **Rendering.** The Markdown body became HTML, with a generated list of inner links for the table of contents.
- **Property projection.** A request names the fields it needs, and only those are returned, so list endpoints stay small.

## How it looked in code

A content type, a Markdown file and a host. The type inherits `BaseContentType`:

```csharp
public class Article : BaseContentType
{
    public required string[] Projects { get; init; }
    public required string Description { get; init; }
}
```

The file mirrors the URL structure of the frontend (`blog/articles/article1.md`):

```markdown
---
title: About my project
projects: [Project1, Project2]
description: My short description
---
The markdown content goes here.
```

The host reads the folder once at start:

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

An endpoint chooses the fields it returns and the DTO they go into. This is the list endpoint of the real blog controller ([full source](https://github.com/Laraue/Laraue.Apps.Blog/blob/main/src/Laraue.Apps.Blog.ApiHost/Controllers/BlogController.cs)):

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

`Properties` accepted expressions too: `length(content)` returned the size of the rendered body, and `format(createdAt, "dd MMM yyyy")` formatted a date on the server. That second one turned out to be a mistake, and it is described below.

## What we learned

**Do not skip SSR on a content site.** The first version of the blog had no server-side rendering. The reasoning looked sound: Google renders JavaScript, the API answered fast, and skipping SSR meant simpler infrastructure. In practice new posts sat unindexed for weeks. The fix was to render pages on the server, so a crawler gets complete HTML on the first request. If search is how people find your content, do not count on a crawler to wait for your JavaScript.

**Do not let the API format things for the page.** Formatting the date on the server meant that Russian pages showed "26 Jun 2026", and fixing it required changing the backend contract instead of the page. The same pattern repeated with project names, renderer bugs and every new list DTO. [The article](../articles/why-we-dropped-cms-backend-for-nuxt-ssr) has the whole list.

**A separate content API pays off only in some cases:** when non-developers edit content in an admin interface, when several clients (a website, an app, a newsletter) share the same content, or when content has its own publishing life cycle. None of this applied to us: a small team, one website, content in Git.

## If you are choosing now

If your site is built with Nuxt, look at [Nuxt Content](https://content.nuxt.com) first. It is the same idea, maintained by other people, and the content lives next to the pages. We replaced this library with a small catalog of our own, about 700 lines of TypeScript, because our needs were small.

The code of the blog backend that ran on this library is still available at [Laraue.Apps.Blog](https://github.com/Laraue/Laraue.Apps.Blog) if you want a working example to read. Our own Markdown tools may help with the files: the [Markdown to HTML converter](https://laraue.com/markdown-converter) shows a live preview, and the [Markdown translator](https://laraue.com/markdown-translator) translates the text of an `.md` file and keeps the headings, code blocks and tables.
