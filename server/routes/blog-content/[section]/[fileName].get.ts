// One article or project.
export default defineEventHandler(async (event) => {
    const section = getBlogSection(getRouterParam(event, 'section'))
    const locale = getBlogLocale(getQuery(event).languageCode)
    const details = (await useBlogCatalog()).detail(locale, section.folder, getRouterParam(event, 'fileName') ?? '')
    if (!details) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    return details
})
