---
title: We built a markdown CMS backend in .NET, then dropped it for SSR in Nuxt
description: Why we deleted our own markdown-to-API backend and moved the blog into the Nuxt app — the frontend/backend sync problem, the things the system did not support, and what got simpler after the move.
seoTitle: We Built a .NET CMS Backend, Then Dropped It for Nuxt SSR
seoDescription: Why we deleted our markdown-to-API .NET backend and moved the blog into Nuxt: constant frontend/backend sync, features the API lacked, and what got simpler.
type: article
featured: true
createdAt: 2026-10-02 19:50
updatedAt: 2026-10-03 10:29
projects: [cms-backend]
tags: [dotnet, nuxt, architecture, open-source]
---
For a long time this blog was served by a backend we wrote ourselves: [Laraue.CmsBackend](../projects/cms-backend), a .NET library that turns markdown files into a queryable API, and a small .NET host around it. The Nuxt frontend asked that API for every list, every article, every tag. It worked — and it was a bad idea. We have just deleted the host and moved the markdown files into the Nuxt app, which now reads them itself and renders everything with SSR. This article is about why.

If you are about to put markdown behind a separate API, read this first.

## What we built and why

The goal was reasonable. Keep the content as markdown files in Git, away from the frontend, and query it over an API: filter by tag, sort by date, paginate, no database. Full CMS platforms felt heavy, and a pile of markdown inside the frontend felt like mixing concerns. So we wrote the third path: a typed .NET library that reads files with frontmatter, plus a host that exposes a few endpoints — the feed, categories, tags, articles, projects, RSS, a sitemap and a generator of preview images.

The first version of the blog had no SSR, and Google took weeks to index new posts. We turned SSR on, and from then on every page request made the Nuxt server call the API, which returned the rendered HTML. Crawlers were happy. We were not, for a different reason.

## What it cost us: the frontend and the backend never stayed in sync

A blog is mostly the frontend. Nearly every small change we wanted touched both sides, because the API decided what the page could know:

- **Dates in the wrong language.** The backend formatted dates itself, with an expression string in the request: `format(createdAt, "dd MMM yyyy")`. Russian pages showed "26 Jun 2026". To fix that we had to change the backend contract, not the page.
- **A project shown as a slug.** An article knew its related projects only by file name, so the sidebar showed "boards" with a rocket next to it. A readable name meant a new field in the backend, a new lookup in the host, and a matching change in the frontend.
- **Things the markdown renderer did not do.** Our own renderer had its own opinions: it did not escape an ampersand, it dropped backslashes inside code blocks, and it restarted a numbered list after a code block. Each of these was a bug in a separate project that we had to fix, release and deploy.
- **A DTO for everything.** Every screen needed a list DTO and a detail DTO with an explicit list of properties as strings. Adding "previous and next article" or a tag counter meant editing C# classes, string expressions and TypeScript interfaces that had to agree by hand.
- **Two deployments for one change.** A change in the library was a NuGet release, then a host deploy, then a frontend deploy, in that order. Getting the order wrong meant a page that was broken until the next deploy.
- **A restart to see a change.** The host read the markdown files once at start, so every edit — even a typo — needed the backend container to be restarted before it showed up. Everything on the frontend side applies immediately in the dev server, and the content was the one thing that did not.
- **Features in the wrong place.** Read time was computed from the length of rendered HTML in the backend, breadcrumbs were guessed from route segments in the frontend, the sitemap lived in a third place, and the preview image generator was C# code of its own.

None of these is hard. Together they meant that the thing we wanted to do on a Tuesday evening — make the blog a bit better — was never one change. It was a small coordinated release of two repositories, and we would rather spend that time writing articles. When a change costs that much, you make fewer of them.

## The SSR twist

SSR made the split worse. Server-side rendering is exactly the case where the page and its data want to live in one process: the server renders the page, and it needs the content right now. With a separate API, the Nuxt server called another service over HTTP on every request to get content that could have been a file on its own disk. We had paid for an architecture that SSR then made pointless.

## What we did instead

We moved the markdown files into the Nuxt repository, in `content/blog/en/…` and `content/blog/ru/…`, and wrote a small catalog in TypeScript: it parses frontmatter, renders markdown, and answers the questions the old API answered — lists, tags, neighbors, categories. The server reads the files once at start. Pages get their data through the same Nuxt server, with no network call during rendering. RSS, the sitemap and the preview images are routes of the same app.

The catalog and its routes are around 700 lines of TypeScript. The host that it replaced was around 870 lines of C#, not counting the library behind it. We kept every public URL, compared a crawl of the old and the new site (status, canonical, hreflang, og:image), and did not lose a single page.

If you keep content in markdown too, two small tools from this site may help: the [Markdown translator](https://laraue.com/markdown-translator) for translating `.md` files and the [Markdown to HTML converter](https://laraue.com/markdown-converter) for checking how a text renders.

## Results

- **One deployment.** One repository, one build, one container instead of two services and a library.
- **Edits apply immediately.** In development a changed markdown file shows up after a page refresh, like any other change, with no container to restart.
- **Changes are local.** Translated dates, tag labels with counters, previous and next buttons on every page, short names for related projects, new titles for search results: each was a change in one place, and some took minutes.
- **The content is tested.** A test reads the real files and fails the build on a missing translation, a broken link or invalid frontmatter. On its first run it found a link in a Russian article that pointed to the English page.
- **Nothing broke for readers.** Article and project pages, the RSS feed, the sitemap and the preview image addresses are the same as before.
- **Less to run.** No separate host, no health check, no metrics for it, no routes for it in nginx.

## What we gave up

It is a trade-off, and it has a price. Content is now part of the frontend, so **fixing a typo in an article means deploying the whole website**: the build, the tests and a new container for every page, not just a restart of a small service that serves text. The old setup let us change content without touching the frontend at all.

For us this is acceptable: the deploy is automatic, it takes minutes, and we publish a few articles a month. But it is exactly the thing that would hurt on a site with frequent content edits or with editors who are not developers.

## When a separate content backend still makes sense

We do not think a headless API for content is always wrong. It is the right tool when:

- **Non-developers edit the content** and need an admin interface, not a Git workflow.
- **Several clients consume the same content** — a website, a mobile app, a newsletter — and the API is the contract between them.
- **Content has its own life cycle**, with publishing, drafts and scheduling, that should not be tied to a frontend deploy.

None of this applied to us: a small team, one website, content in Git. If this sounds like you and you use Nuxt, look at [Nuxt Content](https://content.nuxt.com) first — it is the same idea, maintained by other people. We wrote our own catalog because our needs were small and we wanted to keep it that way.

## Conclusions

- A separate API is a cost you pay on every change, not once. Count it by how many changes touch both sides.
- If the page and its data are one product, keep them in one deployable unit.
- With SSR the argument for a separate content service gets weaker, because the server that renders the page can read the files itself.
- Honestly, we do not like the library any more. We stopped developing it, but did not delete it: it stays public on GitHub as a piece of history, and in case a new idea for it appears.

If you want the earlier part of the story — why we chose this stack at all — see [Choosing a pet project stack for solo development](choosing-stack-for-solo-project).
