import { toUtcIso } from '../../../shared/blog/catalog'

// The sitemap of the blog: its lists and pages in both languages. The sitemap index
// (`/sitemap.xml`) points to it.
export default defineEventHandler(async (event) => {
    const siteUrl = getSiteUrl(event)
    const urls = (await useBlogCatalog()).sitemapUrls()

    setHeader(event, 'Content-Type', 'text/xml; charset=utf-8')

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(
            ({ locale, path, updatedAt }) =>
                `<url><loc>${blogUrl(siteUrl, locale, path)}</loc><lastmod>${toUtcIso(updatedAt)}</lastmod></url>`,
        ),
        '</urlset>',
    ].join('')
})
