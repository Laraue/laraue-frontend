import { Resvg, initWasm } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm?module'
import opentype, { type Font } from 'opentype.js'
import satori from 'satori'

// The Open Graph preview of a blog page, in the colors and the font (Inter) of the site: the site
// name, the title (up to three lines) and as much of the description as is left. The lines are
// wrapped here (by words, to the width of the text) and drawn one by one.
const width = 1200
const height = 630

// The tokens of the site (app/assets/css/tokens.css).
const workspace = '#f8f8fa'
const background = '#f2f2f4'
const ink = '#242429'
const accent = '#3366d1'
const muted = '#6c6c76'
const border = '#dddde2'

const paddingX = 80
const stripHeight = 100
const bottomPadding = 60
const contentWidth = width - paddingX * 2

const siteNameSize = 24
const titleSize = 52
const titleLineHeight = titleSize * 1.2
const descriptionSize = 26
const descriptionLineHeight = descriptionSize * 1.5
const domainSize = 20

// Ascent and descent of the font (Inter) in em, to put a baseline where the layout needs it.
const ascent = 0.96875
const descent = 0.2412

// The site name and the domain are spaced out as the labels of the site are.
const labelSpacing = 0.12

const baselineOffset = (size: number, lineHeight: number): number =>
    (lineHeight - (ascent + descent) * size) / 2 + ascent * size

interface Renderer {
    fonts: { data: ArrayBuffer; name: string; style: 'normal'; weight: 400 | 700 | 800 }[]
    measure: Record<400 | 700 | 800, Font>
}

let ready: Promise<Renderer> | undefined

