// The sections of the blog with the count of their pages, for the menu.
export default defineEventHandler(async (event) =>
    (await useBlogCatalog()).categories(getBlogLocale(getQuery(event).languageCode)),
)
