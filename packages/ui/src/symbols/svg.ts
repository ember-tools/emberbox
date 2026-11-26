/**
 * The small SVG toolkit every symbol of the library is built with: a tree of elements that
 * `TacticalSymbol` renders as Vue nodes and `renderSvg` writes as escaped markup.
 */

/** One SVG element of a symbol, with its attributes and either child elements or text. */
export interface SvgElement {
    tag: string
    attributes: Record<string, string | number>
    children?: SvgElement[]
    text?: string
}

/** The attributes of an SVG element. */
export type Attributes = SvgElement['attributes']

/** The width of every symbol's canvas. */
export const SYMBOL_WIDTH = 120
/** The height of every symbol's canvas. */
export const SYMBOL_HEIGHT = 80

/** The default width of writing inside a symbol before it is squeezed. */
export const MAX_TEXT_WIDTH = 86

/** An SVG element without children. */
export function element(tag: string, attributes: Attributes): SvgElement {
    return {tag, attributes}
}

/** A group of elements. */
export function group(children: SvgElement[], attributes: Attributes = {}): SvgElement {
    return {tag: 'g', attributes, children}
}

/** Escapes text for use inside SVG or HTML markup. */
export function escapeSvg(text: string): string {
    return text.replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`)
}

/**
 * Writes a symbol tree as SVG markup, escaping every attribute value and text. Tag and attribute
 * names are written as they are, so the tree must be built by code, as the trees of this library are.
 */
export function renderSvg(node: SvgElement): string {
    const attributes = Object.entries(node.attributes)
        .map(([name, value]) => ` ${name}="${escapeSvg(String(value))}"`)
        .join('')
    const content = node.text !== undefined
        ? escapeSvg(node.text)
        : (node.children ?? []).map(renderSvg).join('')
    return content ? `<${node.tag}${attributes}>${content}</${node.tag}>` : `<${node.tag}${attributes}/>`
}

/** The type every piece of writing in a symbol is set in. */
export const SIGN_FONT: Attributes = {'font-weight': 700, 'font-family': 'Barlow Condensed, Barlow, sans-serif'}

/** Writing at a point, squeezed to `maxWidth` when it is long. */
export function label(text: string, x: number, y: number, colour: string, maxWidth = MAX_TEXT_WIDTH, size?: number): SvgElement {
    const fontSize = size ?? (text.length > 8 ? 17 : 22)
    const squeeze: Attributes = text.length * fontSize * 0.5 > maxWidth
        ? {textLength: maxWidth, lengthAdjust: 'spacingAndGlyphs'}
        : {}
    return {
        tag: 'text',
        attributes: {
            x, y, fill: colour, 'font-size': fontSize, ...SIGN_FONT, 'text-anchor': 'middle',
            'dominant-baseline': 'central', ...squeeze,
        },
        text,
    }
}

/** How far a canvas reaches beyond the common 120 × 80 area on each side, for writing around a sign. */
export interface Margins {
    left: number
    right: number
    top: number
    bottom: number
}

/**
 * The SVG element of the common 120 × 80 canvas around a symbol's content, widened by `margins`
 * where writing sits beside or below the sign; the sign itself keeps its place and size.
 */
export function canvas(children: SvgElement[], margins: Margins = {left: 0, right: 0, top: 0, bottom: 0}): SvgElement {
    const width = SYMBOL_WIDTH + margins.left + margins.right
    const height = SYMBOL_HEIGHT + margins.top + margins.bottom
    return {
        tag: 'svg',
        attributes: {
            xmlns: 'http://www.w3.org/2000/svg', viewBox: `${-margins.left} ${-margins.top} ${width} ${height}`,
            width, height,
        },
        children,
    }
}

/** Rounds a coordinate or factor to three decimals, to keep the markup short. */
export function round(value: number): number {
    return Math.round(value * 1000) / 1000
}

/**
 * One stroke, filled shape or piece of writing of a drawing on its own 100 × 60 box, as the
 * abilities of chapter 4 and the additional signs of chapter 5 are drawn; `colour` overrides the
 * drawing's colour for this part.
 */
export type BoxPart = (
    | {d: string, filled?: boolean, width?: number}
    | {circle: [number, number, number], filled?: boolean}
    | {text: string, x: number, y: number, size: number}
) & {colour?: string}

/** The stroke width of a drawing on its 100 × 60 box at its own size. */
export const BOX_STROKE = 2.5

/** One part of a box drawing; `width` is the stroke width in the box, so lines keep their weight however the box is scaled. */
export function boxPart(part: BoxPart, colour: string, width = BOX_STROKE): SvgElement {
    const ink = part.colour ?? colour
    const stroke = {stroke: ink, 'stroke-width': round(width), 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}
    if ('text' in part) {
        return {tag: 'text', attributes: {x: part.x, y: part.y, fill: ink, 'font-size': part.size, ...SIGN_FONT,
            'text-anchor': 'middle', 'dominant-baseline': 'central'}, text: part.text}
    }
    const fill = part.filled ? ink : 'none'
    if ('circle' in part) return element('circle', {cx: part.circle[0], cy: part.circle[1], r: part.circle[2], fill, ...stroke})
    return element('path', {d: part.d, fill, ...stroke, ...(part.width ? {'stroke-width': round(part.width * width / BOX_STROKE)} : {})})
}

/** The ink every sign is drawn in. */
export const BLACK = '#000000'
/** The white of filled forms and backdrops. */
export const WHITE = '#FFFFFF'
/** The red of hazards and damage (annex O, also the fire service colour). */
export const HAZARD_RED = '#FA321E'
/** The blue of measures and water (annex O). */
export const MEASURE_BLUE = '#3264FA'

/**
 * Where the stars of an administrative level (5.7) sit around their centre, 10 apart in a row; the
 * European Union (level 6) has six in a ring: one left, two above, two below, one right.
 */
export function starOffsets(level: number): [number, number][] {
    if (level === 6) return [[-14, 0], [-5, -5], [5, -5], [-5, 5], [5, 5], [14, 0]]
    return Array.from({length: level}, (_, index) => [(index - (level - 1) / 2) * 10, 0])
}

/** The path of a six-armed asterisk, the star of the administrative levels of 5.7. */
export function asterisk(x: number, y: number, r: number): string {
    const dx = round(r * 0.866)
    const dy = round(r / 2)
    return `M${x} ${y - r} V${y + r} M${round(x - dx)} ${round(y - dy)} L${round(x + dx)} ${round(y + dy)} M${round(x + dx)} ${round(y - dy)} L${round(x - dx)} ${round(y + dy)}`
}
