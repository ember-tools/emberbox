/**
 * Tactical symbols after the recommendations "Taktische Zeichen im Bevölkerungsschutz" of the BBK
 * (2024, for FwDV 102 / DV 102). The drawings follow the system of the recommendations (basic form,
 * size mark, writing) without copying their artwork.
 *
 * A symbol is built as a tree of SVG elements: `TacticalSymbol` renders the tree as Vue nodes in
 * the page, and `renderSvg` writes it as an escaped string for map icons. Every symbol is drawn on
 * the same 120 × 80 canvas: the size mark above, the basic form in the middle, wheels or keel
 * below. The fire service draws red with white writing; medical services draw red on white. Red
 * comes from the theme's signal palette, so a symbol has to be part of the page (not loaded as an
 * image) for it to apply.
 */

import {canvas, element, label, renderSvg, type Attributes, type SvgElement} from './svg'

export {SYMBOL_HEIGHT, SYMBOL_WIDTH, escapeSvg, renderSvg, type SvgElement} from './svg'

/** The organisation a unit belongs to, which sets its colours. */
export type Organisation = 'fire' | 'medical'

/**
 * The basic form of a unit's symbol. `squad` is not part of the recommendations: a compact,
 * rounded form that sets a dismounted squad apart from vehicles on a busy map.
 */
export type SymbolShape = 'vehicle' | 'container' | 'trailer' | 'boat' | 'unit' | 'squad'

/** The size of a tactical unit, shown by dots above its symbol: Trupp, Staffel, Gruppe, Zug. */
export type UnitSize = 'squad' | 'section' | 'group' | 'platoon'

/** Marks of places and events of an incident. */
export const INCIDENT_MARK_KINDS = ['incident', 'fire', 'hazard', 'staging', 'command-post', 'water', 'casualty-collection'] as const

/** Marks of the water supply along a relay line. */
export const WATER_SUPPLY_MARK_KINDS = ['hydrant-underground', 'hydrant-pillar', 'open-water', 'water-tank', 'dividing-breeching'] as const

/** Every kind of mark that is not a unit. */
export const MARK_KINDS = [...INCIDENT_MARK_KINDS, ...WATER_SUPPLY_MARK_KINDS] as const

/** A kind of mark. */
export type MarkKind = typeof MARK_KINDS[number]

/** What a unit's symbol is drawn from. */
export interface SymbolSpec {
    shape: SymbolShape
    organisation: Organisation
    text: string
    size?: UnitSize
}

const RED = 'var(--color-signal-500)'
const WHITE = 'white'
const STROKE = 3
const SQUAD_TEXT_WIDTH = 62

interface Colours {
    fill: string
    line: string
    text: string
}

/** The attributes of an outlined form. */
function outlined(fill: string, line: string): Attributes {
    return {fill, stroke: line, 'stroke-width': STROKE}
}

/** The attributes of a plain line. */
function stroked(line: string): Attributes {
    return {fill: 'none', stroke: line, 'stroke-width': STROKE}
}

/** The colours of an organisation. */
function colours(organisation: Organisation): Colours {
    return organisation === 'medical'
        ? {fill: WHITE, line: RED, text: RED}
        : {fill: RED, line: RED, text: WHITE}
}

/** Where the dots of each unit size sit above the symbol: one, two stacked, two apart, three in a row. */
const SIZE_DOTS: Record<UnitSize, [number, number][]> = {
    squad: [[60, 6]],
    section: [[60, 3], [60, 10]],
    group: [[52, 6], [68, 6]],
    platoon: [[50, 6], [60, 6], [70, 6]],
}

/** The dots above a unit that tell its size, after the BBK recommendations of 2010 and 2024 alike. */
function sizeMark(size: UnitSize | undefined, colour: string): SvgElement[] {
    if (!size) return []
    return SIZE_DOTS[size].map(([cx, cy]) => element('circle', {cx, cy, r: 3, fill: colour}))
}

