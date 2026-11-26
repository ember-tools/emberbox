/**
 * The marking of dangerous goods after ADR 2025: the danger labels of 5.2.2.2.2, the
 * environmentally hazardous substance mark of 5.2.1.8.3 and the orange-coloured plate of 5.3.2.2.
 * The pictograms follow the descriptions and proportions of the ADR without copying its artwork.
 *
 * A label is drawn on its own 100 × 100 canvas spanning the diagonal of the square on its point, so
 * the 100 mm side of 5.2.2.2.1.1.2 is about 71 units and one unit about 1.4 mm. The line runs 5
 * units inside the corners, about 5 mm inside the edge; the symbol sits in the upper half inside
 * that line and the class in the lower corner. The ADR names no colour values; the label colours
 * are the usual print tones, and the orange of the plate lies inside the chromaticity range of the
 * note to 5.3.2.2.1. Where the ADR allows a black or a white symbol, the black one is drawn.
 * The pages of the ADR excerpt the patterns are printed on are given, to check the drawings.
 */

import {BLACK, WHITE, element, group, label, renderSvg, round, type SvgElement} from './svg'

const LABEL_RED = '#E30613'
const LABEL_GREEN = '#009A44'
const LABEL_BLUE = '#0079C1'
const LABEL_YELLOW = '#FFD500'
const LABEL_ORANGE = '#F39200'
const PLATE_ORANGE = '#FF7F00'

/** The pictogram in the upper half of a label (and the batteries of 9A in the lower half). */
type LabelSymbol = 'bomb' | 'division' | 'flame' | 'cylinder' | 'skull' | 'flame-over-circle' | 'biohazard' | 'trefoil'
    | 'fissile' | 'corrosion' | 'batteries'

/**
 * How the background of a label is laid out: one colour, two halves, seven red stripes over the
 * whole label (4.1) or seven black ones in its upper half (9, 9A), or a white label whose upper or
 * lower half is coloured inside a white rim (7B, 7C, 8).
 */
type LabelGround =
    | {plain: string}
    | {upper: string, lower: string}
    | {stripes: string}
    | {upperStripes: string}
    | {rimmedUpper: string}
    | {rimmedLower: string}

/** The pattern numbers of 5.2.2.2.2 in the order of the ADR; iterate these, since a record puts whole-number keys first. */
export const DANGER_LABEL_PATTERNS = [
    '1', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2', '7A', '7B', '7C', '7E', '8', '9', '9A',
] as const

/** A danger label pattern number. */
export type DangerLabelPattern = typeof DANGER_LABEL_PATTERNS[number]

/** A danger label pattern of 5.2.2.2.2. */
export interface DangerLabel {
    pattern: DangerLabelPattern
    /** The class the label stands for. */
    hazardClass: string
    /** The meaning after the ADR, in German. */
    name: string
    /** The page of the ADR 2025 excerpt of chapter 5.2 the pattern is printed on. */
    page: string
    ground: LabelGround
    symbols: readonly LabelSymbol[]
    /** The figure in the lower corner. */
    figure: string
    /** The placeholders of class 1 for division and compatibility group. */
    placeholders?: string
    /** For class 7 categories I to III: "RADIOACTIVE" followed by this many red bars. */
    radioactiveBars?: number
    figureColour?: string
    underlined?: boolean
}

