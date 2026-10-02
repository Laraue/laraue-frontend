import type {
    BlogContentType,
    BlogLocale,
    ItemDetails,
    ItemListItem,
    NeighborCard,
    PaginationData,
    BlogSection,
    SidebarItem,
    Tag,
    InnerLink,
} from '../types/blog'
import { parseFrontmatter } from './frontmatter'
import { renderMarkdown } from './renderMarkdown'

export const blogLocales: BlogLocale[] = ['en', 'ru']

// The sections of the blog (a folder of the content each): its address and the type of the pages.
export const blogSections = [
    { folder: 'articles', contentType: 'article' },
    { folder: 'projects', contentType: 'project' },
] as const satisfies readonly { folder: string; contentType: BlogContentType }[]

type SectionFolder = (typeof blogSections)[number]['folder']

export interface BlogEntry {
    locale: BlogLocale;
    section: SectionFolder;
    // The file name without the extension: the last segment of the page address.
    fileName: string;
    contentType: BlogContentType;
    // Segments of the page address, without the language.
    path: string[];
    title: string;
    description: string;
    // Set when the title or the description is too long for the search results.
    seoTitle: string | null;
    seoDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
    tags: string[] | null;
    projects: string[] | null;
    previousLink: string | null;
    nextLink: string | null;
    html: string;
    innerLinks: InnerLink[];
}

interface BlogSectionMeta extends BlogSection {
    icon: string;
}

export interface BlogRssItem {
    title: string;
    description: string;
    content: string;
    path: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface BlogSitemapUrl {
    path: string[];
    locale: BlogLocale;
    updatedAt: Date;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (value: number): string => String(value).padStart(2, '0')

// A date of a file is a wall clock time without a zone (`2026-06-26` or `2026-06-26 15:00`), it is
// kept as the same time in UTC.
export const parseBlogDate = (value: string): Date | undefined => {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(value)
    if (!match) {
        return undefined
    }

    const [year, month, day, hours, minutes] = match.slice(1).map((part) => Number(part ?? 0)) as [
        number, number, number, number, number,
    ]
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes))

    return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : undefined
}

// `26 Jun 2026`
export const formatBlogDate = (date: Date): string =>
    `${pad(date.getUTCDate())} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`

// `2026-06-26T15:00:00`
export const toLocalIso = (date: Date): string => date.toISOString().slice(0, 19)

// `2026-06-26T15:00:00Z`
export const toUtcIso = (date: Date): string => `${toLocalIso(date)}Z`

const text = (attributes: Record<string, string | string[]>, name: string): string | undefined => {
    const value = attributes[name]
    return typeof value === 'string' && value !== '' ? value : undefined
}

const list = (attributes: Record<string, string | string[]>, name: string): string[] | null => {
    const value = attributes[name]
    if (Array.isArray(value)) {
        return value.length > 0 ? value : null
    }
    return typeof value === 'string' && value !== '' ? [value] : null
}

const requireText = (
    attributes: Record<string, string | string[]>,
    name: string,
    file: string,
): string => {
    const value = text(attributes, name)
    if (value === undefined) {
        throw new Error(`${file}: "${name}" is required`)
    }
    return value
}

const requireDate = (
    attributes: Record<string, string | string[]>,
    name: string,
    file: string,
): Date => {
    const value = requireText(attributes, name, file)
    const date = parseBlogDate(value)
    if (!date) {
        throw new Error(`${file}: "${name}" is not a date (YYYY-MM-DD or YYYY-MM-DD HH:mm): ${value}`)
    }
    return date
}

const byCreatedAtDesc = (left: BlogEntry, right: BlogEntry): number =>
    right.createdAt.getTime() - left.createdAt.getTime() ||
    left.fileName.localeCompare(right.fileName)

const entryKey = (locale: BlogLocale, section: string, fileName: string): string =>
    `${locale}/${section}/${fileName}`

