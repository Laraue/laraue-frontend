import { assert, test } from 'vitest'

import { createBlogCatalog } from '../../shared/blog/catalog'
import { buildBlogMarkdownCopy, buildLlmsTxt, parseBlogMarkdownPath } from '../../server/utils/blogLlms'

const site = 'https://example.com'

const page = (type: string, title: string, createdAt: string, extra = '', body = 'Body.') =>
    `---\ntitle: ${title}\ntype: ${type}\ndescription: About ${title}\ncreatedAt: ${createdAt}\nupdatedAt: 2026-03-04 10:30\n${extra}---\n\n${body}\n`

const section = (title: string) =>
    `---\ntitle: ${title}\ntype: rootSectionDefinition\nseoDescription: About ${title}\nsubTitle: Sub\ncreatedAt: 2025-08-01\nupdatedAt: 2025-08-01\n---\n`

const body = [
    '## Links',
    'See [the next part](second-part), [the crawler](../projects/crawler#history), [a section](#links),',
    '[Boards](https://boards.laraue.com) and [the tools](/markdown-translator).',
    '![Video: a demo](https://youtu.be/6s0JcGa7ylU)',
    '![A board](https://laraue.com/board.jpg)',
    '```csharp',
    'var x = list[0](y);',
    'var link = "[not a link](other-article)";',
    '```',
].join('\n')

const catalog = createBlogCatalog({
    'en/index.md': section('All'),
    'en/articles/index.md': section('Articles'),
    'en/projects/index.md': section('Projects'),
    'en/series/arch.md': '---\ntitle: Architecture First\ntype: series\n---\n',
    'en/articles/first-part.md': page('article', 'First part', '2026-01-01', 'series: arch\npart: 1\n', body),
    'en/articles/second-part.md': page('article', 'Second part', '2026-02-01', 'series: arch\npart: 2\n'),
    'en/articles/old.md': page('article', 'Old', '2025-01-01'),
    'en/articles/new.md': page('article', 'New', '2026-05-01'),
    'en/projects/crawler.md': page('project', 'A crawler for everything', '2025-06-01', 'name: Crawler\nrepository: https://github.com/x/crawler\n'),
    'ru/index.md': section('Все'),
    'ru/articles/index.md': section('Статьи'),
    'ru/projects/index.md': section('Проекты'),
    'ru/articles/new.md': page('article', 'Новая', '2026-05-01'),
})

const firstPart = catalog.entry('en', 'articles', 'first-part')!

test('reads a markdown copy address back to its page', () => {
    assert.deepEqual(parseBlogMarkdownPath('/blog/articles/first-part.md'), { fileName: 'first-part', locale: 'en', section: 'articles' })
    assert.deepEqual(parseBlogMarkdownPath('/ru/blog/projects/crawler.md'), { fileName: 'crawler', locale: 'ru', section: 'projects' })
})

test('leaves addresses that are not markdown copies of blog pages', () => {
    assert.isUndefined(parseBlogMarkdownPath('/blog/articles/first-part'))
    assert.isUndefined(parseBlogMarkdownPath('/blog/series/arch.md'))
    assert.isUndefined(parseBlogMarkdownPath('/blog-content/articles/first-part.md'))
    assert.isUndefined(parseBlogMarkdownPath('/de/blog/articles/first-part.md'))
})

test('starts the copy with the title, the description and where and when it was published', () => {
    const copy = buildBlogMarkdownCopy(site, firstPart, 'Architecture First')

    assert.isTrue(copy.startsWith([
        '# First part',
        '',
        '> About First part',
        '',
        `- Source: ${site}/blog/articles/first-part`,
        '- Published: 2026-01-01, updated: 2026-03-04',
        '- Series: Architecture First, part 1',
        '',
        '## Links',
    ].join('\n')))
    assert.notInclude(copy, 'createdAt')
})

test('names the repository of a project', () => {
    const copy = buildBlogMarkdownCopy(site, catalog.entry('en', 'projects', 'crawler')!, undefined)

    assert.include(copy, '- Repository: https://github.com/x/crawler\n')
})

test('makes the links of the copy work outside the site', () => {
    const copy = buildBlogMarkdownCopy(site, firstPart, undefined)

    assert.include(copy, `[the next part](${site}/blog/articles/second-part.md)`)
    assert.include(copy, `[the crawler](${site}/blog/projects/crawler.md#history)`)
    assert.include(copy, '[a section](#links)')
    assert.include(copy, '[Boards](https://boards.laraue.com)')
    assert.include(copy, `[the tools](${site}/markdown-translator)`)
    assert.include(copy, '[Video: a demo](https://youtu.be/6s0JcGa7ylU)')
    assert.include(copy, '![A board](https://laraue.com/board.jpg)')
})

test('leaves the code blocks as they are', () => {
    const copy = buildBlogMarkdownCopy(site, firstPart, undefined)

    assert.include(copy, 'var x = list[0](y);')
    assert.include(copy, 'var link = "[not a link](other-article)";')
})

test('keeps the links of a Russian page in Russian', () => {
    const copy = buildBlogMarkdownCopy(site, { ...firstPart, locale: 'ru' }, undefined)

    assert.include(copy, `- Source: ${site}/ru/blog/articles/first-part`)
    assert.include(copy, `[the next part](${site}/ru/blog/articles/second-part.md)`)
})

test('lists the tools, the projects, each series in order and the other articles newest first', () => {
    const llms = buildLlmsTxt(site, catalog.entries('en'), (key) => catalog.seriesTitle('en', key))

    assert.isTrue(llms.startsWith('# Laraue\n\n> '))
    assert.include(llms, `## Tools\n- [Laraue Boards](https://boards.laraue.com)`)
    assert.include(llms, `- [Vocabulary Bot](${site}/learn-language-bot)`)
    assert.include(llms, `## Projects\n- [Crawler](${site}/blog/projects/crawler.md): About A crawler for everything\n`)
    assert.include(llms, [
        '## Series: Architecture First',
        `- [Part 1: First part](${site}/blog/articles/first-part.md): About First part`,
        `- [Part 2: Second part](${site}/blog/articles/second-part.md): About Second part`,
    ].join('\n'))
    assert.include(llms, [
        '## Articles',
        `- [New](${site}/blog/articles/new.md): About New`,
        `- [Old](${site}/blog/articles/old.md): About Old`,
    ].join('\n'))
    assert.include(llms, `## Optional\n- [Блог на русском](${site}/ru/blog)`)
    assert.notInclude(llms, 'Новая')
})

test('has no entry for an unknown page', () => {
    assert.isUndefined(catalog.entry('en', 'articles', 'missing'))
    assert.isUndefined(catalog.entry('ru', 'articles', 'first-part'))
})
