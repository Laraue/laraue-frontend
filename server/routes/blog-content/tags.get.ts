// The tags of the blog pages, for the filter.
export default defineEventHandler(async (event) =>
    (await useBlogCatalog()).tags(getBlogLocale(getQuery(event).languageCode)),
)