/** The basic form of a unit's symbol, with the writing inside. */
function body(shape: SymbolShape, colour: Colours, text: string): SvgElement[] {
    const outline = outlined(colour.fill, colour.line)
    const wheel = (x: number) => element('circle', {cx: x, cy: 70, r: 6, ...outlined(WHITE, colour.line)})
    switch (shape) {
        case 'vehicle':
            return [element('rect', {x: 10, y: 16, width: 100, height: 44, ...outline}), wheel(34), wheel(86), label(text, 60, 38, colour.text)]
        case 'container':
            return [
                element('rect', {x: 14, y: 16, width: 92, height: 44, ...outline}),
                element('path', {d: 'M8 66 H112 M14 60 L8 66 M106 60 L112 66', ...stroked(colour.line)}),
                label(text, 60, 38, colour.text),
            ]
        case 'trailer':
            return [
                element('rect', {x: 24, y: 16, width: 86, height: 44, ...outline}),
                element('path', {d: 'M24 50 H6', ...stroked(colour.line)}),
                wheel(67),
                label(text, 67, 38, colour.text),
            ]
        case 'boat':
            return [element('path', {d: 'M10 16 H110 L100 56 Q60 72 20 56 Z', ...outline}), label(text, 60, 36, colour.text)]
        case 'unit':
            return [element('rect', {x: 10, y: 16, width: 100, height: 52, ...outline}), label(text, 60, 42, colour.text)]
        case 'squad':
            return [element('rect', {x: 24, y: 18, width: 72, height: 46, rx: 14, ...outline}), label(text, 60, 41, colour.text, SQUAD_TEXT_WIDTH)]
    }
}

/** The symbol of a unit: a vehicle, container, trailer, boat, unit or dismounted squad. */
export function unitSymbolTree(spec: SymbolSpec): SvgElement {
    const colour = colours(spec.organisation)
    return canvas([...sizeMark(spec.size, colour.line), ...body(spec.shape, colour, spec.text)])
}

const OUTLINE = outlined(WHITE, RED)
const TRIANGLE = element('path', {d: 'M60 6 L108 74 H12 Z', ...OUTLINE})
const RING = element('circle', {cx: 60, cy: 40, r: 30, ...OUTLINE})

/** A circle with writing, the form most water supply marks share. */
function waterPoint(text: string): SvgElement[] {
    return [RING, label(text, 60, 40, RED)]
}

/** The drawing of every kind of mark. */
const MARK_DRAWINGS: Record<MarkKind, () => SvgElement[]> = {
    'incident': () => [TRIANGLE],
    'fire': () => [TRIANGLE, element('path', {d: 'M60 30 C50 44 46 52 52 62 C54 54 58 52 60 48 C62 54 66 56 68 62 C74 52 70 42 60 30 Z', fill: RED})],
    'hazard': () => [TRIANGLE, label('!', 60, 52, RED)],
    'staging': () => [element('rect', {x: 10, y: 14, width: 100, height: 52, rx: 26, ...OUTLINE}), label('BR', 60, 40, RED)],
    'command-post': () => [element('path', {d: 'M30 70 V8 M30 10 H96 L84 24 L96 38 H30', ...OUTLINE}), label('EL', 58, 24, RED)],
    'water': () => waterPoint('W'),
    'casualty-collection': () => [RING, element('path', {d: 'M60 22 V58 M42 40 H78', fill: 'none', stroke: RED, 'stroke-width': 8})],
    'hydrant-underground': () => waterPoint('UH'),
    'hydrant-pillar': () => waterPoint('ÜH'),
    'open-water': () => [RING, element('path', {d: 'M38 36 Q49 28 60 36 T82 36 M38 48 Q49 40 60 48 T82 48', ...stroked(RED)})],
    'water-tank': () => [element('path', {d: 'M24 22 V62 H96 V22', ...OUTLINE}), label('LWB', 60, 44, RED)],
    'dividing-breeching': () => [
        element('path', {d: 'M60 14 V40 M60 40 L32 68 M60 40 V68 M60 40 L88 68', ...stroked(RED)}),
        element('circle', {cx: 60, cy: 40, r: 7, fill: RED}),
    ],
}

/** The symbol of a mark: a place or event of an incident, or a point of the water supply. */
export function markSymbolTree(kind: MarkKind): SvgElement {
    return canvas(MARK_DRAWINGS[kind]())
}

/** A unit's symbol as SVG markup, for map icons. */
export function unitSymbol(spec: SymbolSpec): string {
    return renderSvg(unitSymbolTree(spec))
}

/** A mark's symbol as SVG markup, for map icons. */
export function markSymbol(kind: MarkKind): string {
    return renderSvg(markSymbolTree(kind))
}