const toListItem = (entry: BlogEntry): ItemListItem => ({
    contentType: entry.contentType,
    description: entry.description,
    fileName: entry.fileName,
    length: entry.html.length,
    path: entry.path,
    projects: entry.projects,
    tags: entry.tags,
    title: entry.title,
})

// All the pages of the blog of every language, read from `files` (a path inside the content folder,
// like `en/articles/ollama-dotnet.md` -> the file text).
export const createBlogCatalog = (files: Record<string, string>) => {
    const entries = new Map<string, BlogEntry>()
    const sections = new Map<string, BlogSectionMeta>()

    for (const [file, raw] of Object.entries(files)) {
        const segments = file.split('/')
        const locale = segments[0]
        if (locale !== 'en' && locale !== 'ru') {
            throw new Error(`${file}: the first folder must be a language (en or ru)`)
        }

        const { attributes, body } = parseFrontmatter(raw)
        const name = (segments.at(-1) ?? '').replace(/\.md$/, '')

        // `en/index.md`, `en/articles/index.md`: a title and an icon of a section for the menu.
        if (name === 'index') {
            const folder = segments.length === 2 ? 'blog' : segments[1] ?? ''
            const title = requireText(attributes, 'title', file)
            sections.set(`${locale}/${folder}`, {
                icon: text(attributes, 'icon') ?? '',
                seoDescription: requireText(attributes, 'seoDescription', file),
                seoTitle: text(attributes, 'seoTitle') ?? title,
                subTitle: requireText(attributes, 'subTitle', file),
                title,
            })
            continue
        }

        const section = blogSections.find((candidate) => candidate.folder === segments[1])
        if (!section || segments.length !== 3) {
            throw new Error(`${file}: a page must be in a folder of a section (articles, projects)`)
        }
        if (text(attributes, 'type') !== section.contentType) {
            throw new Error(`${file}: "type" must be ${section.contentType}`)
        }

        const { html, innerLinks } = renderMarkdown(body)
        entries.set(entryKey(locale, section.folder, name), {
            contentType: section.contentType,
            createdAt: requireDate(attributes, 'createdAt', file),
            description: requireText(attributes, 'description', file),
            fileName: name,
            html,
            innerLinks,
            locale,
            nextLink: text(attributes, 'nextLink') ?? null,
            path: ['blog', section.folder, name],
            previousLink: text(attributes, 'previousLink') ?? null,
            projects: list(attributes, 'projects'),
            section: section.folder,
            seoDescription: text(attributes, 'seoDescription') ?? null,
            seoTitle: text(attributes, 'seoTitle') ?? null,
            tags: list(attributes, 'tags'),
            title: requireText(attributes, 'title', file),
            updatedAt: requireDate(attributes, 'updatedAt', file),
        })
    }

    const localeEntries = (locale: BlogLocale): BlogEntry[] =>
        [...entries.values()].filter((entry) => entry.locale === locale).toSorted(byCreatedAtDesc)

    const neighbor = (entry: BlogEntry, fileName: string | null): NeighborCard | undefined => {
        const target = fileName ? entries.get(entryKey(entry.locale, entry.section, fileName)) : undefined
        return target ? { path: target.path, title: target.title } : undefined
    }

    return {
        entries: (locale: BlogLocale): BlogEntry[] => localeEntries(locale),

        // A page of the list of articles and projects, newest first.
        list(
            locale: BlogLocale,
            options: { contentTypes: BlogContentType[]; tag?: string; page: number; perPage: number },
        ): PaginationData<ItemListItem> {
            const matching = localeEntries(locale).filter(
                (entry) =>
                    options.contentTypes.includes(entry.contentType) &&
                    (!options.tag || (entry.tags?.includes(options.tag) ?? false)),
            )
            const start = options.page * options.perPage

            return {
                data: matching.slice(start, start + options.perPage).map(toListItem),
                hasNextPage: start + options.perPage < matching.length,
                hasPreviousPage: options.page > 0,
                page: options.page,
                perPage: options.perPage,
            }
        },

        detail(locale: BlogLocale, section: string, fileName: string): ItemDetails | undefined {
            const entry = entries.get(entryKey(locale, section, fileName))
            if (!entry) {
                return undefined
            }

            const previousLink = neighbor(entry, entry.previousLink)
            const nextLink = neighbor(entry, entry.nextLink)

            return {
                content: entry.html,
                contentType: entry.contentType,
                createdAt: formatBlogDate(entry.createdAt),
                createdAtIso: toLocalIso(entry.createdAt),
                description: entry.description,
                innerLinks: entry.innerLinks,
                length: entry.html.length,
                projects: entry.projects,
                seoDescription: entry.seoDescription ?? entry.description,
                seoTitle: entry.seoTitle ?? entry.title,
                tags: entry.tags,
                title: entry.title,
                updatedAt: formatBlogDate(entry.updatedAt),
                updatedAtIso: toLocalIso(entry.updatedAt),
                ...(previousLink && { previousLink }),
                ...(nextLink && { nextLink }),
            }
        },

        // The menu of the blog: all the pages, then every section with the count of its pages.
        categories(locale: BlogLocale): SidebarItem[] {
            const all = localeEntries(locale)
            const toItem = (folder: string, path: string[], count: number): SidebarItem => ({
                count,
                icon: sections.get(`${locale}/${folder}`)?.icon ?? '',
                key: folder,
                path,
                title: sections.get(`${locale}/${folder}`)?.title ?? folder,
            })

            return [
                toItem('blog', ['blog'], all.length),
                ...blogSections.map(({ folder }) =>
                    toItem(
                        folder,
                        ['blog', folder],
                        all.filter((entry) => entry.section === folder).length,
                    ),
                ),
            ]
        },

        // The texts of the page of a list: `blog` (all the pages), `articles` or `projects`.
        section(locale: BlogLocale, folder: string): BlogSection | undefined {
            const meta = sections.get(`${locale}/${folder}`)
            return meta && { seoDescription: meta.seoDescription, seoTitle: meta.seoTitle, subTitle: meta.subTitle, title: meta.title }
        },

        tags(locale: BlogLocale): Tag[] {
            const counts = new Map<string, number>()
            for (const tag of localeEntries(locale).flatMap((entry) => entry.tags ?? [])) {
                counts.set(tag, (counts.get(tag) ?? 0) + 1)
            }

            return [...counts]
                .map(([key, count]) => ({ count, key }))
                .toSorted((left, right) => left.key.localeCompare(right.key))
        },

        // The title and the description of a page, for its preview image.
        preview(
            locale: BlogLocale,
            section: string,
            fileName: string,
        ): { title: string; description: string } | undefined {
            const entry = entries.get(entryKey(locale, section, fileName))
            return entry && { description: entry.description, title: entry.title }
        },

        rssItems(locale: BlogLocale): BlogRssItem[] {
            return localeEntries(locale).map((entry) => ({
                content: entry.html,
                createdAt: entry.createdAt,
                description: entry.description,
                path: entry.path,
                tags: entry.tags ?? [],
                title: entry.title,
                updatedAt: entry.updatedAt,
            }))
        },

        // The addresses of the blog for the sitemap: the lists, then every page, in each language.
        sitemapUrls(): BlogSitemapUrl[] {
            const rootDates = (locale: BlogLocale, folder: string): Date => {
                const newest = localeEntries(locale)
                    .filter((entry) => folder === 'blog' || entry.section === folder)
                    .at(0)
                return newest?.updatedAt ?? new Date(0)
            }

            const lists = [['blog'], ['blog', 'articles'], ['blog', 'projects']]
            return [
                ...lists.flatMap((path) =>
                    blogLocales.map((locale) => ({
                        locale,
                        path,
                        updatedAt: rootDates(locale, path[1] ?? 'blog'),
                    })),
                ),
                ...blogLocales.flatMap((locale) =>
                    localeEntries(locale).map((entry) => ({
                        locale,
                        path: entry.path,
                        updatedAt: entry.updatedAt,
                    })),
                ),
            ]
        },
    }
}

export type BlogCatalog = ReturnType<typeof createBlogCatalog>
