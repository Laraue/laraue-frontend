import { blogSections, type BlogEntry } from '../../shared/blog/catalog'
import { blogUrl } from './blogUrls'

export interface BlogMarkdownTarget {
    locale: BlogLocale;
    section: (typeof blogSections)[number]['folder'];
    fileName: string;
}

// The markdown copy of a blog page is the page's address plus `.md`:
// `/ru/blog/articles/x.md` -> ru, articles, x. Anything else is not a markdown copy.
export const parseBlogMarkdownPath = (pathname: string): BlogMarkdownTarget | undefined => {
    const match = /^(?:\/(ru))?\/blog\/([a-z]+)\/([a-z\d-]+)\.md$/.exec(pathname)
    const section = blogSections.find((candidate) => candidate.folder === match?.[2])
    if (!match?.[3] || !section) {
        return undefined
    }

    return { fileName: match[3], locale: match[1] === 'ru' ? 'ru' : 'en', section: section.folder }
}

const blogPagePattern = /^(?:\/ru)?\/blog\/(?:articles|projects)\/[a-z\d-]+$/
const hasScheme = /^[a-z][a-z\d+.-]*:/i
const link = /\]\(([^)\s]+)\)/g
// A video is written as an image of its YouTube link (see renderMarkdown); as text it is a link.
const videoImage = /!\[([^\]]*)\]\((https:\/\/(?:youtu\.be|(?:www\.)?youtube\.com)\/[^)\s]+)\)/g
// Fenced code blocks are left as they are: `](` in code is not a link.
const codeBlock = /(^[ \t]*```[\s\S]*?^[ \t]*```[ \t]*$)/m

// A link of the page as an address that works outside the site. Pages link to each other relatively
// (`other-article`, `../projects/crawler`); a link to a blog page leads to its markdown copy.
const portableHref = (href: string, pageUrl: string): string => {
    if (hasScheme.test(href) || href.startsWith('#')) {
        return href
    }

    const url = new URL(href, pageUrl)
    if (url.origin === new URL(pageUrl).origin && blogPagePattern.test(url.pathname)) {
        url.pathname = `${url.pathname}.md`
    }

    return url.href
}

const toPortableMarkdown = (markdown: string, pageUrl: string): string =>
    markdown
        .split(codeBlock)
        .map((part, index) =>
            index % 2 === 1
                ? part
                : part
                      .replaceAll(videoImage, '[$1]($2)')
                      .replaceAll(link, (_, href: string) => `](${portableHref(href, pageUrl)})`),
        )
        .join('')

const day = (date: Date): string => date.toISOString().slice(0, 10)

// One blog page as markdown, for `<page>.md`: the title, the description, where and when it was
// published, then the text.
export const buildBlogMarkdownCopy = (
    siteUrl: string,
    entry: BlogEntry,
    seriesTitle: string | undefined,
): string => {
    const pageUrl = blogUrl(siteUrl, entry.locale, entry.path)
    const facts = [
        `- Source: ${pageUrl}`,
        `- Published: ${day(entry.createdAt)}, updated: ${day(entry.updatedAt)}`,
        ...(entry.series ? [`- Series: ${seriesTitle ?? entry.series}, part ${entry.part}`] : []),
        ...(entry.repository ? [`- Repository: ${entry.repository}`] : []),
    ]

    return [
        `# ${entry.title}`,
        `> ${entry.description}`,
        facts.join('\n'),
        toPortableMarkdown(entry.markdown.trim(), pageUrl),
    ].join('\n\n') + '\n'
}

const markdownUrl = (siteUrl: string, entry: BlogEntry): string =>
    `${blogUrl(siteUrl, entry.locale, entry.path)}.md`

const listItem = (siteUrl: string, entry: BlogEntry, title = entry.title): string =>
    `- [${title}](${markdownUrl(siteUrl, entry)}): ${entry.description}`

// The apps of the site, as their pages describe them.
const tools = (siteUrl: string): string[] => [
    '- [Laraue Boards](https://boards.laraue.com): turn Telegram messages into cards, and let your AI agent ' +
        'manage them over MCP. Its documentation for LLMs: https://boards.laraue.com/llms.txt',
    `- [Vocabulary Bot](${siteUrl}/learn-language-bot): a free Telegram bot for building your English ` +
        'vocabulary: short quizzes on nearly 6,000 English words from A1 to C1, translated into 10 languages.',
    `- [Markdown Translator](${siteUrl}/markdown-translator): translate Markdown and README.md files between ` +
        '10+ languages online. Headings, code blocks, tables and links stay intact.',
    `- [Markdown to HTML Converter](${siteUrl}/markdown-converter): Markdown to HTML with live preview, ` +
        'tables and code blocks, sanitized HTML output.',
    `- [AI-Ranked Saint Petersburg Apartments](${siteUrl}/crawled-apartments): a snapshot of Cian and Avito ` +
        'apartment listings in Saint Petersburg, ranked by AI photo quality.',
]

// `/llms.txt` (https://llmstxt.org): the site's apps, then the English blog: projects, each series
// in the order of its parts, the other articles newest first. `entries` are the newest first.
export const buildLlmsTxt = (
    siteUrl: string,
    entries: BlogEntry[],
    seriesTitle: (key: string) => string | undefined,
): string => {
    const projects = entries.filter((entry) => entry.section === 'projects')
    const articles = entries.filter((entry) => entry.section === 'articles')
    const seriesKeys = [...new Set(articles.flatMap((entry) => (entry.series ? [entry.series] : [])))]

    const blocks = [
        '# Laraue',
        '> Laraue Software builds reliable, privacy-first tools for people who work with information, ' +
            'and writes about building them: .NET and Nuxt architecture, Telegram bots, AI-assisted ' +
            'development and open source libraries.',
        'The blog links below lead to markdown copies of the pages; the same address without `.md` is ' +
            'the page on the site.',
        ['## Tools', ...tools(siteUrl)].join('\n'),
        ['## Projects', ...projects.map((entry) => listItem(siteUrl, entry, entry.name ?? entry.title))].join('\n'),
        ...seriesKeys.map((key) =>
            [
                `## Series: ${seriesTitle(key) ?? key}`,
                ...articles
                    .filter((entry) => entry.series === key)
                    .toSorted((left, right) => (left.part ?? 0) - (right.part ?? 0))
                    .map((entry) => listItem(siteUrl, entry, `Part ${entry.part}: ${entry.title}`)),
            ].join('\n'),
        ),
        ['## Articles', ...articles.filter((entry) => !entry.series).map((entry) => listItem(siteUrl, entry))].join('\n'),
        [
            '## Optional',
            `- [Блог на русском](${siteUrl}/ru/blog): the blog in Russian`,
            `- [RSS feed](${siteUrl}/api/blog/rss?languageCode=en): every article with its full text`,
            `- [Privacy policy](${siteUrl}/privacy)`,
        ].join('\n'),
    ]

    return blocks.join('\n\n') + '\n'
}
