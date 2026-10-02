export type Frontmatter = Record<string, string | string[]>

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

const parseValue = (value: string): string | string[] => {
    if (value.startsWith('[') && value.endsWith(']')) {
        return value
            .slice(1, -1)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
    }

    return value
}

// The frontmatter of the blog files is flat: `key: value` lines, where a value is text or `[a, b]`.
export const parseFrontmatter = (raw: string): { attributes: Frontmatter; body: string } => {
    const text = raw.replace(/^﻿/, '')
    const match = frontmatterPattern.exec(text)
    if (!match) {
        return { attributes: {}, body: text }
    }

    const attributes: Frontmatter = {}
    for (const line of (match[1] ?? '').split(/\r?\n/)) {
        const separator = line.indexOf(':')
        if (separator > 0) {
            attributes[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1).trim())
        }
    }

    return { attributes, body: text.slice(match[0].length) }
}
