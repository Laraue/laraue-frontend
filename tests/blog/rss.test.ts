import { assert, test } from 'vitest'

import { buildRssFeed } from '../../server/utils/blogRss'

const item = {
    content: '<p>Fish & <b>chips</b></p>',
    createdAt: new Date(Date.UTC(2026, 9, 2, 10, 31)),
    description: 'Fish "and" chips',
    path: ['blog', 'articles', 'fish'],
    tags: ['food', 'uk'],
    title: 'Fish & chips',
    updatedAt: new Date(Date.UTC(2026, 9, 3, 8, 0)),
}

test('builds the feed of a language with the addresses of that language', () => {
    const xml = buildRssFeed('https://laraue.com/', 'ru', [item])

    assert.include(xml, '<language>ru</language>')
    assert.include(xml, '<link>https://laraue.com/ru/blog</link>')
    assert.include(xml, 'href="https://laraue.com/api/blog/rss?languageCode=ru"')
    assert.include(xml, '<guid isPermaLink="true">https://laraue.com/ru/blog/articles/fish</guid>')
    assert.include(xml, '<lastBuildDate>Sat, 03 Oct 2026 08:00:00 GMT</lastBuildDate>')
})

test('describes a page and escapes the texts', () => {
    const xml = buildRssFeed('https://laraue.com', 'en', [item])

    assert.include(xml, '<title>Fish &amp; chips</title>')
    assert.include(xml, '<description>Fish "and" chips</description>')
    assert.include(xml, '<category>food</category>')
    assert.include(xml, '<pubDate>Fri, 02 Oct 2026 10:31:00 GMT</pubDate>')
    assert.include(xml, '<a10:updated>2026-10-03T08:00:00Z</a10:updated>')
    assert.include(xml, '<a10:content type="text">&lt;p&gt;Fish &amp; &lt;b&gt;chips&lt;/b&gt;&lt;/p&gt;</a10:content>')
})

test('builds an empty feed', () => {
    assert.notInclude(buildRssFeed('https://laraue.com', 'en', []), '<item>')
})
