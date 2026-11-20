// The markdown copy of a blog page: the page's address plus `.md`, e.g.
// /blog/articles/choosing-stack-for-solo-project.md. A middleware and not a route: a
// `/blog/articles/**` route would take the pages' own addresses from the Vue pages too.
export default defineEventHandler(async (event) => {
    if (event.method !== 'GET' && event.method !== 'HEAD') {
        return
    }

    const target = parseBlogMarkdownPath(getRequestURL(event).pathname)
    if (!target) {
        return
    }

    const catalog = await useBlogCatalog()
    const entry = catalog.entry(target.locale, target.section, target.fileName)
    if (!entry) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
    // The page itself is what search engines should show.
    setHeader(event, 'X-Robots-Tag', 'noindex')

    return buildBlogMarkdownCopy(
        getSiteUrl(event),
        entry,
        entry.series ? catalog.seriesTitle(entry.locale, entry.series) : undefined,
    )
})