const toArrayBuffer = (raw: unknown): ArrayBuffer => {
    const bytes = raw instanceof Uint8Array ? raw : Buffer.from(raw as ArrayBuffer)
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

const load = () =>
    (ready ??= (async () => {
        const assets = useStorage('assets:server')
        const [regular, bold, extraBold] = await Promise.all([
            assets.getItemRaw('og-fonts:Inter_400Regular.ttf'),
            assets.getItemRaw('og-fonts:Inter_700Bold.ttf'),
            assets.getItemRaw('og-fonts:Inter_800ExtraBold.ttf'),
        ])
        await initWasm(resvgWasm)

        const regularData = toArrayBuffer(regular)
        const boldData = toArrayBuffer(bold)
        const extraBoldData = toArrayBuffer(extraBold)

        return {
            fonts: [
                { data: regularData, name: 'Inter', style: 'normal', weight: 400 },
                { data: boldData, name: 'Inter', style: 'normal', weight: 700 },
                { data: extraBoldData, name: 'Inter', style: 'normal', weight: 800 },
            ],
            measure: {
                400: opentype.parse(regularData),
                700: opentype.parse(boldData),
                800: opentype.parse(extraBoldData),
            },
        }
    })())

// The width of a text in the font: the advances of its glyphs, as it is measured without shaping.
const measureText = (font: Font, text: string, size: number): number =>
    [...text].reduce((sum, char) => sum + (font.charToGlyph(char).advanceWidth ?? 0) * (size / font.unitsPerEm), 0)

// Splits a text into at most `maxLines` lines by words; when something does not fit, the last
// line is cut to leave room for an ellipsis.
export const wrapText = (
    text: string,
    measure: (value: string) => number,
    maxWidth: number,
    maxLines: number,
): string[] => {
    const lines: string[] = []
    let current = ''

    for (const word of text.split(' ').filter(Boolean)) {
        if (lines.length >= maxLines) {
            break
        }

        const candidate = current === '' ? word : `${current} ${word}`
        if (measure(candidate) <= maxWidth) {
            current = candidate
        } else {
            if (current !== '') {
                lines.push(current)
            }
            current = word
        }
    }
    if (current !== '' && lines.length < maxLines) {
        lines.push(current)
    }

    if (lines.join(' ') !== text.trim() && lines.length > 0) {
        let last = lines[lines.length - 1] ?? ''
        while (last !== '' && measure(`${last}…`) > maxWidth) {
            last = last.includes(' ') ? last.slice(0, last.lastIndexOf(' ')).trimEnd() : last.slice(0, -1)
        }
        lines[lines.length - 1] = `${last}…`
    }

    return lines
}

type Node = { type: string; props: Record<string, unknown> }

const box = (style: Record<string, unknown>, children?: unknown): Node => ({
    props: { children, style: { display: 'flex', ...style } },
    type: 'div',
})

// A line of text whose baseline is at `baseline`.
const line = (
    content: string,
    style: { size: number; lineHeight: number; weight: number; color: string; letterSpacing?: number },
    position: { left: number; baseline: number },
): Node =>
    box(
        {
            color: style.color,
            fontSize: style.size,
            fontWeight: style.weight,
            left: position.left,
            ...(style.letterSpacing !== undefined && { letterSpacing: style.letterSpacing }),
            lineHeight: `${style.lineHeight}px`,
            position: 'absolute',
            top: position.baseline - baselineOffset(style.size, style.lineHeight),
            whiteSpace: 'nowrap',
        },
        content,
    )

const lines = (
    content: string[],
    style: { size: number; lineHeight: number; weight: number; color: string; letterSpacing?: number },
    firstBaseline: number,
): Node[] =>
    content.map((text, index) =>
        line(text, style, { baseline: firstBaseline + index * style.lineHeight, left: paddingX }),
    )

// Renders the PNG of a preview.
export const renderOgImage = async (options: {
    siteName: string
    title: string
    description: string
}): Promise<Uint8Array> => {
    const { fonts, measure } = await load()
    const heavy = (text: string, size: number) => measureText(measure[800], text, size)
    const bold = (text: string, size: number) => measureText(measure[700], text, size)
    const regular = (text: string, size: number) => measureText(measure[400], text, size)

    const titleLines = wrapText(options.title, (text) => heavy(text, titleSize), contentWidth, 3)
    const titleBaseline = 156 + titleSize
    const lastTitleBaseline = titleBaseline + Math.max(0, titleLines.length - 1) * titleLineHeight

    const descriptionTop = lastTitleBaseline + 28
    const descriptionLineCount = Math.max(
        1,
        Math.floor((height - bottomPadding - stripHeight - descriptionTop) / descriptionLineHeight),
    )
    const descriptionLines = wrapText(
        options.description,
        (text) => regular(text, descriptionSize),
        contentWidth,
        descriptionLineCount,
    )

    const siteName = options.siteName.toUpperCase()
    const domain = 'LARAUE.COM'

    const card = box({ background: workspace, height, position: 'relative', width }, [
        box({ background: background, height: stripHeight, left: 0, position: 'absolute', top: height - stripHeight, width }),
        box({ background: border, height: 1, left: 0, position: 'absolute', top: height - stripHeight - 0.5, width }),
        box({ background: accent, height, left: 0, position: 'absolute', top: 0, width: 5 }),
        line(siteName, { color: accent, letterSpacing: siteNameSize * labelSpacing, lineHeight: 30, size: siteNameSize, weight: 700 }, { baseline: 72 + siteNameSize, left: paddingX }),
        box({ background: border, height: 1.5, left: paddingX, position: 'absolute', top: 115.25, width: contentWidth }),
        ...lines(titleLines, { color: ink, letterSpacing: -0.5, lineHeight: titleLineHeight, size: titleSize, weight: 800 }, titleBaseline),
        ...lines(
            descriptionLines,
            { color: muted, lineHeight: descriptionLineHeight, size: descriptionSize, weight: 400 },
            descriptionTop + descriptionSize,
        ),
        line(
            domain,
            { color: accent, letterSpacing: domainSize * labelSpacing, lineHeight: 26, size: domainSize, weight: 700 },
            {
                baseline: height - bottomPadding + 10,
                left: width - paddingX - bold(domain, domainSize) - domain.length * domainSize * labelSpacing,
            },
        ),
    ])

    const svg = await satori(card as never, { fonts, height, width })

    return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()
}
