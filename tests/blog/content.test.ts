import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assert, test } from 'vitest'

import { blogLocales, createBlogCatalog } from '../../shared/blog/catalog'

const blogFolder = fileURLToPath(new URL('../../content/blog', import.meta.url))

const listFiles = (folder: string): string[] =>
    readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? listFiles(join(folder, entry.name)) : [join(folder, entry.name)],
    )

const files = Object.fromEntries(
    listFiles(blogFolder)
        .filter((path) => path.endsWith('.md'))
        .map((path) => [relative(blogFolder, path), readFileSync(path, 'utf8')]),
)

// The real blog, not fixtures: a broken file or link should fail the build. A file with a missing
// or wrong frontmatter field throws while the catalog is created.
const catalog = createBlogCatalog(files)

const pagesOf = (locale: string): string[] =>
    Object.keys(files)
        .filter((file) => file.startsWith(`${locale}/`))
        .map((file) => file.slice(locale.length + 1))
        .toSorted()

test('has every page in both languages', () => {
    assert.deepEqual(pagesOf('ru'), pagesOf('en'))
})

test('has the texts of the menu in both languages', () => {
    for (const locale of blogLocales) {
        assert.deepEqual(
            catalog.categories(locale).map(({ key, icon, title }) => [key, Boolean(icon), Boolean(title)]),
            [['blog', true, true], ['articles', true, true], ['projects', true, true]],
        )
    }
})

test('has no page that was updated before it was created', () => {
    const wrong = blogLocales.flatMap((locale) =>
        catalog
            .entries(locale)
            .filter((entry) => entry.updatedAt < entry.createdAt)
            .map((entry) => `${locale}/${entry.fileName}`),
    )

    assert.deepEqual(wrong, [])
})

test('links the projects that exist', () => {
    const broken: string[] = []
    for (const locale of blogLocales) {
        const names = new Set(catalog.entries(locale).map((entry) => `${entry.section}/${entry.fileName}`))
        for (const entry of catalog.entries(locale)) {
            for (const project of entry.projects ?? []) {
                if (!names.has(`projects/${project}`)) {
                    broken.push(`${locale}/${entry.fileName}: project ${project}`)
                }
            }
        }
    }

    assert.deepEqual(broken, [])
})

test('keeps the same related projects in both languages', () => {
    const summary = (locale: 'en' | 'ru') =>
        catalog.entries(locale).map((entry) => ({
            fileName: entry.fileName,
            projects: entry.projects,
        })).toSorted((a, b) => a.fileName.localeCompare(b.fileName))

    assert.deepEqual(summary('ru'), summary('en'))
})

// A link inside the text: relative to the page, or with the address of the site.
const blogLinks = (locale: string, section: string, fileName: string, raw: string): string[] => {
    const base = `https://laraue.com/${locale === 'ru' ? 'ru/' : ''}blog/${section}/${fileName}`
    return [...raw.matchAll(/\]\(([^)\s]+)[^)]*\)/g)]
        .map((match) => match[1] ?? '')
        .filter((href) => !/^(mailto:|tel:|#)/.test(href))
        .map((href) => new URL(href, base))
        .filter((url) => url.hostname === 'laraue.com' && /^\/(ru\/)?blog(\/|$)/.test(url.pathname))
        .map((url) => url.pathname.replace(/\/$/, ''))
}

test('links only to pages of the blog that exist', () => {
    const addresses = new Set(
        catalog.sitemapUrls().map(({ locale, path }) => `${locale === 'ru' ? '/ru' : ''}/${path.join('/')}`),
    )
    const broken: string[] = []
    for (const [file, raw] of Object.entries(files)) {
        const [locale = '', section = '', name = ''] = file.replace(/\.md$/, '').split('/')
        if (name === '') {
            continue
        }
        for (const link of blogLinks(locale, section, name, raw)) {
            if (!addresses.has(link)) {
                broken.push(`${file}: ${link}`)
            }
        }
    }

    assert.deepEqual(broken, [])
})

test('links each page to the blog of its own language', () => {
    const foreign: string[] = []
    for (const [file, raw] of Object.entries(files)) {
        const [locale = '', section = '', name = ''] = file.replace(/\.md$/, '').split('/')
        if (name === '') {
            continue
        }
        for (const link of blogLinks(locale, section, name, raw)) {
            if (link.startsWith('/ru/') !== (locale === 'ru') && link !== '/blog') {
                foreign.push(`${file}: ${link}`)
            }
        }
    }

    assert.deepEqual(foreign, [])
})

test('numbers the parts of a series without gaps and in both languages', () => {
    const wrong: string[] = []
    const summary = (locale: 'en' | 'ru') =>
        catalog
            .entries(locale)
            .filter((entry) => entry.series)
            .map((entry) => `${entry.fileName}:${entry.part}`)
            .toSorted()

    for (const locale of blogLocales) {
        const parts = catalog.entries(locale).filter((entry) => entry.series).map((entry) => entry.part ?? 0).toSorted((a, b) => a - b)
        parts.forEach((part, index) => {
            if (part !== index + 1) {
                wrong.push(`${locale}: part ${part} at position ${index + 1}`)
            }
        })
    }

    assert.deepEqual(wrong, [])
    assert.deepEqual(summary('ru'), summary('en'))
})

test('gives every heading its own anchor', () => {
    const duplicated = blogLocales.flatMap((locale) =>
        catalog.entries(locale).flatMap((entry) => {
            const links = entry.innerLinks.map((link) => link.link)
            return links.length === new Set(links).size ? [] : [`${locale}/${entry.fileName}`]
        }),
    )

    assert.deepEqual(duplicated, [])
})

test('has titles and descriptions short enough for the search results', () => {
    const long = blogLocales.flatMap((locale) =>
        catalog.entries(locale).flatMap((entry) => [
            ...((entry.seoTitle ?? entry.title).length > 60 ? [`${locale}/${entry.fileName}: title`] : []),
            ...((entry.seoDescription ?? entry.description).length > 160 ? [`${locale}/${entry.fileName}: description`] : []),
        ]),
    )

    assert.deepEqual(long, [])
})

test('uses the same few tags in both languages, each on more than one page', () => {
    const counts = (locale: 'en' | 'ru') => {
        const result = new Map<string, number>()
        for (const entry of catalog.entries(locale)) {
            for (const tag of entry.tags ?? []) {
                result.set(tag, (result.get(tag) ?? 0) + 1)
            }
        }
        return result
    }

    const english = counts('en')
    assert.deepEqual([...counts('ru').keys()].toSorted(), [...english.keys()].toSorted())
    assert.deepEqual([...english].filter(([, count]) => count < 2).map(([tag]) => tag), [])
    assert.isAtMost(english.size, 20)
})
