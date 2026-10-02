import { assert, test } from 'vitest'

import { renderMarkdown } from '../../shared/blog/renderMarkdown'

test('gives the second to fourth level headings an anchor and lists them', () => {
    const { html, innerLinks } = renderMarkdown('# Title\n\n## Why Use It?\n\n### Setup: step 1\n\n#### Deep\n\n##### Deeper')

    assert.include(html, '<h1>Title</h1>')
    assert.include(html, '<h2 id="why-use-it?">Why Use It?</h2>')
    assert.include(html, '<h3 id="setup:-step-1">Setup: step 1</h3>')
    assert.include(html, '<h5>Deeper</h5>')
    assert.deepEqual(innerLinks, [
        { level: 2, link: '#why-use-it?', title: 'Why Use It?' },
        { level: 3, link: '#setup:-step-1', title: 'Setup: step 1' },
        { level: 4, link: '#deep', title: 'Deep' },
    ])
})

test('keeps the anchors of the cyrillic headings', () => {
    assert.deepEqual(renderMarkdown('## Почему Ollama').innerLinks, [
        { level: 2, link: '#почему-ollama', title: 'Почему Ollama' },
    ])
})

test('makes the anchors of the same headings different', () => {
    const { innerLinks } = renderMarkdown('## Setup\n\ntext\n\n## Setup')

    assert.deepEqual(innerLinks.map((link) => link.link), ['#setup', '#setup-1'])
})

test('renders the text of a link in a heading and leaves the other formatting out of its anchor', () => {
    const { innerLinks } = renderMarkdown('## The [guide](/g) and `code`')

    assert.deepEqual(innerLinks, [{ level: 2, link: '#the-guide-and-', title: 'The guide and ' }])
})

test('renders bold as <b> and code blocks with the language as a class', () => {
    const { html } = renderMarkdown('**bold** and `x`\n\n```ts\nconst a = "<b>" && 1\n```')

    assert.include(html, '<b>bold</b>')
    assert.include(html, '<code>x</code>')
    assert.include(html, '<pre><code class="ts">const a = "&lt;b&gt;" &amp;&amp; 1</code></pre>')
})

test('renders a line of a quote as a line break and a new line of a text as a space', () => {
    assert.include(renderMarkdown('> one\n> two').html, 'one<br>two')
    assert.notInclude(renderMarkdown('one\ntwo').html, '<br>')
})

test('renders images with the title and the alternative text', () => {
    assert.include(
        renderMarkdown('![A "tree"](https://laraue.com/a.jpg "Step 1")').html,
        '<img src="https://laraue.com/a.jpg" title="Step 1" alt="A &quot;tree&quot;" />',
    )
})

test('renders tables and ordered lists', () => {
    const { html } = renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |\n\n3. three\n4. four')

    assert.include(html, '<table>')
    assert.include(html, '<th>a</th>')
    assert.include(html, '<ol start="3">')
})