/** The danger label patterns of 5.2.2.2.2, keyed by their pattern number. */
export const DANGER_LABELS: Readonly<Record<DangerLabelPattern, DangerLabel>> = {
    '1': {pattern: '1', hazardClass: '1', name: 'Explosive Stoffe und Gegenstände mit Explosivstoff (Unterklassen 1.1, 1.2, 1.3)', page: '5.2-10',
        ground: {plain: LABEL_ORANGE}, symbols: ['bomb'], figure: '1', placeholders: '** *'},
    '1.4': {pattern: '1.4', hazardClass: '1', name: 'Explosive Stoffe und Gegenstände mit Explosivstoff (Unterklasse 1.4)', page: '5.2-10',
        ground: {plain: LABEL_ORANGE}, symbols: ['division'], figure: '1', placeholders: '*'},
    '1.5': {pattern: '1.5', hazardClass: '1', name: 'Explosive Stoffe und Gegenstände mit Explosivstoff (Unterklasse 1.5)', page: '5.2-10',
        ground: {plain: LABEL_ORANGE}, symbols: ['division'], figure: '1', placeholders: '*'},
    '1.6': {pattern: '1.6', hazardClass: '1', name: 'Explosive Stoffe und Gegenstände mit Explosivstoff (Unterklasse 1.6)', page: '5.2-10',
        ground: {plain: LABEL_ORANGE}, symbols: ['division'], figure: '1', placeholders: '*'},
    '2.1': {pattern: '2.1', hazardClass: '2', name: 'Entzündbare Gase', page: '5.2-11', ground: {plain: LABEL_RED}, symbols: ['flame'], figure: '2'},
    '2.2': {pattern: '2.2', hazardClass: '2', name: 'Nicht entzündbare, nicht giftige Gase', page: '5.2-11', ground: {plain: LABEL_GREEN},
        symbols: ['cylinder'], figure: '2'},
    '2.3': {pattern: '2.3', hazardClass: '2', name: 'Giftige Gase', page: '5.2-11', ground: {plain: WHITE}, symbols: ['skull'], figure: '2'},
    '3': {pattern: '3', hazardClass: '3', name: 'Entzündbare flüssige Stoffe', page: '5.2-11', ground: {plain: LABEL_RED}, symbols: ['flame'], figure: '3'},
    '4.1': {pattern: '4.1', hazardClass: '4.1',
        name: 'Entzündbare feste Stoffe, selbstzersetzliche Stoffe, polymerisierende Stoffe und desensibilisierte explosive feste Stoffe',
        page: '5.2-12', ground: {stripes: LABEL_RED}, symbols: ['flame'], figure: '4'},
    '4.2': {pattern: '4.2', hazardClass: '4.2', name: 'Selbstentzündliche Stoffe', page: '5.2-12', ground: {upper: WHITE, lower: LABEL_RED},
        symbols: ['flame'], figure: '4'},
    '4.3': {pattern: '4.3', hazardClass: '4.3', name: 'Stoffe, die in Berührung mit Wasser entzündbare Gase entwickeln', page: '5.2-12',
        ground: {plain: LABEL_BLUE}, symbols: ['flame'], figure: '4'},
    '5.1': {pattern: '5.1', hazardClass: '5.1', name: 'Entzündend (oxidierend) wirkende Stoffe', page: '5.2-13', ground: {plain: LABEL_YELLOW},
        symbols: ['flame-over-circle'], figure: '5.1'},
    '5.2': {pattern: '5.2', hazardClass: '5.2', name: 'Organische Peroxide', page: '5.2-13', ground: {upper: LABEL_RED, lower: LABEL_YELLOW},
        symbols: ['flame'], figure: '5.2'},
    '6.1': {pattern: '6.1', hazardClass: '6.1', name: 'Giftige Stoffe', page: '5.2-13', ground: {plain: WHITE}, symbols: ['skull'], figure: '6'},
    '6.2': {pattern: '6.2', hazardClass: '6.2', name: 'Ansteckungsgefährliche Stoffe', page: '5.2-13', ground: {plain: WHITE}, symbols: ['biohazard'], figure: '6'},
    '7A': {pattern: '7A', hazardClass: '7', name: 'Radioaktive Stoffe, Kategorie I – WEISS', page: '5.2-14', ground: {plain: WHITE}, symbols: ['trefoil'],
        figure: '7', radioactiveBars: 1},
    '7B': {pattern: '7B', hazardClass: '7', name: 'Radioaktive Stoffe, Kategorie II – GELB', page: '5.2-14', ground: {rimmedUpper: LABEL_YELLOW},
        symbols: ['trefoil'], figure: '7', radioactiveBars: 2},
    '7C': {pattern: '7C', hazardClass: '7', name: 'Radioaktive Stoffe, Kategorie III – GELB', page: '5.2-14', ground: {rimmedUpper: LABEL_YELLOW},
        symbols: ['trefoil'], figure: '7', radioactiveBars: 3},
    '7E': {pattern: '7E', hazardClass: '7', name: 'Radioaktive Stoffe, spaltbar', page: '5.2-14', ground: {plain: WHITE}, symbols: ['fissile'], figure: '7'},
    '8': {pattern: '8', hazardClass: '8', name: 'Ätzende Stoffe', page: '5.2-15', ground: {rimmedLower: BLACK}, symbols: ['corrosion'], figure: '8',
        figureColour: WHITE},
    '9': {pattern: '9', hazardClass: '9', name: 'Verschiedene gefährliche Stoffe und Gegenstände', page: '5.2-15', ground: {upperStripes: BLACK},
        symbols: [], figure: '9', underlined: true},
    '9A': {pattern: '9A', hazardClass: '9', name: 'Verschiedene gefährliche Stoffe und Gegenstände (Lithiumbatterien)', page: '5.2-15',
        ground: {upperStripes: BLACK}, symbols: ['batteries'], figure: '9', underlined: true},
}

