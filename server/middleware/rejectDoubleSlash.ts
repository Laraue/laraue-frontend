// Answers 404 before the page renderer sees the address (see `isDoubleSlashPath`). The raw
// `event.path` and not `getRequestURL`: the URL parser reads `//test/...` as the host `test`.
export default defineEventHandler((event) => {
    if (isDoubleSlashPath(event.path)) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }
})
