// The RSS feed of the blog: `/api/blog/rss?languageCode=en`.
export default defineEventHandler(async (event) => {
    const locale = getBlogLocale(getQuery(event).languageCode ?? 'en')
    const catalog = await useBlogCatalog()

    setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')

    return buildRssFeed(useRuntimeConfig(event).public.siteUrl, locale, catalog.rssItems(locale))
})