const DIAMOND = 'M50 0 L100 50 L50 100 L0 50 Z'
const UPPER_HALF = 'M0 50 L50 0 L100 50 Z'
const LOWER_HALF = 'M0 50 L50 100 L100 50 Z'
/** How far the line runs inside the corners. */
const INSET = 5

/** How far the label reaches above and below its middle line at `x`. */
function halfHeight(x: number): number {
    return 50 - Math.abs(x - 50)
}

/** A vertical stripe from `x0` to `x1` cut to the label, through the lower half too when `lowerToo`, else down to the middle line. */
function stripe(x0: number, x1: number, lowerToo: boolean): string {
    const apex = x0 < 50 && x1 > 50
    const top = [[x0, 50 - halfHeight(x0)], ...(apex ? [[50, 0]] : []), [x1, 50 - halfHeight(x1)]]
    const bottom = lowerToo
        ? [[x1, 50 + halfHeight(x1)], ...(apex ? [[50, 100]] : []), [x0, 50 + halfHeight(x0)]]
        : [[x1, 50], [x0, 50]]
    return `M${[...top, ...bottom].map(([x, y]) => `${round(x!)} ${round(y!)}`).join(' L')} Z`
}

/** Seven stripes across the label. */
function stripes(colour: string, lowerToo: boolean): SvgElement {
    const width = 100 / 15
    const d = Array.from({length: 7}, (_, index) => stripe(width * (2 * index + 1), width * (2 * index + 2), lowerToo)).join(' ')
    return element('path', {d, fill: colour})
}

/** A circle as a path, for shapes cut with the even-odd rule. */
function circlePath(cx: number, cy: number, r: number): string {
    return `M${round(cx - r)} ${round(cy)} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`
}

const FLAME = 'M50 12 C57 19 61 25 59 32 C58 37 54 40 50 40 C45 40 41 36 42 31 C42 27 45 25 46 21 C48 24 50 25 51 22 C52 19 51 16 50 12 Z'

/** The three crescents of the biohazard sign around (50, 30), each a ring open to the outside. */
function biohazard(ink: string): SvgElement[] {
    const crescents = [-90, 30, 150].map(angle => {
        const a = angle * Math.PI / 180
        const at = (distance: number) => [50 + distance * Math.cos(a), 30 + distance * Math.sin(a)] as const
        const [ox, oy] = at(7)
        const [ix, iy] = at(9.5)
        return `${circlePath(ox, oy, 8)} ${circlePath(ix, iy, 6)}`
    })
    return [
        ...crescents.map(d => element('path', {d, fill: ink, 'fill-rule': 'evenodd'})),
        element('circle', {cx: 50, cy: 30, r: 5, fill: 'none', stroke: ink, 'stroke-width': 1.5}),
    ]
}

