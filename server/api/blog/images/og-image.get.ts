// The preview image of an article or a project, drawn on request:
// `/api/blog/images/og-image?articlePath=blog&articlePath=articles&articlePath=<name>&languageCode=en`.
// The address is the one the links of the pages already carry.
const images = new Map<string, Promise<Uint8Array>>()

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const locale = getBlogLocale(query.languageCode)
    const path = [query.articlePath ?? []].flat().map(String)
    const [root, section, fileName] = path
    if (root !== 'blog' || path.length !== 3 || !section || !fileName) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    const preview = (await useBlogCatalog()).preview(locale, section, fileName)
    if (!preview) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    // An image only changes together with the texts, so it is drawn once per run.
    const key = `${locale}/${section}/${fileName}`
    let image = import.meta.dev ? undefined : images.get(key)
    if (!image) {
        image = renderOgImage({ description: preview.description, siteName: 'Laraue Blog', title: preview.title })
        images.set(key, image)
        image.catch(() => images.delete(key))
    }

    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')

    return Buffer.from(await image)
})
