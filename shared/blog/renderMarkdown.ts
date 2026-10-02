import { Marked, type Token, type Tokens } from 'marked'

import type { InnerLink } from '../types/blog'

export interface RenderedMarkdown {
    html: string;
    innerLinks: InnerLink[];
}

const escapeHtml = (value: string): string =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')

// The text of a heading: plain text and the text of links, without the other formatting (code, bold).
const headingText = (tokens: Token[]): string =>
    tokens
        .map((token) => {
            if (token.type === 'text') {
                return (token as Tokens.Text).tokens
                    ? headingText((token as Tokens.Text).tokens ?? [])
                    : (token as Tokens.Text).text
            }
            if (token.type === 'link') {
                return headingText((token as Tokens.Link).tokens)
            }
            return ''
        })
        .join('')

// The anchor of a heading keeps the addresses of the published sections: lower case, spaces as
// dashes, every other character as it is.
const headingId = (text: string): string => text.toLowerCase().replaceAll(' ', '-')

// A line of a quote ends with a line break: every new line of its paragraphs becomes a `<br>`.
const breakQuoteLines = (tokens: Token[]): Token[] =>
    tokens.map((token) => {
        if (token.type !== 'paragraph') {
            return token
        }

        const paragraph = token as Tokens.Paragraph
        return {
            ...paragraph,
            tokens: paragraph.tokens.flatMap((inline): Token[] =>
                inline.type === 'text'
                    ? (inline as Tokens.Text).text.split('\n').flatMap((line, index): Token[] => [
                          ...(index > 0 ? [{ raw: '\n', type: 'br' } as Tokens.Br] : []),
                          { ...(inline as Tokens.Text), raw: line, text: line },
                      ])
                    : [inline],
            ),
        }
    })

// Renders the markdown of an article. Second to fourth level headings get an anchor and are
// returned as the inner links of the page ("on this page" list).
export const renderMarkdown = (body: string): RenderedMarkdown => {
    const innerLinks: InnerLink[] = []
    const usedIds = new Map<string, number>()

    const marked = new Marked({
        gfm: true,
        breaks: false,
        renderer: {
            heading({ depth, tokens }) {
                const content = this.parser.parseInline(tokens)
                if (depth < 2 || depth > 4) {
                    return `<h${depth}>${content}</h${depth}>\n`
                }

                const title = headingText(tokens)
                const baseId = headingId(title)
                const count = usedIds.get(baseId) ?? 0
                usedIds.set(baseId, count + 1)
                const id = count === 0 ? baseId : `${baseId}-${count}`
                innerLinks.push({ level: depth, link: `#${id}`, title })

                return `<h${depth} id="${escapeHtml(id)}">${content}</h${depth}>\n`
            },
            blockquote({ tokens }) {
                return `<blockquote>\n${this.parser.parse(breakQuoteLines(tokens))}</blockquote>\n`
            },
            code({ text, lang }) {
                const language = (lang ?? '').split(/\s+/)[0]
                const attribute = language ? ` class="${escapeHtml(language)}"` : ''

                return `<pre><code${attribute}>${escapeHtml(text).replaceAll('&quot;', '"')}</code></pre>\n`
            },
            strong({ tokens }) {
                return `<b>${this.parser.parseInline(tokens)}</b>`
            },
            image({ href, text, title }) {
                const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''

                return `<img src="${escapeHtml(href)}"${titleAttribute} alt="${escapeHtml(text)}" />`
            },
            link({ href, tokens }) {
                return `<a href="${escapeHtml(href)}">${this.parser.parseInline(tokens)}</a>`
            },
        },
    })

    return { html: marked.parse(body, { async: false }), innerLinks }
}
