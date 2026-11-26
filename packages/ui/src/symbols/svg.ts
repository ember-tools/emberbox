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

/** The SVG element of the common 120 × 80 canvas around a symbol's content. */
export function canvas(children: SvgElement[]): SvgElement {
    return {
        tag: 'svg',
        attributes: {
            xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${SYMBOL_WIDTH} ${SYMBOL_HEIGHT}`,
            width: SYMBOL_WIDTH, height: SYMBOL_HEIGHT,
        },
        children,
    }
}
