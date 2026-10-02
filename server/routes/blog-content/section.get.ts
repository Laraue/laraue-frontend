// The texts of the page of a list of the blog: `?languageCode=en&name=blog|articles|projects`.
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const section = (await useBlogCatalog()).section(getBlogLocale(query.languageCode), String(query.name))
    if (!section) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    return section
})
