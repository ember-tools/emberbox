/**
 * The additional signs of chapter 5 of the recommendations "Taktische Zeichen im
 * Bevölkerungsschutz" (BBK, 2024) that stand on their own rather than inside a basic form:
 * directions and movements (5.2), administrative levels (5.7) and the signs of hazards and damage
 * (5.8). Each is drawn on its own 100 × 60 box in the colours 5.8 recommends: people and units
 * black, damage and hazards red, water and own forces blue. The drawings follow the system of the
 * recommendations without copying their artwork.
 */

import {ARROW_HEAD, DIAMOND, VET, waves} from './abilities'
import {BLACK, HAZARD_RED as RED, MEASURE_BLUE as BLUE, WHITE, asterisk, boxPart, canvas, group, renderSvg, round, starOffsets, type BoxPart, type SvgElement} from './svg'

/** An additional sign with its number, name after the recommendations and printed page. */
export interface AdditionalSign {
    number: string
    name: string
    page: number
    parts: readonly BoxPart[]
}

/** The green of 5.8.2, taken from the printed signs; annex O names no green for it. */
const GREEN = '#2E9E3E'

const red = (part: BoxPart): BoxPart => ({...part, colour: RED})
const blue = (part: BoxPart): BoxPart => ({...part, colour: BLUE})

/** A block arrow of the tactics of 5.8.1, starting at `x` and 56 long. */
function tacticArrow(x: number): BoxPart {
    return {d: `M${x} 22 Q${x + 18} 14 ${x + 36} 16 V8 L${x + 56} 28 L${x + 36} 48 V40 Q${x + 18} 38 ${x} 48`}
}

const TRIANGLE: BoxPart = {d: 'M50 4 L80 56 H20 Z'}
const PERSON = DIAMOND(50, 30, 22)

/** A hazard of 5.8.1: a red triangle around its mark. */
function hazard(...inside: BoxPart[]): BoxPart[] {
    return [TRIANGLE, ...inside].map(red)
}

/** A person of 5.8.8 moved up to make room for a mark below. */
const RAISED = DIAMOND(50, 26, 20)

/** A grade of activity or failure of 5.8.2: a square with `red` of its four quarters red, clockwise from the upper right. */
function activity(red: number): BoxPart[] {
    const quarters = ['M50 8 H72 V30 H50 Z', 'M50 30 H72 V52 H50 Z', 'M28 30 H50 V52 H28 Z', 'M28 8 H50 V30 H28 Z']
    return [
        ...quarters.map((d, index) => ({d, filled: true, width: 0.1, colour: index < red ? RED : GREEN})),
        {d: 'M28 8 H72 V52 H28 Z'},
        {circle: [50, 30, 8], filled: true, colour: WHITE},
        {circle: [50, 30, 8]},
        {text: String(red), x: 50, y: 30, size: 12},
    ]
}

/** A grade of destruction of 5.8.4: as many red strokes each way as the grade. */
function destruction(grade: number): BoxPart[] {
    const offsets = grade === 1 ? [0] : grade === 2 ? [-6, 6] : [-9, 0, 9]
    const step = (o: number) => round(o * Math.SQRT1_2)
    const lines = offsets.flatMap(o => [
        `M${34 + step(o)} ${14 - step(o)} L${66 + step(o)} ${46 - step(o)}`,
        `M${66 + step(o)} ${14 + step(o)} L${34 + step(o)} ${46 + step(o)}`,
    ])
    return [{d: lines.join(' '), colour: RED}]
}

/** A phase of a fire of 5.8.5: one to three red flames on a common base. */
function fire(phase: number): BoxPart[] {
    const left = 50 - phase * 7
    const flames = Array.from({length: phase}, (_, index) => `M${left + index * 14} 50 L${left + index * 14 + 14} 12 V50`).join(' ')
    return [{d: `${flames} M${left} 50 H${left + phase * 14}`, colour: RED}]
}

/** A tendency of 5.8.3: an arrow in a square. */
function tendency(from: [number, number], to: [number, number]): BoxPart[] {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1])
    return [{d: 'M30 10 H70 V50 H30 Z'}, {d: `M${from[0]} ${from[1]} L${to[0]} ${to[1]}`},
        ARROW_HEAD(to[0], to[1], (to[0] - from[0]) / length, (to[1] - from[1]) / length)]
}

