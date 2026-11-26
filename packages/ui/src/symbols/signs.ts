/**
 * Tactical signs built from the building blocks of the recommendations "Taktische Zeichen im
 * Bevölkerungsschutz" of the BBK (2024, for FwDV 102 / DV 102): a basic form (chapter 1), the
 * colour of an organisation (chapter 2) in one of three styles, supplementary signs (chapter 3),
 * a unit size or association (5.4, 5.5), and for vehicles how they move and what they carry (5.1).
 * The drawings follow the system of the recommendations without copying their artwork.
 *
 * Colours are fixed values, not theme variables, because the same signs go into map icons as
 * markup strings where no stylesheet applies. They are the HEX column of annex O; for orange the
 * annex gives 250–130–0 as RGB but #FA8C00 as HEX, and the HEX value is used. Signs are drawn for a
 * light background, as on paper: size marks, frames and wheels are black, so a page in dark mode
 * shows them on a light backdrop.
 *
 * Every sign is drawn on the 120 × 80 canvas of the library, which widens only for writing around
 * the sign (a time, a presumption, an identification, a strength, stars above a size mark, the line
 * to a location); the sign itself keeps its place. Size marks, roofs and supplements are placed
 * relative to the form they belong to, so they fit every basic form; under a roof the size marks sit
 * inside the roof, since the canvas has no room above it.
 */

import {ABILITIES, type Ability, type AbilityName} from './abilities'
import {BLACK, BOX_STROKE, HAZARD_RED, MEASURE_BLUE, SIGN_FONT, SYMBOL_HEIGHT, SYMBOL_WIDTH, WHITE, asterisk, boxPart, canvas, element, group, label, renderSvg, round, starOffsets, type BoxPart, type SvgElement} from './svg'

/** The basic forms of chapter 1, in its order. */
export const BASIC_FORMS = [
    'formation', 'person', 'land-vehicle', 'aircraft', 'watercraft', 'place', 'building', 'room', 'area',
    'measure', 'hazard', 'landmark', 'event', 'volunteer',
] as const

/** A basic form of a tactical sign. */
export type BasicForm = typeof BASIC_FORMS[number]

/** The organisations of chapter 2, in its order. */
export const SIGN_ORGANISATIONS = ['fire', 'aid', 'thw', 'command', 'police', 'military', 'other', 'civil'] as const

/** An organisation whose colour a sign carries. */
export type SignOrganisation = typeof SIGN_ORGANISATIONS[number]

/** How the colour is applied: filling the form, only as its outline, or black on white. */
export type SignStyle = 'filled' | 'outline' | 'mono'

/** The tactical units of 5.4 and the associations of 5.5. */
export const SIGN_SIZES = ['squad', 'section', 'group', 'platoon', 'association-1', 'association-2', 'association-3'] as const

/** The size of what a sign stands for. */
export type SignSize = typeof SIGN_SIZES[number]

/** The supplementary signs of chapter 3, in its order. */
export const SUPPLEMENTS = ['command', 'special-function', 'logistics', 'uncrewed', 'bicycle', 'motorcycle', 'roof'] as const

/** A supplementary sign. */
export type Supplement = typeof SUPPLEMENTS[number]

/** How a land vehicle or trailer runs, after 5.1.1 and 5.1.2: its wheels, tracks or rails. */
export const DRIVES = ['road', 'offroad', 'all-terrain', 'amphibious', 'tracked', 'rail', 'rail-capable', 'towed-by-car', 'towed-by-truck'] as const

/** The running gear of a land vehicle or trailer. */
export type Drive = typeof DRIVES[number]

/** What a land vehicle is or carries, after 5.1.1 to 5.1.3: trailers, swap bodies and containers. */
export const VEHICLE_BODIES = [
    'swap-loader', 'container-carrier', 'trailer', 'roll-off-trailer', 'container-trailer',
    'roll-off-container', 'swap-container', 'swap-body', 'roll-container',
] as const

/** The body of a land vehicle. */
export type VehicleBody = typeof VEHICLE_BODIES[number]

/** How an aircraft flies, after 5.1.4. */
export const FLIGHTS = ['flying', 'rotary-wing', 'fixed-wing'] as const

/** The flight of an aircraft. */
export type Flight = typeof FLIGHTS[number]

