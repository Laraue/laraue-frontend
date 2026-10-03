---
title: C# Web Scraping Library — Strongly Typed Crawling for .NET
type: project
name: Laraue.Crawling
tags: [dotnet, crawling, open-source]
repository: https://github.com/win7user10/Laraue.Crawling
language: C#
license: MIT
description: Laraue.Crawling is a C# web scraping library for .NET with typed schemas for static HTML, JavaScript-rendered pages and XML, plus a base class for scheduled crawler jobs. It crawled 100,000+ listings for us.
seoDescription: Laraue.Crawling: a typed C# web scraping library for HTML, JS-rendered pages and XML, with scheduled jobs. It collected 100,000+ real estate listings.
createdAt: 2025-11-01
updatedAt: 2026-10-03 10:13
---
Most C# scraping code works until a site changes its layout. Then a selector breaks, and you are looking at a tangle of strings with no types, no tests and no obvious place to fix it. **Laraue.Crawling** puts a typed schema between your code and the parser: you describe the page as C# models and selectors once, and the library fills the models.

It is not a toy. It is the crawler behind our [real estate service](real-estate), which collected more than 100,000 listings from two large listing sites. That service no longer collects new listings, because we have not found a legal way to make it a product, but the library is separate from it and we keep maintaining it.

[![NuGet](https://img.shields.io/nuget/v/Laraue.Crawling.Common)](https://www.nuget.org/packages/Laraue.Crawling.Common)
[![Downloads](https://img.shields.io/nuget/dt/Laraue.Crawling.Common)](https://www.nuget.org/packages/Laraue.Crawling.Common)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/win7user10/Laraue.Crawling)

## Why a schema instead of selectors in code

The usual way is to pick a parser (AngleSharp or HtmlAgilityPack for static pages, PuppeteerSharp or Playwright for pages that need JavaScript) and write the extraction inline. That is fine for a one-off script. It hurts when you maintain it for months. A schema gives you:

- **Types.** Models are plain C# records, so a wrong type fails at compile time.
- **One place to fix.** When a site changes, you change one schema, not selectors scattered through the code.
- **Tests.** A schema is an ordinary object: parse a saved HTML file and assert on the model.
- **The same shape for different parsers.** Static and dynamic schemas build models the same way.

## Quickstart

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

Nested objects and lists use `HasObjectProperty` and `HasArrayProperty` with a sub-builder, so a page with a user and a list of dogs maps to nested records in one expression.

## Static, dynamic and XML

- **Static HTML** (`Laraue.Crawling.Static.AngleSharp`): fast, no browser, for pages that do not need JavaScript.
- **JavaScript-rendered pages** (`Laraue.Crawling.Dynamic.PuppeterSharp`): a real headless browser through PuppeteerSharp. The builder is `PuppeterSharpSchemaBuilder`. Both the package and the class are spelled "Puppeter", without the second "e"; that is how they are named on NuGet, so copy the name exactly. Handlers work with the PuppeteerSharp element handle instead of an HTML string.
- **XML** (`Laraue.Crawling.Static.Xml`): `XmlSchemaBuilder` for feeds, sitemaps and XML responses.

When one HTML element must be split into several properties (for example "Bob Martin 37" into a name, a surname and an age), `BindManually` gives you the element and lets you bind properties yourself.

## A schema from production

This is a part of the schema that reads one search result page of a listing site in our real estate service. It uses `HasArrayProperty` for the cards, `BindManually` for the link and `Map` to turn the price text into a number ([full file](https://github.com/Laraue/Laraue.Apps.RealEstate/blob/main/src/Laraue.Apps.RealEstate.Crawling.AppServices/Cian/CianCrawlingSchema.cs)):

```csharp
return new PuppeterSharpSchemaBuilder<CrawlingResult>()
    .HasArrayProperty(x => x.Advertisements, "article", pageBuilder =>
    {
        pageBuilder.HasProperty(x => x.ShortDescription, "div[data-name=Description]");
        pageBuilder.BindManually(async (e, b) =>
        {
            var linkElement = await e.QuerySelectorAsync("div[data-name=LinkArea] a");
            var href = await linkElement.GetAttributeValueAsync("href");
            // ... build the id and the link from the address
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

The selectors are the part that breaks when a site changes, and they all live in one file.

## Scheduled crawling jobs

The package `Laraue.Crawling.Crawler` has `BaseCrawlerJob<TModel, TLink, TState>`, a base class for a crawler that runs as a hosted service. It runs the loop for you: get the next link, parse it, handle the result, wait, repeat. You implement the steps: `GetNextLinkAsync`, `ParseLinkAsync`, `AfterLinkParsedAsync`, `OnSessionStartAsync`, `OnSessionFinishAsync` and `GetTimeToWait`.

Two things in it came from real crawling:

- Any step can throw `SessionInterruptedException`, which finishes the current session cleanly. The job then waits for the time you return from `GetTimeToWait`.
- If the site detects the crawler, throw `CrawlerHasBeenDetectedException`. The job logs it and runs the state switch you attached to the exception (for example a new browser session) instead of stopping.

In our service one job per listing site read search pages from the newest listing backwards. In the repository settings a session starts every four hours and the pause between pages is random: 2 to 10 seconds for one site and 35 to 45 seconds for the other.

## Is it for you

Use it if you want typed schemas and testable selectors: it is MIT-licensed, maintained, and small enough to read in an evening. If you need a quick single-file script, use AngleSharp or PuppeteerSharp directly, as the library only wraps them.

## Packages

| Package | Purpose |
|---|---|
| `Laraue.Crawling.Common` | Core abstractions and interfaces |
| `Laraue.Crawling.Static.AngleSharp` | Static HTML through AngleSharp |
| `Laraue.Crawling.Dynamic.PuppeterSharp` | JavaScript-rendered pages through PuppeteerSharp |
| `Laraue.Crawling.Static.Xml` | XML trees |
| `Laraue.Crawling.Crawler` | `BaseCrawlerJob` for scheduled crawling |

Source: [github.com/win7user10/Laraue.Crawling](https://github.com/win7user10/Laraue.Crawling). The listing sites it was built for are not documented here, because the service that used it no longer collects new listings; the [real estate project page](real-estate) tells that story.