/** Three of a weather mark side by side. */
function three(mark: (x: number) => string): BoxPart {
    return {d: [32, 50, 68].map(mark).join(' ')}
}

/** The stars of an administrative level of 5.7. */
function stars(level: number): BoxPart[] {
    const r = level === 6 ? 5 : 6
    return starOffsets(level).map(([dx, dy]) => ({d: asterisk(round(50 + dx * 1.4), round(30 + dy * 1.4), r)}))
}

/** The additional signs of chapter 5, keyed by a short English name, in the order of the recommendations. */
export const ADDITIONAL_SIGNS = {
    'advance': {number: '5.2.1', name: 'Richtung des Vortragens einer Maßnahme', page: 35,
        parts: [{d: 'M14 25 H74 M14 35 H74'}, {d: 'M68 16 L84 30 L68 44'}]},
    'movement-start': {number: '5.2.2', name: 'Beginn einer Bewegung', page: 35, parts: [{d: 'M16 20 V40 M16 30 H82'}, ARROW_HEAD(82, 30, 1, 0)]},
    'direction': {number: '5.2.3', name: 'Richtung, gerichtete Bewegung, Verbindung', page: 35, parts: [{d: 'M16 30 H82'}, ARROW_HEAD(82, 30, 1, 0)]},
    'two-ways': {number: '5.2.4', name: 'Bewegung in zwei Richtungen (z. B. Sichten, Ordnen, Verteilen)', page: 35,
        parts: [{d: 'M16 30 H84'}, ARROW_HEAD(84, 30, 1, 0), ARROW_HEAD(16, 30, -1, 0)]},
    'movement-end': {number: '5.2.5', name: 'Ende einer Bewegung', page: 35, parts: [{d: 'M16 30 H82 M84 20 V40'}, ARROW_HEAD(82, 30, 1, 0)]},
    'gathering': {number: '5.2.6', name: 'Sammeln, Zusammenführen', page: 35, parts: [{d: 'M14 30 H60'}, ARROW_HEAD(60, 30, 1, 0), {circle: [71, 30, 10]}]},

    'municipality': {number: '5.7.1', name: 'Gemeinde, kreisangehörige Stadt, Amt', page: 40, parts: stars(1)},
    'district': {number: '5.7.2', name: 'Kreis / Landkreis, kreisfreie Stadt', page: 40, parts: stars(2)},
    'region': {number: '5.7.3', name: 'Bezirk / Regierungspräsidium', page: 40, parts: stars(3)},
    'state': {number: '5.7.4', name: 'Bundesland / Freistaat', page: 40, parts: stars(4)},
    'nation': {number: '5.7.5', name: 'Nationalstaat', page: 40, parts: stars(5)},
    'european-union': {number: '5.7.6', name: 'Europäische Union', page: 40, parts: stars(6)},

    'rescue': {number: '5.8.1.1', name: 'Einsatztaktik: Retten', page: 41, parts: [red({d: 'M22 8 L14 12 V48 L22 52'}), blue(tacticArrow(24))]},
    'attack': {number: '5.8.1.2', name: 'Einsatztaktik: Angreifen', page: 41, parts: [blue(tacticArrow(14)), red({d: 'M76 8 L84 12 V48 L76 52'})]},
    'defend': {number: '5.8.1.3', name: 'Einsatztaktik: Verteidigen', page: 41, parts: [red(tacticArrow(12)), blue({d: 'M86 8 L76 14 V46 L86 52'})]},
    'retreat': {number: '5.8.1.4', name: 'Einsatztaktik: Rückzug', page: 41, parts: [red({d: 'M14 8 L22 12 V48 L14 52'}), blue(tacticArrow(30))]},
    'flooded': {number: '5.8.1.5', name: 'überschwemmtes Gebiet', page: 41, parts: [
        {d: 'M10 30 A40 26 0 1 0 90 30 A40 26 0 1 0 10 30 Z'}, waves(16, 32, 68), waves(46, 32, 68), waves(32, 16, 36), waves(32, 64, 84),
        {text: 'W', x: 50, y: 30, size: 16},
    ].map(blue)},
    'water-ingress': {number: '5.8.1.6', name: 'Gefahr durch Wassereinbruch', page: 41, parts: [TRIANGLE, waves(38, 36, 64), waves(46, 36, 64)].map(blue)},
    'dangerous-goods': {number: '5.8.1.7', name: 'gefährliche Stoffe, z. B. GS, Chlor', page: 41, parts: hazard({text: 'GS', x: 50, y: 42, size: 16})},
    'radioactivity': {number: '5.8.1.8', name: 'Gefahr durch Radioaktivität', page: 41, parts: hazard(
        {d: 'M50 40 L55.5 49.5 A11 11 0 0 1 44.5 49.5 Z M50 40 L55.5 30.5 A11 11 0 0 1 61 40 Z M50 40 L39 40 A11 11 0 0 1 44.5 30.5 Z', filled: true},
    )},
    'electricity': {number: '5.8.1.9', name: 'Gefahr durch elektrische Energie', page: 42,
        parts: hazard({d: 'M54 22 L46 38 H56 L49 52'}, ARROW_HEAD(49, 52, -0.45, 0.9))},
    'mineral-oil': {number: '5.8.1.10', name: 'Gefahr durch Mineralöl', page: 42, parts: hazard({text: 'Ö', x: 50, y: 42, size: 16})},
    'explosion': {number: '5.8.1.11', name: 'Gefahr durch Explosion', page: 42, parts: hazard({text: 'Ex', x: 50, y: 42, size: 16})},
    'explosives': {number: '5.8.1.12', name: 'Gefahr durch explosionsfähige Kampfmittel oder Explosivstoffe', page: 42,
        parts: hazard({circle: [50, 41, 4], filled: true}, {circle: [50, 41, 9]}, {d: 'M50 26 V29 M40 31 L42 33 M60 31 L58 33'})},
    'presumed': {number: '5.8.1.13', name: 'Hinweis auf Vermutung oder unbestätigte Information/Gefahr', page: 42,
        parts: [red({text: '?', x: 50, y: 30, size: 40})]},
    'acute': {number: '5.8.1.14', name: 'Hinweis auf akute Situation; aktuell größte Gefahr', page: 42, parts: [red({text: '!', x: 50, y: 30, size: 40})]},

    'activity-1': {number: '5.8.2.1', name: 'geringfügig erhöhte Aktivität; bis 25 % Ausfall; Einsatzwert bei 75 %', page: 43, parts: activity(1)},
    'activity-2': {number: '5.8.2.2', name: 'moderat erhöhte Aktivität; bis 50 % Ausfall; Einsatzwert bei 50 %', page: 43, parts: activity(2)},
    'activity-3': {number: '5.8.2.3', name: 'deutlich erhöhte Aktivität; bis 75 % Ausfall; Einsatzwert bei 25 %', page: 43, parts: activity(3)},
    'activity-4': {number: '5.8.2.4', name: 'stark erhöhte Aktivität; Totalausfall', page: 43, parts: activity(4)},
    'rising': {number: '5.8.3.1', name: 'Tendenz steigend / zunehmend / ausdehnend', page: 43, parts: tendency([36, 44], [64, 16])},
    'steady': {number: '5.8.3.2', name: 'Tendenz unverändert / gleichbleibend', page: 43, parts: tendency([36, 30], [64, 30])},
    'falling': {number: '5.8.3.3', name: 'Tendenz fallend / abnehmend / verkleinernd', page: 43, parts: tendency([36, 16], [64, 44])},
    'damaged': {number: '5.8.4.1', name: 'angeschlagen, beschädigt', page: 44, parts: destruction(1)},
    'partly-destroyed': {number: '5.8.4.2', name: 'teilzerstört, teilweise zusammengebrochen', page: 44, parts: destruction(2)},
    'destroyed': {number: '5.8.4.3', name: 'total zerstört, zusammengebrochen', page: 44, parts: destruction(3)},
    'incipient-fire': {number: '5.8.5.1', name: 'Entstehungsbrand', page: 44, parts: fire(1)},
    'developed-fire': {number: '5.8.5.2', name: 'fortentwickelter Brand', page: 44, parts: fire(2)},
    'full-fire': {number: '5.8.5.3', name: 'Vollbrand', page: 44, parts: fire(3)},

    'injured-animal': {number: '5.8.6.1', name: 'verletztes / erkranktes Tier', page: 45, parts: [VET, {d: 'M56 14 V40'}]},
    'contaminated-animal': {number: '5.8.6.2', name: 'kontaminiertes Tier', page: 45,
        parts: [VET, {d: 'M56 14 V40'}, {circle: [72, 4, 2.5], filled: true}, {circle: [84, 4, 2.5], filled: true}, {d: 'M72 4 L84 14 M84 4 L72 14'}]},
    'dead-animal': {number: '5.8.6.3', name: 'totes Tier', page: 45, parts: [VET, {d: 'M56 2 V30 M50 10 H62'}]},

    'sunny': {number: '5.8.7.1', name: 'sonnig', page: 45, parts: [{circle: [50, 30, 10]},
        {d: 'M50 8 V14 M50 46 V52 M28 30 H34 M66 30 H72 M35 15 L39 19 M65 15 L61 19 M35 45 L39 41 M65 45 L61 41'}]},
    'cloudy': {number: '5.8.7.2', name: 'wolkig', page: 45,
        parts: [{d: 'M28 46 H72 Q84 46 82 34 Q80 24 70 26 Q66 12 52 14 Q40 14 38 26 Q24 24 22 36 Q22 46 28 46 Z'}]},
    'cloud-cover': {number: '5.8.7.3', name: 'Bedeckungsgrad des Himmels in 1/8-Abstufungen, hier: 4/8 bewölkt', page: 45,
        parts: [{circle: [50, 30, 16]}, {d: 'M50 14 A16 16 0 0 1 50 46 Z', filled: true}]},
    'foggy': {number: '5.8.7.4', name: 'nebelig (ggf. in Kombination mit 5.8.7.2)', page: 45, parts: [{d: 'M26 22 H74 M26 30 H74 M26 38 H74'}]},
    'rainy': {number: '5.8.7.5', name: 'regnerisch (in Kombination mit 5.8.7.2)', page: 45,
        parts: [{d: [[38, 14], [54, 14], [70, 14], [34, 30], [50, 30], [66, 30], [30, 46], [46, 46], [62, 46]]
            .map(([x, y]) => `M${x! + 3} ${y! - 6} L${x! - 3} ${y! + 6}`).join(' ')}]},
    'hail': {number: '5.8.7.6', name: 'hagelnd (in Kombination mit 5.8.7.2)', page: 46,
        parts: [three(x => `M${x + 2} 8 L${x} 20 M${x} 40 L${x - 2} 52`), ...[32, 50, 68].map(x => ({circle: [x, 30, 4]} as BoxPart))]},
    'thunderstorm': {number: '5.8.7.7', name: 'gewittrig (in Kombination mit 5.8.7.2)', page: 46,
        parts: [three(x => `M${x + 4} 10 L${x - 4} 30 H${x + 4} L${x - 3} 48`), ...[32, 50, 68].map(x => ARROW_HEAD(x - 3, 48, -0.35, 0.94))]},
    'snowy': {number: '5.8.7.8', name: 'schneiend (in Kombination mit 5.8.7.2)', page: 46, parts: [three(x => asterisk(x, 30, 8))]},
    'temperature': {number: '5.8.7.9', name: 'Temperatur (frostig/kalt/heiß/extrem)', page: 46,
        parts: [{d: 'M44 38 V12 A6 6 0 0 1 56 12 V38 A9 9 0 1 1 44 38 Z'}, {d: 'M64 14 H74 M64 22 H74 M64 30 H74'}]},
    'windy': {number: '5.8.7.10', name: 'windig (ggf. ergänzt um die Stärke in der Anzahl der Striche oder in Beaufort oder km/h)', page: 46,
        parts: [{d: 'M18 40 H82 M22 40 L16 30 M30 40 L24 30 M38 40 L32 30'}, ARROW_HEAD(82, 40, 1, 0)]},

    'unharmed': {number: '5.8.8.1', name: 'unverletzt, exponiert', page: 47, parts: [PERSON]},
    'affected': {number: '5.8.8.2', name: 'betroffen', page: 47, parts: [PERSON, {text: 'B', x: 72, y: 10, size: 12}]},
    'injured': {number: '5.8.8.3', name: 'verletzt', page: 47, parts: [PERSON, {d: 'M50 8 V52'}]},
    'triage': {number: '5.8.8.4', name: 'verletzt, mit Angabe der Sichtungskategorie (SK I–IV)', page: 47,
        parts: [PERSON, {d: 'M50 8 V52'}, {text: 'II', x: 34, y: 52, size: 12}]},
    'transport-priority': {number: '5.8.8.5', name: 'verletzt, mit Transportpriorität', page: 47,
        parts: [PERSON, {d: 'M50 8 V52'}, {text: 'TP', x: 72, y: 10, size: 12}]},
    'contaminated': {number: '5.8.8.6', name: 'kontaminiert', page: 47,
        parts: [PERSON, {d: 'M50 8 V52'}, {circle: [64, 4, 2.5], filled: true}, {circle: [76, 4, 2.5], filled: true}, {d: 'M64 4 L76 14 M76 4 L64 14'}]},
    'dead': {number: '5.8.8.7', name: 'tot', page: 47, parts: [PERSON, {d: 'M50 8 V52 M39 19 H61'}]},
    'missing': {number: '5.8.8.8', name: 'vermisst', page: 47, parts: [PERSON, {d: 'M24 26 L46 4 M76 34 L54 56'}]},
    'in-water': {number: '5.8.8.9', name: 'in Wassergefahr', page: 47, parts: [DIAMOND(50, 34, 20), waves(8, 30, 70), waves(14, 30, 70)]},
    'trapped': {number: '5.8.8.10', name: 'in Zwangslage (verschüttet / eingeklemmt / eingeschlossen)', page: 47,
        parts: [DIAMOND(50, 34, 20), {d: 'M24 8 H76'}]},
    'rescued': {number: '5.8.8.11', name: 'gerettet / befreit', page: 48, parts: [RAISED, {d: 'M24 54 H76'}]},
    'awaiting-transport': {number: '5.8.8.12', name: 'zu transportieren, Transport noch ausstehend', page: 48,
        parts: [RAISED, {d: 'M28 54 H76 M28 48 V60'}, ARROW_HEAD(76, 54, 1, 0)]},
    'in-transport': {number: '5.8.8.13', name: 'Transport einer Person, aktuell', page: 48, parts: [RAISED, {d: 'M28 54 H76'}, ARROW_HEAD(76, 54, 1, 0)]},
    'transported': {number: '5.8.8.14', name: 'transportiert, Ziel der Bewegung erreicht', page: 48,
        parts: [RAISED, {d: 'M28 54 H76 M78 48 V60'}, ARROW_HEAD(76, 54, 1, 0)]},
    'special-care': {number: '5.8.8.15', name: 'besonders betreuungsbedürftig / unbegleitet / aufsichtspflichtig', page: 48,
        parts: [PERSON, {d: 'M50 8 L38 56 M50 8 L62 56'}]},
    'nursing-care': {number: '5.8.8.16', name: 'pflegebedürftig', page: 48, parts: [PERSON, {d: 'M38 18 V42'}]},
    'reduced-mobility': {number: '5.8.8.17', name: 'mobilitätseingeschränkt', page: 48, parts: [RAISED, {circle: [40, 54, 3]}, {circle: [60, 54, 3]}]},

    'road-closed': {number: '5.8.9.1', name: 'gesperrt (i. S. v. für Einsatzkräfte befahrbar)', page: 49, parts: [{d: 'M50 6 V54 M38 20 L62 40 M62 20 L38 40'}]},
    'one-way': {number: '5.8.9.2', name: 'Einbahnstraßenregelung', page: 49, parts: [{d: 'M44 6 V54 M56 12 V54 M56 12 L64 26'}]},
    'road-difficult': {number: '5.8.9.3', name: 'schwierig befahrbar / teilblockiert', page: 49, parts: [{d: 'M45 6 V54 M55 6 V54'}]},
    'road-blocked': {number: '5.8.9.4', name: 'nicht befahrbar / blockiert', page: 49, parts: [{d: 'M38 6 V54 M46 6 V54 M54 6 V54 M62 6 V54'}]},
} as const satisfies Record<string, AdditionalSign>

/** The short English name of an additional sign. */
export type AdditionalSignName = keyof typeof ADDITIONAL_SIGNS

/** An additional sign as an SVG tree on the common canvas, its box in the middle at its own size. */
export function additionalSignTree(name: AdditionalSignName): SvgElement {
    const sign: AdditionalSign = ADDITIONAL_SIGNS[name]
    return canvas([group(sign.parts.map(part => boxPart(part, BLACK)), {transform: 'translate(10 10)'})])
}

/** An additional sign as SVG markup. */
export function additionalSign(name: AdditionalSignName): string {
    return renderSvg(additionalSignTree(name))
}