/** What a tactical sign is drawn from. */
export interface TacticalSignSpec {
    form: BasicForm
    organisation?: SignOrganisation
    style?: SignStyle
    size?: SignSize
    supplements?: readonly Supplement[]
    /** For land vehicles: a protected vehicle has a straight top and an inward-curving underside (5.1). */
    protected?: boolean
    drive?: Drive
    body?: VehicleBody
    flight?: Flight
    /** Abilities of chapter 4 drawn inside the form, the main one first; they stack from the bottom up (6.1). */
    abilities?: readonly AbilityName[]
    /** A short designation in the upper left corner (field A), such as "ELW 1", as annex C shows it. */
    designation?: string
    /** A second line under the writing, such as the name of a section ("Nord") or a task ("Evakuierung"). */
    subtitle?: string
    /** Writing in the lower right corner inside the form (field B), such as an origin ("DLRG", "AW"). */
    fieldB?: string
    /** Writing in the free fields X of 6.1, in the upper right and lower left corners, such as "TP" or "K". */
    fieldX?: {upperRight?: string, lowerLeft?: string}
    /** The administrative level of 5.7, from 1 (municipality) to 6 (European Union), as stars above the form. */
    level?: 1 | 2 | 3 | 4 | 5 | 6
    /** A strength of 5.3 below the form, such as "1/1/6/40/48"; the last number, the total, is underlined. */
    strength?: string
    /** A time of 5.6 to the left of the form, such as "040835jun23". */
    time?: string
    /** An identification of 6.2 to the right of the form, such as "2-1-3". */
    identification?: string
    /** A presumption (5.8.1.13, "?") or an acute situation (5.8.1.14, "!") written before the form. */
    certainty?: 'presumed' | 'acute'
    /** A figure of annex D.2 inside the form, such as the tray of a staging area. */
    figure?: SignFigure
    /** Draws the dashed line to the location of a command post (D.1.1) below the form. */
    located?: boolean
    /** Writing inside the form, such as a function or a vehicle name. */
    text?: string
    /** Shows the organisation's short name, which chapter 2 asks for whenever colour is missing. */
    abbreviation?: boolean
}

/** The colour, its writing colour and short name of each organisation, after chapter 2 and annex O. */
export const ORGANISATION_COLOURS: Readonly<Record<SignOrganisation, Readonly<{fill: string, text: string, abbreviation: string}>>> = {
    fire: {fill: '#FA321E', text: '#000000', abbreviation: 'Fw'},
    aid: {fill: '#FFFFFF', text: '#000000', abbreviation: 'HiOrg'},
    thw: {fill: '#003399', text: '#FFFFFF', abbreviation: 'THW'},
    command: {fill: '#FAFA00', text: '#000000', abbreviation: ''},
    police: {fill: '#64DC32', text: '#000000', abbreviation: 'Pol'},
    military: {fill: '#B4783C', text: '#FFFFFF', abbreviation: 'Bw'},
    other: {fill: '#FA8C00', text: '#000000', abbreviation: 'Sonst.'},
    civil: {fill: '#BEBEBE', text: '#000000', abbreviation: 'ZIV'},
}

const STROKE = 3

/** Where a form lies on the canvas and where its writing, bars and short name go. */
interface Layout {
    d: string
    closed: boolean
    left: number
    right: number
    top: number
    bottom: number
    textWidth: number
    textY: number
    /** The command bar along the top inside the form (3.1), following a curved top. */
    commandBar: string
    /** The logistics bar along the bottom inside the form (3.3). */
    logisticsBar: string
    /** Where the short name sits; outside the form where the form has no room for it. */
    short: {x: number, y: number, inside: boolean}
    /** The font size of writing inside the form where the form is too small for the usual size. */
    textSize?: number
    /** A filled cap in place of the command bar, where the form has no room for a bar (the tip of a person). */
    commandCap?: string
    /** The room for abilities and figures where it is narrower than the bounds, as in a diamond. */
    room?: {left: number, right: number, top: number, bottom: number}
}

/** A layout with straight bars inset from the bounds and the short name in the lower right corner. */
function layout(d: string, left: number, right: number, top: number, bottom: number, textWidth: number, textY: number,
    extra: Partial<Layout> = {}): Layout {
    return {
        d, closed: true, left, right, top, bottom, textWidth, textY,
        commandBar: `M${left + 5} ${top + 6} H${right - 5}`,
        logisticsBar: `M${left + 5} ${bottom - 6} H${right - 5}`,
        short: {x: right - 14, y: bottom - 8, inside: true},
        ...extra,
    }
}

const SHORT_BESIDE = {x: 104, y: 42, inside: false}

