import { blogSections } from '../../../shared/blog/catalog'

// A page of the blog: articles and projects together, or one section of them. The pages read it
// during the render, the browser asks for it when the visitor moves between the pages.
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const locale = getBlogLocale(query.languageCode)
    const section = query.section === undefined ? undefined : getBlogSection(query.section)
    const page = Math.max(0, Number.parseInt(String(query.page ?? 0), 10) || 0)
    const perPage = Math.min(100, Math.max(1, Number.parseInt(String(query.perPage ?? 16), 10) || 16))
    const tag = typeof query.tag === 'string' && query.tag !== '' ? query.tag : undefined

    const catalog = await useBlogCatalog()
    // A tag the blog does not have is a page that does not exist (old addresses of the removed tags).
    if (!section && tag && !catalog.tags(locale).some((candidate) => candidate.key === tag)) {
        throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
    }

    return catalog.list(locale, {
        contentTypes: section ? [section.contentType] : blogSections.map(({ contentType }) => contentType),
        featured: query.featured === 'true',
        page,
        perPage,
        // Tags filter the feed of all the pages only.
        tag: section ? undefined : tag,
    } satisfies { contentTypes: BlogContentType[]; tag?: string; featured?: boolean; page: number; perPage: number })
})
