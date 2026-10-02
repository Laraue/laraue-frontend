import { toUtcIso, type BlogRssItem } from '../../shared/blog/catalog'
import { blogUrl } from './blogUrls'

const descriptions: Record<BlogLocale, string> = {
    en: 'Articles on software engineering, architecture, and indie building.',
    ru: 'Статьи о создании ПО, архитектуре и соло-разработке',
}

const escapeXml = (value: string): string =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const rfc822 = (date: Date): string => date.toUTCString()

// RSS 2.0 of the blog in a language, the newest first. Pages carry their whole text, and the
// Atom elements the feed readers already know (`a10:updated`, `a10:content`) stay as they were.
export const buildRssFeed = (siteUrl: string, locale: BlogLocale, items: BlogRssItem[]): string => {
    const base = siteUrl.replace(/\/$/, '')
    const lastUpdated = items[0]?.updatedAt ?? new Date()

    const entries = items.map((item) => {
        const url = blogUrl(base, locale, item.path)

        return [
            '    <item>',
            `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
            `      <link>${escapeXml(url)}</link>`,
            ...item.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
            `      <title>${escapeXml(item.title)}</title>`,
            `      <description>${escapeXml(item.description)}</description>`,
            `      <pubDate>${rfc822(item.createdAt)}</pubDate>`,
            `      <a10:updated>${toUtcIso(item.updatedAt)}</a10:updated>`,
            `      <a10:content type="text">${escapeXml(item.content)}</a10:content>`,
            '    </item>',
        ].join('\n')
    })

    return [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<rss xmlns:a10="http://www.w3.org/2005/Atom" version="2.0">',
        '  <channel>',
        '    <title>Laraue Blog</title>',
        `    <link>${escapeXml(blogUrl(base, locale, ['blog']))}</link>`,
        `    <description>${escapeXml(descriptions[locale])}</description>`,
        `    <language>${locale}</language>`,
        `    <lastBuildDate>${rfc822(lastUpdated)}</lastBuildDate>`,
        `    <a10:link rel="self" type="application/rss+xml" href="${escapeXml(`${base}/api/blog/rss?languageCode=${locale}`)}" />`,
        ...entries,
        '  </channel>',
        '</rss>',
        '',
    ].join('\n')
}