/** The pictogram of a label, inside the line around the label. */
function symbol(kind: LabelSymbol, ink: string): SvgElement[] {
    const fill = (d: string) => element('path', {d, fill: ink})
    const stroke = (d: string, width = 2.5) => element('path', {d, fill: 'none', stroke: ink, 'stroke-width': width, 'stroke-linecap': 'round'})
    switch (kind) {
        case 'bomb': return [
            element('circle', {cx: 46, cy: 34, r: 8, fill: ink}),
            fill('M53 28 L55 19 L58 24 L60 18 L62 25 L66 24 L64 29 L70 32 L62 32 Z'),
            fill('M32 30 L35 28 L35 32 Z M38 21 L41 22 L39 24 Z M36 44 L39 43 L38 46 Z'),
        ]
        case 'division': return []
        case 'flame': return [fill(FLAME), stroke('M38 44 H62', 2)]
        case 'cylinder': return [fill('M36 42 L56 22 A4 4 0 0 1 61.7 27.7 L41.7 47.7 A4 4 0 0 1 36 42 Z'), stroke('M59 24 L62 21 M60 19 L64 23', 2)]
        case 'skull': return [
            fill('M42 26 A8 8 0 1 1 58 26 C58 30 56 31 55 32 V35 H45 V32 C44 31 42 30 42 26 Z'),
            element('circle', {cx: 47, cy: 26, r: 2, fill: WHITE}),
            element('circle', {cx: 53, cy: 26, r: 2, fill: WHITE}),
            stroke('M37 36 L63 46 M63 36 L37 46', 3),
        ]
        case 'flame-over-circle': return [fill('M50 10 C55 15 58 19 57 24 C56 28 53 30 50 30 C46 30 43 27 44 23 C44 20 46 18 47 15 C48 17 50 18 51 16 Z'),
            element('circle', {cx: 50, cy: 37, r: 6, fill: 'none', stroke: ink, 'stroke-width': 3}), stroke('M38 46 H62', 2)]
        case 'biohazard': return biohazard(ink)
        case 'trefoil': return [
            fill('M50 28 L56 17.6 A12 12 0 0 0 44 17.6 Z M50 28 L62 28 A12 12 0 0 1 56 38.4 Z M50 28 L44 38.4 A12 12 0 0 1 38 28 Z'),
            element('circle', {cx: 50, cy: 28, r: 2.5, fill: ink}),
        ]
        case 'fissile': return [
            label('FISSILE', 50, 32, ink, 30, 10),
            element('rect', {x: 34, y: 52, width: 32, height: 14, fill: 'none', stroke: ink, 'stroke-width': 1}),
            label('CRITICALITY SAFETY INDEX', 50, 56, ink, 29, 3.5),
        ]
        case 'corrosion': return [
            fill('M40 17 L44 15 L49 25 L45 27 Z M56 15 L60 17 L55 27 L51 25 Z'),
            stroke('M45 30 V32 M55 30 V32 M45 35 V36 M55 35 V36', 1.5),
            fill('M34 40 H47 V45 H34 Z'),
            stroke('M35 40 V35 M38 40 V34 M41 40 V34 M44 40 V35 M47 42 L50 39', 1.8),
            fill('M53 39 H57 Q59.5 43 62 39 H66 V45 H53 Z'),
        ]
        case 'batteries': return [
            element('rect', {x: 38, y: 56, width: 7, height: 12, fill: ink}),
            element('rect', {x: 47, y: 56, width: 7, height: 12, fill: ink}),
            element('rect', {x: 40, y: 54, width: 3, height: 2, fill: ink}),
            element('rect', {x: 49, y: 54, width: 3, height: 2, fill: ink}),
            fill('M57 68 L60 58 L64 62 L63 54 L67 60 L66 68 Z'),
        ]
    }
}

/** The ground of a label: its fill, halves or stripes. */
function ground(layout: LabelGround): SvgElement[] {
    if ('plain' in layout) return [element('path', {d: DIAMOND, fill: layout.plain})]
    if ('upper' in layout) return [element('path', {d: UPPER_HALF, fill: layout.upper}), element('path', {d: LOWER_HALF, fill: layout.lower})]
    if ('stripes' in layout) return [element('path', {d: DIAMOND, fill: WHITE}), stripes(layout.stripes, true)]
    if ('upperStripes' in layout) return [element('path', {d: DIAMOND, fill: WHITE}), stripes(layout.upperStripes, false)]
    const rim = 'rimmedUpper' in layout
        ? {d: `M${INSET} 50 L50 ${INSET} L${100 - INSET} 50 Z`, fill: layout.rimmedUpper}
        : {d: `M${INSET} 50 L50 ${100 - INSET} L${100 - INSET} 50 Z`, fill: layout.rimmedLower}
    return [element('path', {d: DIAMOND, fill: WHITE}), element('path', rim)]
}

/** The line about 5 mm inside the edge. */
function innerLine(): SvgElement {
    return element('path', {d: `M50 ${INSET} L${100 - INSET} 50 L50 ${100 - INSET} L${INSET} 50 Z`, fill: 'none', stroke: BLACK, 'stroke-width': 1.5,
        'stroke-linejoin': 'round'})
}

/**
 * A danger label as an SVG tree on its 100 × 100 canvas: the ground and line, then the pictogram
 * and writing in a group of their own, then the class figure and a thin edge for white labels.
 */
export function dangerLabelTree(pattern: DangerLabelPattern): SvgElement {
    const sign = DANGER_LABELS[pattern]
    const marks: SvgElement[] = sign.symbols.flatMap(kind => symbol(kind, BLACK))
    if (sign.symbols.includes('division')) marks.push(label(sign.pattern, 50, 32, BLACK, 30, 20))
    if (sign.placeholders) marks.push(label(sign.placeholders, 50, 58, BLACK, 30, 9))
    if (sign.radioactiveBars) {
        marks.push(label('RADIOACTIVE', 44, 56, BLACK, 34, 6.5))
        for (let index = 0; index < sign.radioactiveBars; index++) {
            marks.push(element('rect', {x: 64 + index * 3, y: 52, width: 1.8, height: 8, fill: LABEL_RED}))
        }
    }
    const figure = label(sign.figure, 50, 76, sign.figureColour ?? BLACK, 16, 12)
    if (sign.underlined) figure.attributes['text-decoration'] = 'underline'
    return labelCanvas([
        ...ground(sign.ground), innerLine(), group(marks), figure,
        element('path', {d: DIAMOND, fill: 'none', stroke: '#808080', 'stroke-width': 0.5}),
    ])
}

