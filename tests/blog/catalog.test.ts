import { assert, test } from 'vitest'

import { createBlogCatalog, parseBlogDate, toLocalIso, toUtcIso } from '../../shared/blog/catalog'

const page = (type: string, extra: string, title = 'Page') =>
    `---\ntitle: ${title}\ntype: ${type}\ndescription: About ${title}\ncreatedAt: 2026-01-02\nupdatedAt: 2026-01-03 10:30\n${extra}---\n\n## Text\n\nBody of ${title}.\n`

const section = (title: string, icon: string) => `---\ntitle: ${title}\nicon: ${icon}\ntype: rootSectionDefinition\nseoTitle: ${title} page\nseoDescription: About ${title}\nsubTitle: Sub of ${title}\ncreatedAt: 2025-08-01\nupdatedAt: 2025-08-01\n---\n`

const files = {
    'en/index.md': section('All', 'A'),
    'en/articles/index.md': section('Articles', 'B'),
    'en/projects/index.md': section('Projects', 'C'),
    'ru/index.md': section('Все', 'A'),
    'ru/articles/index.md': section('Статьи', 'B'),
    'ru/projects/index.md': section('Проекты', 'C'),
    'en/articles/first.md': page('article', 'tags: [a, b]\nprojects: [tool]\n', 'First'),
    'en/articles/second.md': page('article', 'tags: [b]\n', 'Second').replace('2026-01-02', '2026-02-01'),
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

test('lists the featured pages', () => {
    const featured = createBlogCatalog({
        ...files,
        'en/articles/second.md': page('article', 'featured: true\n', 'Second').replace('2026-01-02', '2026-02-01'),
    })

    assert.deepEqual(
        featured.list('en', { contentTypes: ['article', 'project'], featured: true, page: 0, perPage: 16 }).data.map((item) => item.fileName),
        ['second'],
    )
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

test('describes a page with its neighbors, the pages that follow it in the list (the newest first)', () => {
    const first = catalog.detail('en', 'articles', 'first')
    const second = catalog.detail('en', 'articles', 'second')

    // `second` is newer: the next page of the list is the older one.
    assert.deepEqual(first?.previousLink, { path: ['blog', 'articles', 'second'], title: 'Second' })
    assert.isUndefined(first?.nextLink)
    assert.deepEqual(second?.nextLink, { path: ['blog', 'articles', 'first'], title: 'First' })
    assert.isUndefined(second?.previousLink)
    assert.deepEqual(first?.projects, ['tool'])
    assert.deepEqual(first?.relatedProjects, [{ path: ['blog', 'projects', 'tool'], title: 'Tool' }])
    assert.deepEqual(
        [first?.createdAtIso, first?.updatedAtIso],
        ['2026-01-02T00:00:00', '2026-01-03T10:30:00'],
    )
    assert.deepEqual(first?.innerLinks, [{ level: 2, link: '#text', title: 'Text' }])
    assert.include(first?.content, 'Body of First.')
})

test('takes the page created just before or after in the same section as a neighbor', () => {
    const tool = catalog.detail('en', 'projects', 'tool')
    assert.isUndefined(tool?.previousLink)
    assert.isUndefined(tool?.nextLink)

    const more = createBlogCatalog({
        ...files,
        'en/articles/third.md': page('article', '', 'Third').replace('2026-01-02', '2026-04-01'),
    })
    // `second` is not the newest any more.
    assert.deepEqual(more.detail('en', 'articles', 'second')?.previousLink, { path: ['blog', 'articles', 'third'], title: 'Third' })
    // The older one follows `third` in the list.
    assert.deepEqual(more.detail('en', 'articles', 'third')?.nextLink, { path: ['blog', 'articles', 'second'], title: 'Second' })
    assert.isUndefined(more.detail('en', 'articles', 'third')?.previousLink)
})

test('lists the parts of a series and marks the current one', () => {
    const series = '---\ntitle: The series\ntype: series\n---\n'
    const withSeries = createBlogCatalog({
        ...files,
        'en/series/the-series.md': series,
        'en/articles/first.md': page('article', 'series: the-series\npart: 1\n', 'First'),
        'en/articles/second.md': page('article', 'series: the-series\npart: 2\n', 'Second').replace('2026-01-02', '2026-02-01'),
    })

    assert.deepEqual(withSeries.detail('en', 'articles', 'second')?.series, {
        parts: [
            { current: false, part: 1, path: ['blog', 'articles', 'first'], title: 'First' },
            { current: true, part: 2, path: ['blog', 'articles', 'second'], title: 'Second' },
        ],
        title: 'The series',
    })
    // The neighbors of a part are the previous and the next part, not the pages created around it.
    const middle = createBlogCatalog({
        ...files,
        'en/series/the-series.md': series,
        'en/articles/first.md': page('article', 'series: the-series\npart: 1\n', 'First'),
        'en/articles/second.md': page('article', 'series: the-series\npart: 3\n', 'Second').replace('2026-01-02', '2026-02-01'),
        'en/articles/third.md': page('article', 'series: the-series\npart: 2\n', 'Third').replace('2026-01-02', '2026-04-01'),
    })
    assert.deepEqual(middle.detail('en', 'articles', 'third')?.previousLink?.title, 'First')
    assert.deepEqual(middle.detail('en', 'articles', 'third')?.nextLink?.title, 'Second')
    assert.isUndefined(middle.detail('en', 'articles', 'first')?.previousLink)
    assert.isUndefined(middle.detail('en', 'articles', 'second')?.nextLink)
    // A page that is not in the series has the other such pages as neighbors (the next one is the older
    // one), and the oldest of them leads on to the first part of the series.
    const mixed = createBlogCatalog({
        ...files,
        'en/series/the-series.md': series,
        'en/articles/first.md': page('article', 'series: the-series\npart: 1\n', 'First'),
        'en/articles/second.md': page('article', 'series: the-series\npart: 2\n', 'Second').replace('2026-01-02', '2026-02-01'),
        'en/articles/alone.md': page('article', '', 'Alone').replace('2026-01-02', '2026-03-01'),
        'en/articles/alone-too.md': page('article', '', 'Alone too').replace('2026-01-02', '2026-05-01'),
    })
    assert.equal(mixed.detail('en', 'articles', 'alone-too')?.nextLink?.title, 'Alone')
    assert.isUndefined(mixed.detail('en', 'articles', 'alone-too')?.previousLink)
    assert.equal(mixed.detail('en', 'articles', 'alone')?.nextLink?.title, 'First')
    assert.equal(mixed.detail('en', 'articles', 'alone')?.previousLink?.title, 'Alone too')
    assert.isUndefined(catalog.detail('en', 'articles', 'first')?.series)
    assert.throws(() => createBlogCatalog({ 'en/articles/x.md': page('article', 'series: S\n') }), /must be set together/)
    assert.throws(() => createBlogCatalog({ 'en/series/s.md': series, 'en/articles/x.md': page('article', 'series: s\npart: one\n') }), /"part" is not a number/)
    assert.throws(() => createBlogCatalog({ 'en/articles/x.md': page('article', 'series: missing\npart: 1\n') }), /there is no series "missing"/)
})

test('suggests pages with the same tags, and the articles of a project', () => {
    const more = createBlogCatalog({
        ...files,
        'en/articles/third.md': page('article', 'tags: [b, devlog]\n', 'Third').replace('2026-01-02', '2026-04-01'),
    })

    // `second` has the tag b: `first` and `third` share it, the common tag devlog counts for nothing.
    assert.deepEqual(more.detail('en', 'articles', 'second')?.relatedPages.map((page) => page.title), ['Third', 'First'])
    assert.isEmpty(more.detail('ru', 'articles', 'first')?.relatedPages ?? [])
    // The project is told about by the article that names it, and that article is not "related" again.
    assert.deepEqual(more.detail('en', 'projects', 'tool')?.projectArticles.map((page) => page.title), ['First'])
    assert.notInclude(more.detail('en', 'projects', 'tool')?.relatedPages.map((page) => page.title) ?? [], 'First')
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
    assert.deepEqual(catalog.tags('en'), [{ count: 2, key: 'a' }, { count: 2, key: 'b' }])
    assert.deepEqual(catalog.tags('ru'), [{ count: 1, key: 'а' }])
})

test('gives the texts of the page of a list', () => {
    assert.deepEqual(catalog.section('en', 'articles'), {
        seoDescription: 'About Articles', seoTitle: 'Articles page', subTitle: 'Sub of Articles', title: 'Articles',
    })
    assert.equal(catalog.section('ru', 'blog')?.title, 'Все')
    assert.isUndefined(catalog.section('en', 'notes'))
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
    assert.equal(toLocalIso(date!), '2026-06-26T15:00:00')
    assert.equal(toUtcIso(date!), '2026-06-26T15:00:00Z')
    assert.isUndefined(parseBlogDate('2026-02-30'))
    assert.isUndefined(parseBlogDate('June 26'))
})
