import type {
    BlogContentType,
    BlogLocale,
    ItemDetails,
    ItemListItem,
    NeighborCard,
    PaginationData,
    BlogSection,
    RelatedPage,
    Series,
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
    // A short name of a project (the title is a long headline).
    name: string | null;
    // A project: its source code, the language it is written in and the license.
    repository: string | null;
    language: string | null;
    license: string | null;
    // A series of articles: its name and the number of this article in it.
    series: string | null;
    part: number | null;
    // Shown on the home page of the site.
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
    tags: string[] | null;
    projects: string[] | null;
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

// `part: 3` of a series; a series and a part come together.
const seriesPart = (attributes: Record<string, string | string[]>, file: string): number | null => {
    const part = text(attributes, 'part')
    const series = text(attributes, 'series')
    if ((part === undefined) !== (series === undefined)) {
        throw new Error(`${file}: "series" and "part" must be set together`)
    }
    if (part === undefined) {
        return null
    }
    if (!/^[1-9]\d*$/.test(part)) {
        throw new Error(`${file}: "part" is not a number: ${part}`)
    }
    return Number(part)
}

// Tags that most pages have say nothing about what a page is about.
const commonTags = new Set(['devlog', 'open-source'])

const toRelated = (entry: { title: string; path: string[]; contentType: BlogContentType }): RelatedPage => ({
    contentType: entry.contentType,
    path: entry.path,
    title: entry.title,
})

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
    // The names of the series: `en/series/<key>.md` has the title of the series `key`.
    const seriesTitles = new Map<string, string>()

    for (const [file, raw] of Object.entries(files)) {
        const segments = file.split('/')
        const locale = segments[0]
        if (locale !== 'en' && locale !== 'ru') {
            throw new Error(`${file}: the first folder must be a language (en or ru)`)
        }

        const { attributes, body } = parseFrontmatter(raw)
        const name = (segments.at(-1) ?? '').replace(/\.md$/, '')

        // `en/series/architecture-first.md`: the title of a series that its articles name by the key.
        if (segments[1] === 'series' && segments.length === 3) {
            seriesTitles.set(`${locale}/${name}`, requireText(attributes, 'title', file))
            continue
        }

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
            featured: text(attributes, 'featured') === 'true',
            fileName: name,
            html,
            innerLinks,
            locale,
            name: text(attributes, 'name') ?? null,
            part: seriesPart(attributes, file),
            path: ['blog', section.folder, name],
            projects: list(attributes, 'projects'),
            repository: text(attributes, 'repository') ?? null,
            language: text(attributes, 'language') ?? null,
            license: text(attributes, 'license') ?? null,
            section: section.folder,
            series: text(attributes, 'series') ?? null,
            seoDescription: text(attributes, 'seoDescription') ?? null,
            seoTitle: text(attributes, 'seoTitle') ?? null,
            tags: list(attributes, 'tags'),
            title: requireText(attributes, 'title', file),
            updatedAt: requireDate(attributes, 'updatedAt', file),
        })
    }

    for (const entry of entries.values()) {
        if (entry.series && !seriesTitles.has(`${entry.locale}/${entry.series}`)) {
            throw new Error(`${entry.locale}/${entry.section}/${entry.fileName}.md: there is no series "${entry.series}" (${entry.locale}/series/${entry.series}.md)`)
        }
    }

    const localeEntries = (locale: BlogLocale): BlogEntry[] =>
        [...entries.values()].filter((entry) => entry.locale === locale).toSorted(byCreatedAtDesc)

    // The neighbor of a page: the previous or the next part of its series, in the order of reading.
    // The pages that are not in a series follow the order of the list, the newest first: the next
    // page is the older one (without the parts of the series), the previous one is the newer one,
    // and the oldest of them leads on to the first part of the series.
    const neighbor = (entry: BlogEntry, direction: 'previous' | 'next'): NeighborCard | undefined => {
        // The parts of a series are read from the first one, the other pages are listed the newest first.
        const pages = entry.series
            ? localeEntries(entry.locale)
                  .filter((other) => other.series === entry.series)
                  .toSorted((left, right) => (left.part ?? 0) - (right.part ?? 0))
            : localeEntries(entry.locale).filter((other) => other.section === entry.section && !other.series)
        const index = pages.findIndex((other) => other === entry)
        let target = pages[direction === 'previous' ? index - 1 : index + 1]

        if (!target && direction === 'next' && !entry.series) {
            target = localeEntries(entry.locale)
                .filter((other) => other.section === entry.section && other.part === 1)
                .toSorted((left, right) => (left.series ?? '').localeCompare(right.series ?? ''))
                .at(0)
        }

        return target ? { path: target.path, title: target.title } : undefined
    }

    // The articles of the series of a page, in the order of the parts.
    const seriesOf = (entry: BlogEntry): Series | undefined => {
        if (!entry.series) {
            return undefined
        }

        return {
            parts: localeEntries(entry.locale)
                .filter((other) => other.series === entry.series)
                .toSorted((left, right) => (left.part ?? 0) - (right.part ?? 0))
                .map((other) => ({
                    current: other === entry,
                    part: other.part ?? 0,
                    path: other.path,
                    title: other.title,
                })),
            title: seriesTitles.get(`${entry.locale}/${entry.series}`) ?? entry.series,
        }
    }

    return {
        entries: (locale: BlogLocale): BlogEntry[] => localeEntries(locale),

        // A page of the list of articles and projects, newest first.
        list(
            locale: BlogLocale,
            options: { contentTypes: BlogContentType[]; tag?: string; featured?: boolean; page: number; perPage: number },
        ): PaginationData<ItemListItem> {
            const matching = localeEntries(locale).filter(
                (entry) =>
                    options.contentTypes.includes(entry.contentType) &&
                    (!options.featured || entry.featured) &&
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

            const previousLink = neighbor(entry, 'previous')
            const nextLink = neighbor(entry, 'next')
            const series = seriesOf(entry)
            const inSeries = new Set(series?.parts.map((part) => part.path.join('/')))
            const projectArticles =
                entry.section === 'projects'
                    ? localeEntries(entry.locale)
                          .filter((other) => other.section === 'articles' && (other.projects ?? []).includes(entry.fileName))
                          .map(toRelated)
                    : []
            const excluded = new Set([entry.path.join('/'), ...inSeries, ...projectArticles.map((page) => page.path.join('/'))])
            // A tag that few pages have says more about what a page is about than a tag of many pages.
            const tagUse = new Map<string, number>()
            for (const other of localeEntries(entry.locale)) {
                for (const tag of other.tags ?? []) {
                    tagUse.set(tag, (tagUse.get(tag) ?? 0) + 1)
                }
            }
            const relatedPages = localeEntries(entry.locale)
                .filter((other) => !excluded.has(other.path.join('/')))
                .map((other) => ({
                    other,
                    score: (other.tags ?? [])
                        .filter((tag) => !commonTags.has(tag) && (entry.tags ?? []).includes(tag))
                        .reduce((sum, tag) => sum + 1 / (tagUse.get(tag) ?? 1), 0),
                }))
                .filter(({ score }) => score > 0)
                // The same score: the newer page first (the list is the newest first already).
                .toSorted((left, right) => right.score - left.score)
                .slice(0, 3)
                .map(({ other }) => toRelated(other))

            return {
                content: entry.html,
                contentType: entry.contentType,
                createdAtIso: toLocalIso(entry.createdAt),
                description: entry.description,
                innerLinks: entry.innerLinks,
                length: entry.html.length,
                projects: entry.projects,
                projectArticles,
                relatedPages,
                relatedProjects: (entry.projects ?? []).flatMap((name) => {
                    const project = entries.get(entryKey(entry.locale, 'projects', name))
                    return project ? [{ path: project.path, title: project.name ?? project.title }] : []
                }),
                seoDescription: entry.seoDescription ?? entry.description,
                seoTitle: entry.seoTitle ?? entry.title,
                tags: entry.tags,
                title: entry.title,
                updatedAtIso: toLocalIso(entry.updatedAt),
                ...(entry.repository && { repository: entry.repository }),
                ...(entry.language && { language: entry.language }),
                ...(entry.license && { license: entry.license }),
                ...(series && { series }),
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