/** The layout of each basic form. */
const FORMS: Record<BasicForm, Layout> = {
    'formation': layout('M10 16 H110 V68 H10 Z', 10, 110, 16, 68, 86, 42),
    'person': layout('M60 16 L86 42 L60 68 L34 42 Z', 34, 86, 16, 68, 30, 42,
        {commandCap: 'M60 16 L71 27 H49 Z', logisticsBar: 'M48 56 H72', short: SHORT_BESIDE, textSize: 13, room: {left: 46, right: 74, top: 26, bottom: 58}}),
    'land-vehicle': layout('M10 16 Q60 24 110 16 V60 H10 Z', 10, 110, 16, 60, 86, 40, {commandBar: 'M15 23 Q60 31 105 23'}),
    'aircraft': layout('M22 62 A38 38 0 0 1 98 62 Z', 22, 98, 24, 62, 56, 48,
        {commandBar: 'M40 34 H80', short: {x: 84, y: 56, inside: true}}),
    'watercraft': layout('M22 20 A38 38 0 0 0 98 20 Z', 22, 98, 20, 58, 56, 34,
        {logisticsBar: 'M40 48 H80', short: {x: 80, y: 28, inside: true}}),
    'place': layout('M86 42 A26 26 0 1 1 34 42 A26 26 0 1 1 86 42 Z', 34, 86, 16, 68, 40, 42,
        {commandBar: 'M42 26 H78', logisticsBar: 'M42 58 H78', short: SHORT_BESIDE}),
    'building': layout('M24 32 L60 16 L96 32 V68 H24 Z', 24, 96, 16, 68, 60, 50, {commandBar: 'M29 38 H91'}),
    'room': layout('M34 16 H86 V68 H34 Z', 34, 86, 16, 68, 44, 42, {short: SHORT_BESIDE}),
    'area': layout('M28 30 Q34 16 54 20 Q78 12 90 24 Q100 36 92 50 Q96 64 76 66 Q58 70 44 64 Q24 66 22 52 Q18 40 28 30 Z',
        22, 96, 16, 68, 56, 42, {commandBar: 'M34 28 H86', logisticsBar: 'M34 58 H86'}),
    'measure': layout('M28 18 H92 L60 68 Z', 28, 92, 18, 68, 36, 34, {logisticsBar: 'M50 50 H70', short: SHORT_BESIDE}),
    'hazard': layout('M60 16 L92 66 H28 Z', 28, 92, 16, 66, 36, 52, {commandBar: 'M50 32 H70', short: SHORT_BESIDE}),
    'landmark': layout('M46 16 H74 V54 L60 68 L46 54 Z', 46, 74, 16, 68, 24, 36, {short: SHORT_BESIDE}),
    'event': {...layout('M38 22 L60 64 L82 22', 38, 82, 22, 64, 30, 34, {short: SHORT_BESIDE}), closed: false},
    'volunteer': layout('M47 29 A13 13 0 0 1 73 29 A13 13 0 0 1 73 55 A13 13 0 0 1 47 55 A13 13 0 0 1 47 29 Z',
        34, 86, 16, 68, 34, 42, {commandBar: 'M46 28 H74', logisticsBar: 'M46 56 H74', short: SHORT_BESIDE}),
}

/** The colours a sign is drawn in. */
interface Paint {
    fill: string
    line: string
    text: string
}

/**
 * The colours of a sign. In black and white everything is black on white. Otherwise a hazard is
 * red and a measure blue, whatever the organisation, and an event has no fill. Filled signs carry a
 * black outline, outlined signs the organisation's colour (black for the white of the aid
 * organisations). A sign without an organisation is drawn black on white, as chapter 1 shows the
 * basic forms; a volunteer without one is grey, as 1.14 asks.
 */
function paint(spec: TacticalSignSpec): Paint {
    const style = spec.style ?? 'filled'
    if (style === 'mono') return {fill: WHITE, line: BLACK, text: BLACK}
    if (spec.form === 'hazard') return {fill: 'none', line: HAZARD_RED, text: HAZARD_RED}
    if (spec.form === 'measure') return {fill: 'none', line: MEASURE_BLUE, text: MEASURE_BLUE}
    if (spec.form === 'event') return {fill: 'none', line: BLACK, text: BLACK}
    const organisation = spec.organisation ?? (spec.form === 'volunteer' ? 'civil' : undefined)
    if (!organisation) return {fill: WHITE, line: BLACK, text: BLACK}
    const colour = ORGANISATION_COLOURS[organisation]
    if (style === 'outline') {
        const line = colour.fill === WHITE ? BLACK : colour.fill
        return {fill: WHITE, line, text: line}
    }
    return {fill: colour.fill, line: BLACK, text: colour.text}
}

