import { assert, test } from 'vitest'

import { createBlogCatalog, formatBlogDate, parseBlogDate, toLocalIso, toUtcIso } from '../../shared/blog/catalog'

const page = (type: string, extra: string, title = 'Page') =>
    `---\ntitle: ${title}\ntype: ${type}\ndescription: About ${title}\ncreatedAt: 2026-01-02\nupdatedAt: 2026-01-03 10:30\n${extra}---\n\n## Text\n\nBody of ${title}.\n`

const section = (title: string, icon: string) => `---\ntitle: ${title}\nicon: ${icon}\ntype: rootSectionDefinition\ncreatedAt: 2025-08-01\nupdatedAt: 2025-08-01\n---\n`

const files = {
    'en/index.md': section('All', 'A'),
    'en/articles/index.md': section('Articles', 'B'),
    'en/projects/index.md': section('Projects', 'C'),
    'ru/index.md': section('Все', 'A'),
    'ru/articles/index.md': section('Статьи', 'B'),
    'ru/projects/index.md': section('Проекты', 'C'),
    'en/articles/first.md': page('article', 'tags: [a, b]\nprojects: [tool]\nnextLink: second\n', 'First'),
    'en/articles/second.md': page('article', 'tags: [b]\npreviousLink: first\nnextLink: missing\n', 'Second').replace('2026-01-02', '2026-02-01'),
    'en/projects/tool.md': page('project', 'tags: [a]\n', 'Tool').replace('2026-01-02', '2026-03-01'),
    'ru/articles/first.md': page('article', 'tags: [а]\n', 'Первая'),
}
const catalog = createBlogCatalog(files)

test('lists the newest pages first and paginates', () => {
    const feed = catalog.list('en', { contentTypes: ['article', 'project'], page: 0, perPage: 2 })

    assert.deepEqual(feed.data.map((item) => item.fileName), ['tool', 'second'])
    assert.deepEqual([feed.hasNextPage, feed.hasPreviousPage, feed.page, feed.perPage], [true, false, 0, 2])

    const next = catalog.list('en', { contentTypes: ['article', 'project'], page: 1, perPage: 2 })
    assert.deepEqual(next.data.map((item) => item.fileName), ['first'])
    assert.deepEqual([next.hasNextPage, next.hasPreviousPage], [false, true])
})

test('lists a section and filters by a tag', () => {
    assert.deepEqual(
        catalog.list('en', { contentTypes: ['article'], page: 0, perPage: 16 }).data.map((item) => item.fileName),
        ['second', 'first'],
    )
    assert.deepEqual(
        catalog.list('en', { contentTypes: ['article', 'project'], page: 0, perPage: 16, tag: 'a' }).data.map((item) => item.fileName),
        ['tool', 'first'],
    )
})

test('describes a card of the list', () => {
    const [item] = catalog.list('en', { contentTypes: ['project'], page: 0, perPage: 16 }).data

    assert.deepEqual(item, {
        contentType: 'project',
        description: 'About Tool',
        fileName: 'tool',
        length: item?.length,
        path: ['blog', 'projects', 'tool'],
        projects: null,
        tags: ['a'],
        title: 'Tool',
    })
    assert.isAbove(item?.length ?? 0, 0)
})

test('describes a page with its neighbors, dropping the ones that do not exist', () => {
    const first = catalog.detail('en', 'articles', 'first')
    const second = catalog.detail('en', 'articles', 'second')

    assert.deepEqual(first?.nextLink, { path: ['blog', 'articles', 'second'], title: 'Second' })
    assert.isUndefined(first?.previousLink)
    assert.deepEqual(second?.previousLink, { path: ['blog', 'articles', 'first'], title: 'First' })
    assert.isUndefined(second?.nextLink)
    assert.deepEqual(first?.projects, ['tool'])
    assert.deepEqual(
        [first?.createdAt, first?.updatedAt, first?.createdAtIso, first?.updatedAtIso],
        ['02 Jan 2026', '03 Jan 2026', '2026-01-02T00:00:00', '2026-01-03T10:30:00'],
    )
    assert.deepEqual(first?.innerLinks, [{ level: 2, link: '#text', title: 'Text' }])
    assert.include(first?.content, 'Body of First.')
})

test('does not find a page of another section or language', () => {
    assert.isUndefined(catalog.detail('en', 'projects', 'first'))
    assert.isUndefined(catalog.detail('ru', 'articles', 'second'))
    assert.isUndefined(catalog.detail('en', 'articles', 'missing'))
})

test('builds the menu and the tags of a language', () => {
    assert.deepEqual(catalog.categories('en'), [
        { count: 3, icon: 'A', key: 'blog', path: ['blog'], title: 'All' },
        { count: 2, icon: 'B', key: 'articles', path: ['blog', 'articles'], title: 'Articles' },
        { count: 1, icon: 'C', key: 'projects', path: ['blog', 'projects'], title: 'Projects' },
    ])
    assert.deepEqual(catalog.categories('ru').map((item) => [item.title, item.count]), [['Все', 1], ['Статьи', 1], ['Проекты', 0]])
    assert.deepEqual(catalog.tags('en'), [{ key: 'a' }, { key: 'b' }])
    assert.deepEqual(catalog.tags('ru'), [{ key: 'а' }])
})

test('gives the title and the description for a preview image', () => {
    assert.deepEqual(catalog.preview('en', 'articles', 'first'), { description: 'About First', title: 'First' })
    assert.isUndefined(catalog.preview('en', 'articles', 'missing'))
})

test('lists the addresses of the sitemap in both languages', () => {
    const urls = catalog.sitemapUrls().map(({ locale, path }) => `${locale}:${path.join('/')}`)

    assert.deepEqual(urls.slice(0, 6), [
        'en:blog', 'ru:blog', 'en:blog/articles', 'ru:blog/articles', 'en:blog/projects', 'ru:blog/projects',
    ])
    assert.sameMembers(urls.slice(6), [
        'en:blog/projects/tool', 'en:blog/articles/second', 'en:blog/articles/first', 'ru:blog/articles/first',
    ])
})

test('rejects a page without a required field, with a wrong type or in a wrong place', () => {
    assert.throws(() => createBlogCatalog({ 'en/articles/x.md': page('article', '').replace('description: About Page\n', '') }), /"description" is required/)
    assert.throws(() => createBlogCatalog({ 'en/articles/x.md': page('article', '').replace('2026-01-02', '2026-13-45') }), /"createdAt" is not a date/)
    assert.throws(() => createBlogCatalog({ 'en/articles/x.md': page('project', '') }), /"type" must be article/)
    assert.throws(() => createBlogCatalog({ 'en/notes/x.md': page('article', '') }), /must be in a folder of a section/)
    assert.throws(() => createBlogCatalog({ 'de/articles/x.md': page('article', '') }), /must be a language/)
})

test('reads and writes the dates as the wall clock time', () => {
    const date = parseBlogDate('2026-06-26 15:00')
    assert.isDefined(date)
    assert.equal(formatBlogDate(date!), '26 Jun 2026')
    assert.equal(toLocalIso(date!), '2026-06-26T15:00:00')
    assert.equal(toUtcIso(date!), '2026-06-26T15:00:00Z')
    assert.isUndefined(parseBlogDate('2026-02-30'))
    assert.isUndefined(parseBlogDate('June 26'))
})