/** A danger label as SVG markup. */
export function dangerLabel(pattern: DangerLabelPattern): string {
    return renderSvg(dangerLabelTree(pattern))
}

function labelCanvas(children: SvgElement[]): SvgElement {
    return {tag: 'svg', attributes: {xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 100 100', width: 100, height: 100}, children: [group(children)]}
}

/** The mark for environmentally hazardous substances of 5.2.1.8.3: a dead tree and a dead fish, black on a white diamond with a border of 2 mm. */
export function environmentMarkTree(): SvgElement {
    const stroke = {fill: 'none', stroke: BLACK, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}
    return labelCanvas([
        element('path', {d: 'M50 1.5 L98.5 50 L50 98.5 L1.5 50 Z', fill: WHITE, stroke: BLACK, 'stroke-width': 3}),
        element('path', {d: 'M40 58 V28 M40 40 L32 32 M40 34 L48 26 M40 46 L48 40 M32 32 L28 34 M48 26 L52 24', ...stroke}),
        element('path', {d: 'M22 58 H62', ...stroke}),
        element('path', {d: 'M48 70 Q58 62 70 68 Q58 76 48 70 Z M48 70 L42 65 V75 Z', fill: BLACK}),
        element('path', {d: 'M63 66 L66 69 M66 66 L63 69', stroke: WHITE, 'stroke-width': 1}),
    ])
}

/** The environment mark as SVG markup. */
export function environmentMark(): string {
    return renderSvg(environmentMarkTree())
}

/**
 * A hazard identification number of 5.3.2.3: two or three figures, the first 2 to 9, possibly led by
 * an X; for class 1 the classification code (5.3.2.3.1), such as "1.1D" or "1.4S".
 */
export const HAZARD_NUMBER = /^(X?[2-9][0-9]{1,2}|1\.[1-6][A-HJKLNS])$/

/** A UN number: four figures. */
export const UN_NUMBER = /^[0-9]{4}$/

/** What an orange-coloured plate carries: nothing, or the hazard identification number over the UN number. */
export interface WarningPanel {
    hazardNumber?: string
    unNumber?: string
}

/**
 * The orange-coloured plate of 5.3.2.2 on a canvas of 400 × 300 units, one per millimetre: a black
 * border of 15, and with numbers a dividing line of 15 across the middle, the hazard identification
 * number above it and the UN number below in figures 100 high. A plate without numbers has neither.
 * Both numbers are required together and must have the form of the ADR, so a learning card cannot
 * show an impossible plate; the reduced plate with a UN number only (packaged radioactive material
 * under exclusive use, 5.3.2.2.1) is left out on purpose.
 */
export function warningPanelTree(panel: WarningPanel = {}): SvgElement {
    const numbered = panel.hazardNumber !== undefined || panel.unNumber !== undefined
    if (numbered && !(panel.hazardNumber && HAZARD_NUMBER.test(panel.hazardNumber) && panel.unNumber && UN_NUMBER.test(panel.unNumber))) {
        throw new Error(`Not a hazard number over a UN number: ${panel.hazardNumber ?? '–'} / ${panel.unNumber ?? '–'}`)
    }
    const parts: SvgElement[] = [element('rect', {x: 7.5, y: 7.5, width: 385, height: 285, fill: PLATE_ORANGE, stroke: BLACK, 'stroke-width': 15})]
    if (numbered) {
        parts.push(
            element('path', {d: 'M7.5 150 H392.5', stroke: BLACK, 'stroke-width': 15}),
            label(panel.hazardNumber!, 200, 80, BLACK, 340, 136),
            label(panel.unNumber!, 200, 222, BLACK, 340, 136),
        )
    }
    return {tag: 'svg', attributes: {xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 400 300', width: 120, height: 90}, children: [group(parts)]}
}

/** The orange-coloured plate as SVG markup. */
export function warningPanel(panel: WarningPanel = {}): string {
    return renderSvg(warningPanelTree(panel))
}