function dot(cx: number, cy: number): SvgElement {
    return element('circle', {cx, cy, r: 3, fill: BLACK})
}

function bar(cx: number, bottom: number): SvgElement {
    return element('rect', {x: cx - 2.5, y: bottom - 12, width: 5, height: 12, fill: BLACK})
}

/** The marks of a unit size or association, resting just above `above`. */
function sizeMark(size: SignSize, above: number): SvgElement[] {
    const y = above - 7
    switch (size) {
        case 'squad': return [dot(60, y)]
        case 'section': return [dot(60, y - 6), dot(60, y + 1)]
        case 'group': return [dot(52, y), dot(68, y)]
        case 'platoon': return [dot(50, y), dot(60, y), dot(70, y)]
        case 'association-1': return [bar(60, above - 3)]
        case 'association-2': return [bar(52, above - 3), bar(68, above - 3)]
        case 'association-3': return [bar(48, above - 3), bar(60, above - 3), bar(72, above - 3)]
    }
}

/** The room inside a form that abilities may take, clear of the designation and the command and logistics bars. */
function abilityRoom(spec: TacticalSignSpec, form: Layout): {left: number, top: number, width: number, height: number} {
    const supplements = spec.supplements ?? []
    const bounds = form.room ?? {left: form.left + 6, right: form.right - 6, top: form.top + 4, bottom: form.bottom - 4}
    const top = (form.room ? bounds.top : bounds.top + (supplements.includes('command') ? 8 : 0)) + (spec.designation || spec.fieldX?.upperRight ? 10 : 0)
    const bottom = supplements.includes('logistics') ? Math.min(bounds.bottom, form.bottom - 12) : bounds.bottom
    return {left: bounds.left, top, width: bounds.right - bounds.left, height: bottom - top}
}

/**
 * The abilities inside a form: each gets an equal slice of the room, the first (main) one at the
 * bottom, and is scaled evenly into it. A single ability that stretches spans the whole room
 * instead, below a designation if there is one, as annex C draws it; its paths are stretched, its
 * dots stay round.
 * Stroke widths are set in each box so the lines keep the weight of the form's outline.
 */
function abilityMarks(spec: TacticalSignSpec, form: Layout, colour: string): SvgElement[] {
    const names = spec.abilities ?? []
    const room = abilityRoom(spec, form)
    const only = names.length === 1 ? (ABILITIES[names[0]!] as Ability) : undefined
    if (only?.stretch) {
        const sx = room.width / 100
        const sy = room.height / 60
        const lines = only.parts.filter(part => !('circle' in part)).map(part => boxPart(part, colour, BOX_STROKE / Math.min(sx, sy)))
        const dots = only.parts.flatMap(part => 'circle' in part
            ? [element('circle', {cx: round(room.left + part.circle[0] * sx), cy: round(room.top + part.circle[1] * sy),
                r: round(part.circle[2] * Math.min(sx, sy)), fill: part.filled ? colour : 'none', stroke: colour, 'stroke-width': BOX_STROKE})]
            : [])
        return [group(lines, {transform: `translate(${round(room.left)} ${round(room.top)}) scale(${round(sx)} ${round(sy)})`}), ...dots]
    }
    const slot = room.height / names.length
    return names.map((name, index) => {
        const scale = Math.min(room.width / 100, slot / 60)
        const x = room.left + (room.width - 100 * scale) / 2
        const y = room.top + slot * (names.length - 1 - index) + (slot - 60 * scale) / 2
        const parts = ABILITIES[name].parts.map(part => boxPart(part, colour, BOX_STROKE / scale))
        return group(parts, {transform: `translate(${round(x)} ${round(y)}) scale(${round(scale)})`})
    })
}

/** The designation in the upper left corner of a form (field A), below a command bar if there is one. */
function designation(spec: TacticalSignSpec, text: string, form: Layout, colour: string): SvgElement {
    const below = (spec.supplements ?? []).includes('command') ? 12 : 0
    return {
        tag: 'text',
        attributes: {x: form.left + 5, y: form.top + 8 + below, fill: colour, 'font-size': 10, ...SIGN_FONT, 'dominant-baseline': 'central'},
        text,
    }
}

/** A line of the given colour and width. */
function line(d: string, colour: string, width = STROKE): SvgElement {
    return element('path', {d, fill: 'none', stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'})
}

const ROOF_HEIGHT = 11

/** The drawing of a supplementary sign of chapter 3 on a form. */
function supplement(kind: Supplement, form: Layout, colour: string): SvgElement[] {
    const y = form.textY
    switch (kind) {
        case 'command': return form.commandCap
            ? [element('path', {d: form.commandCap, fill: BLACK, stroke: BLACK, 'stroke-width': 2, 'stroke-linejoin': 'round'})]
            : [line(form.commandBar, BLACK, 5)]
        case 'logistics': return [line(form.logisticsBar, BLACK, 5)]
        case 'special-function': return [line(`M52 ${form.top + 8} H68`, colour)]
        case 'uncrewed': return [line(`M50 ${y - 14} L60 ${y - 6} L70 ${y - 14}`, colour, 4)]
        case 'bicycle': return [line(`M50 ${y - 6} Q60 ${y - 18} 70 ${y - 6} M60 ${y - 12} V${y + 12}`, colour)]
        case 'motorcycle': return [line(`M50 ${y - 6} Q60 ${y - 18} 70 ${y - 6} M58 ${y - 12} V${y + 12} M62 ${y - 12} V${y + 12}`, colour)]
        case 'roof': return [line(`M${form.left + 4} ${form.top - 3} L60 ${form.top - 3 - ROOF_HEIGHT} L${form.right - 4} ${form.top - 3}`, BLACK)]
    }
}

function wheel(cx: number, cy: number, colour: string): SvgElement {
    return element('circle', {cx, cy, r: 4, fill: WHITE, stroke: colour, 'stroke-width': 2})
}

/** The running gear below a vehicle. */
function driveMarks(drive: Drive, form: Layout, colour: string, framed: boolean): SvgElement[] {
    const y = form.bottom + (framed ? 10 : 6)
    const left = form.left + 8
    const right = form.right - 8
    const middle = (form.left + form.right) / 2
    switch (drive) {
        case 'road': return [wheel(left, y, colour), wheel(right, y, colour)]
        case 'offroad': return [wheel(left, y, colour), wheel(middle, y, colour), wheel(right, y, colour)]
        case 'all-terrain': return [line(`M${left} ${y} H${right}`, colour, 2), wheel(left, y, colour), wheel(middle, y, colour), wheel(right, y, colour)]
        case 'amphibious': return [wheel(left, y, colour), wheel(right, y, colour),
            line(`M${left + 8} ${y} Q${left + 16} ${y - 8} ${left + 24} ${y} T${left + 40} ${y} T${left + 56} ${y} T${left + 72} ${y}`, colour, 2)]
        case 'tracked': return [element('rect', {x: form.left + 2, y: y - 4, width: form.right - form.left - 4, height: 10, rx: 5, fill: WHITE, stroke: colour, 'stroke-width': 2})]
        case 'rail': return [wheel(left - 2, y, colour), wheel(left + 8, y, colour), wheel(right - 8, y, colour), wheel(right + 2, y, colour)]
        case 'rail-capable': return [wheel(left - 2, y, colour), wheel(left + 8, y, colour), wheel(middle, y, colour), wheel(right - 8, y, colour), wheel(right + 2, y, colour)]
        case 'towed-by-car': return [wheel(middle, y, colour)]
        case 'towed-by-truck': return [wheel(middle - 5, y, colour), wheel(middle + 5, y, colour)]
    }
}

/** The hook of a roll-off container at the top left of a body. */
function rollOffHook(form: Layout, colour: string): SvgElement {
    return line(`M${form.left + 4} ${form.top + 6} Q${form.left} ${form.top} ${form.left + 6} ${form.top - 2}`, colour, 2)
}

/** The two lifting eyes of a swap body or container on top. */
function containerEyes(form: Layout, colour: string): SvgElement {
    const top = form.top
    return line(`M${form.left + 4} ${top} Q${form.left + 4} ${top - 6} ${form.left + 10} ${top - 6} Q${form.left + 16} ${top - 6} ${form.left + 16} ${top}`
        + ` M${form.right - 16} ${top} Q${form.right - 16} ${top - 6} ${form.right - 10} ${top - 6} Q${form.right - 4} ${top - 6} ${form.right - 4} ${top}`, colour, 2)
}

/** The L-shaped frame that carries a swap body. */
function carrierFrame(form: Layout, colour: string): SvgElement {
    return line(`M${form.left - 6} ${form.top + 2} V${form.bottom + 4} H${form.right + 4}`, colour, 2)
}

/** The drawbar on the left of a trailer, at 60 % of its height, ending at the body or its frame. */
function drawbar(form: Layout, colour: string, framed: boolean): SvgElement {
    const y = form.top + (form.bottom - form.top) * 0.6
    const end = form.left - (framed ? 6 : 0)
    return line(`M${end - 7} ${y} H${end} M${end - 7} ${y - 3} V${y + 3}`, colour, 2)
}

const FRAMED: ReadonlySet<VehicleBody> = new Set(['swap-loader', 'container-carrier', 'roll-off-trailer', 'container-trailer'])
const TRAILERS: ReadonlySet<VehicleBody> = new Set(['trailer', 'roll-off-trailer', 'container-trailer'])
const BOXES: ReadonlySet<VehicleBody> = new Set(['container-carrier', 'container-trailer', 'swap-container', 'swap-body'])

/** What a vehicle body adds around its form. */
function bodyMarks(body: VehicleBody, form: Layout, colour: string): SvgElement[] {
    const marks: SvgElement[] = []
    if (FRAMED.has(body)) marks.push(carrierFrame(form, colour))
    if (TRAILERS.has(body)) marks.push(drawbar(form, colour, FRAMED.has(body)))
    if (body === 'swap-loader' || body === 'roll-off-trailer' || body === 'roll-off-container') marks.push(rollOffHook(form, colour))
    if (body === 'container-carrier' || body === 'container-trailer' || body === 'swap-container') marks.push(containerEyes(form, colour))
    if (body === 'swap-body') marks.push(line(`M${form.left + 10} ${form.bottom} V${form.bottom + 8} M${form.right - 10} ${form.bottom} V${form.bottom + 8}`, colour, 2))
    if (body === 'roll-container') marks.push(line(`M${form.right} ${form.top + 2} Q${form.right + 8} ${form.top - 4} ${form.right + 3} ${form.top - 9}`, colour, 2),
        wheel(54, form.bottom + 6, colour), wheel(66, form.bottom + 6, colour))
    return marks
}

/** What 5.1.4 adds to an aircraft: the flying line beneath it or its drive inside. */
function flightMarks(flight: Flight, form: Layout, colour: string): SvgElement[] {
    switch (flight) {
        case 'flying': return [line(`M${form.left - 2} ${form.bottom + 8} H54 L60 ${form.bottom + 14} L66 ${form.bottom + 8} H${form.right + 2}`, colour, 2)]
        case 'rotary-wing': return [element('path', {d: 'M40 40 L60 48 L80 40 V56 L60 48 L40 56 Z', fill: colour})]
        case 'fixed-wing': return [element('path', {d: 'M60 48 C52 36 38 38 38 48 C38 58 52 60 60 48 C68 36 82 38 82 48 C82 58 68 60 60 48 Z', fill: colour})]
    }
}

/**
 * The layout of a sign: a protected land vehicle has a straight top and a curved underside, a body
 * that is a container sits as a box above its gear, and a roll container is narrow.
 */
function layoutOf(spec: TacticalSignSpec): Layout {
    const form = FORMS[spec.form]
    if (spec.form === 'land-vehicle' && spec.protected) return {...form, d: 'M10 16 H110 V60 Q60 52 10 60 Z', commandBar: 'M15 22 H105'}
    if (spec.body && BOXES.has(spec.body)) return layout('M14 18 H106 V60 H14 Z', 14, 106, 18, 60, 80, 39)
    if (spec.body === 'roll-container') return layout('M42 18 Q60 22 78 18 V62 H42 Z', 42, 78, 18, 62, 30, 40, {short: SHORT_BESIDE})
    return form
}

/** The sign as a tree of SVG elements on the common canvas. */
export function tacticalSignTree(spec: TacticalSignSpec): SvgElement {
    const form = layoutOf(spec)
    const colours = paint(spec)
    const supplements = spec.supplements ?? []
    const parts: SvgElement[] = [element('path', {
        d: form.d,
        fill: form.closed ? colours.fill : 'none',
        stroke: colours.line,
        'stroke-width': STROKE,
        'stroke-linejoin': 'round',
    })]
    if (spec.body) parts.push(...bodyMarks(spec.body, form, colours.line))
    if (spec.drive) parts.push(...driveMarks(spec.drive, form, colours.line, spec.body !== undefined && FRAMED.has(spec.body)))
    if (spec.flight) parts.push(...flightMarks(spec.flight, form, colours.line))
    for (const kind of supplements) parts.push(...supplement(kind, form, colours.line))
    if (spec.size) parts.push(...sizeMark(spec.size, form.top))
    if (spec.abilities?.length) parts.push(...abilityMarks(spec, form, colours.text))
    if (spec.figure) parts.push(figureMark(spec, spec.figure, form, colours.text))
    if (spec.designation) parts.push(designation(spec, spec.designation, form, colours.text))
    const underBar = spec.form === 'place' && (spec.supplements ?? []).includes('command') ? 4 : 0
    const textY = (spec.subtitle ? form.textY - 5 : form.textY) + underBar
    if (spec.text) parts.push(label(spec.text, 60, textY, colours.text, form.textWidth, form.textSize))
    if (spec.subtitle) parts.push(label(spec.subtitle, 60, textY + 13, colours.text, form.textWidth, 9))
    parts.push(...cornerFields(spec, form, colours.text))
    const short = spec.abbreviation && spec.organisation ? ORGANISATION_COLOURS[spec.organisation].abbreviation : ''
    if (short) parts.push(label(short, form.short.x, form.short.y, form.short.inside ? colours.text : BLACK, 24, 10))
    const margins = {left: 0, right: 0, top: 0, bottom: 0}
    if (spec.level) {
        const raised = spec.size !== undefined || (spec.supplements ?? []).includes('roof')
        const y = raised ? form.top - (spec.level === 6 ? 26 : 20) : form.top - (spec.level === 6 ? 9 : 7)
        parts.push(stars(spec.level, y))
        const highest = y + Math.min(...starOffsets(spec.level).map(([, dy]) => dy)) - STAR_RADIUS(spec.level) - 1
        margins.top = Math.max(0, Math.ceil(-highest))
    }
    const below = form.bottom + (spec.drive || spec.body ? 14 : 2)
    if (spec.located) {
        parts.push(...locationLine(form))
        margins.bottom = form.bottom + 36 - SYMBOL_HEIGHT
    }
    if (spec.strength) {
        const y = spec.located ? form.bottom + 44 : below + 8
        parts.push(...strengthMark(spec.strength, y))
        margins.bottom = Math.max(margins.bottom, y + 6 - SYMBOL_HEIGHT)
    }
    const ink = spec.style === 'mono' ? BLACK : HAZARD_RED
    let left = form.left - 6
    if (spec.certainty) {
        parts.push(corner(spec.certainty === 'presumed' ? '?' : '!', left, form.textY, ink, 'end', 28))
        left -= writingWidth('?', 28) + 4
    }
    if (spec.time) {
        parts.push(beside(spec.time, left, form.textY, 'end'))
        left -= writingWidth(spec.time, BESIDE_SIZE)
    }
    margins.left = Math.max(0, Math.ceil(2 - left))
    if (spec.identification) {
        const start = short && !form.short.inside ? form.short.x + writingWidth(short, 10) / 2 + 4 : form.right + 6
        parts.push(beside(spec.identification, start, form.textY, 'start'))
        margins.right = Math.max(0, Math.ceil(start + writingWidth(spec.identification, BESIDE_SIZE) + 2 - SYMBOL_WIDTH))
    }
    return canvas([group(parts)], margins)
}

/**
 * Field B in the lower right and the fields X of 6.1 in the upper right and lower left corners:
 * inside the form where it has room, otherwise just outside, beside its edges.
 */
function cornerFields(spec: TacticalSignSpec, form: Layout, colour: string): SvgElement[] {
    const below = (spec.supplements ?? []).includes('command') && !form.commandCap ? 12 : 0
    const inside = form.short.inside
    const low = form.bottom - 6 - ((spec.supplements ?? []).includes('logistics') ? 8 : 0)
    const fields: SvgElement[] = []
    if (spec.fieldB) {
        fields.push(inside ? corner(spec.fieldB, form.right - 4, low, colour, 'end') : corner(spec.fieldB, 66, form.bottom - 2, BLACK, 'start', 8))
    }
    if (spec.fieldX?.upperRight) {
        fields.push(inside
            ? corner(spec.fieldX.upperRight, form.right - 4, form.top + 8 + below, colour, 'end')
            : corner(spec.fieldX.upperRight, 66, form.top + 2, BLACK, 'start', 8))
    }
    if (spec.fieldX?.lowerLeft) {
        fields.push(inside
            ? corner(spec.fieldX.lowerLeft, form.left + 5, low, colour, 'start')
            : corner(spec.fieldX.lowerLeft, 54, form.bottom - 2, BLACK, 'end', 8))
    }
    return fields
}

const BESIDE_SIZE = 12

/** Writing beside a sign, squeezed to its estimated width so the canvas margin always holds it, whatever font a map falls back to. */
function beside(text: string, x: number, y: number, anchor: 'start' | 'end'): SvgElement {
    const writing = corner(text, x, y, BLACK, anchor, BESIDE_SIZE)
    return {...writing, attributes: {...writing.attributes, textLength: writingWidth(text, BESIDE_SIZE), lengthAdjust: 'spacingAndGlyphs'}}
}

/** Roughly how wide a line of writing is in the sign font, to make room for it beside the sign. */
function writingWidth(text: string, size: number): number {
    return Math.ceil(text.length * size * 0.55)
}

/** Writing anchored at its start or end, for corners and the writing beside a sign. */
function corner(text: string, x: number, y: number, colour: string, anchor: 'start' | 'end', size = 9): SvgElement {
    return {tag: 'text', attributes: {x, y, fill: colour, 'font-size': size, ...SIGN_FONT, 'text-anchor': anchor, 'dominant-baseline': 'central'}, text}
}

/** The size of the stars above a form; the ring of the European Union has smaller ones. */
const STAR_RADIUS = (level: number) => level === 6 ? 3 : 4

/** The stars of an administrative level (5.7) above a form; the European Union gets its ring of stars. */
function stars(level: number, y: number): SvgElement {
    return element('path', {d: starOffsets(level).map(([dx, dy]) => asterisk(60 + dx, y + dy, STAR_RADIUS(level))).join(' '), fill: 'none', stroke: BLACK,
        'stroke-width': 1.5, 'stroke-linecap': 'round'})
}

/** The figures of annex D.2 drawn inside a place, on the 100 × 60 box of the abilities. */
export const SIGN_FIGURES = {
    'staging-area': [{d: 'M18 18 Q50 30 82 18 V50 H18 Z'}],
    'staging-area-with-report': [{d: 'M22 30 Q50 40 78 30 V58 H22 Z'}, {text: 'M', x: 50, y: 12, size: 24}],
    'landing-zone': [{d: 'M24 18 L50 30 L24 42 Z M76 18 L50 30 L76 42 Z', filled: true}, {d: 'M14 30 H86'}],
} as const satisfies Record<string, readonly BoxPart[]>

/** A figure of annex D.2. */
export type SignFigure = keyof typeof SIGN_FIGURES

/** A figure inside a form, scaled evenly into the room the abilities would take. */
function figureMark(spec: TacticalSignSpec, figure: SignFigure, form: Layout, colour: string): SvgElement {
    const room = abilityRoom(spec, form)
    const scale = Math.min(room.width / 100, room.height / 60)
    const x = room.left + (room.width - 100 * scale) / 2
    const y = room.top + (room.height - 60 * scale) / 2
    return group(SIGN_FIGURES[figure].map(part => boxPart(part, colour, BOX_STROKE / scale)),
        {transform: `translate(${round(x)} ${round(y)}) scale(${round(scale)})`})
}

/** The dashed line from a command post to its location on the map, ending in a cross (D.1.1). */
function locationLine(form: Layout): SvgElement[] {
    const end = {x: form.left + 76, y: form.bottom + 30}
    return [
        element('path', {d: `M${form.left} ${form.bottom} L${end.x} ${end.y}`, stroke: BLACK, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', fill: 'none'}),
        element('path', {d: `M${end.x - 4} ${end.y - 4} L${end.x + 4} ${end.y + 4} M${end.x + 4} ${end.y - 4} L${end.x - 4} ${end.y + 4}`,
            stroke: BLACK, 'stroke-width': 1.5}),
    ]
}

/** A strength of 5.3 below the form, its last number, the total, underlined. */
function strengthMark(strength: string, y: number): SvgElement[] {
    const parts = strength.split('/')
    const total = parts.pop() ?? ''
    const head = parts.length ? `${parts.join('/')}/` : ''
    return [{tag: 'text', attributes: {x: 60, y, fill: BLACK, 'font-size': 11, ...SIGN_FONT, 'text-anchor': 'middle', 'dominant-baseline': 'central'},
        children: [
            {tag: 'tspan', attributes: {}, text: head},
            {tag: 'tspan', attributes: {'text-decoration': 'underline'}, text: total},
        ]}]
}

/** The sign as SVG markup, for map icons. */
export function tacticalSign(spec: TacticalSignSpec): string {
    return renderSvg(tacticalSignTree(spec))
}
