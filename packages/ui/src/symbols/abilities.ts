/**
 * The symbols of chapter 4 of the recommendations "Taktische Zeichen im Bevölkerungsschutz" (BBK,
 * 2024): what a unit, vehicle or place can do. Each is drawn on its own 100 × 60 box, which a sign
 * scales into the inside of its basic form; several abilities stack from the bottom up, the main
 * one lowest, as 6.1 asks. The drawings follow the system of the recommendations without copying
 * their artwork.
 */

import type {BoxPart} from './svg'

/** One stroke, filled shape or piece of writing of an ability, on the 100 × 60 box. */
export type AbilityPart = BoxPart

/** An ability of chapter 4 with its number, name after the recommendations and printed page. */
export interface Ability {
    number: string
    name: string
    page: number
    parts: readonly AbilityPart[]
    /** Spans the whole inside of the form, as annex C draws firefighting and the CBRN cross, instead of keeping its proportions. */
    stretch?: boolean
}

const CBRN: AbilityPart[] = [{circle: [34, 10, 6], filled: true}, {circle: [66, 10, 6], filled: true}, {d: 'M34 10 L68 54 M66 10 L32 54'}]
/** A wavy line at a height, from one x to another in waves of 10. */
export function waves(y: number, from = 30, to = 70): AbilityPart {
    const more = Math.max(0, Math.round((to - from) / 10) - 1)
    return {d: `M${from} ${y} q5 -5 10 0${' t10 0'.repeat(more)}`}
}
/** A diamond around a point. */
export const DIAMOND = (cx: number, cy: number, r: number): AbilityPart => ({d: `M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z`})
/** The V of veterinary care. */
export const VET: AbilityPart = {d: 'M36 6 H44 L56 54 L68 6 H76'}
/** An open arrow head at a point, pointing along (dx, dy). */
export const ARROW_HEAD = (x: number, y: number, dx: number, dy: number): AbilityPart => ({d: `M${x - dx * 6 - dy * 4} ${y - dy * 6 + dx * 4} L${x} ${y} L${x - dx * 6 + dy * 4} ${y - dy * 6 - dx * 4}`})

/** The abilities of chapter 4, keyed by a short English name. */
export const ABILITIES = {
    'cbrn': {number: '4.1.1', name: 'Abwehr gefährlicher Stoffe und Güter, ABC-/CBRN-Schutz', page: 22, parts: CBRN, stretch: true},
    'cbrn-measuring': {number: '4.1.2', name: 'Messen, Spüren, Detektieren', page: 22, parts: [...CBRN, {d: 'M14 46 L86 20'}], stretch: true},
    'decontamination': {number: '4.1.3', name: 'Dekontaminieren', page: 22, parts: [...CBRN, ARROW_HEAD(32, 54, -0.6, 0.8), ARROW_HEAD(68, 54, 0.6, 0.8)], stretch: true},
    'water-pollution': {number: '4.1.4', name: 'Beseitigen von Umweltschäden auf Gewässern', page: 22,
        parts: [{circle: [36, 6, 5], filled: true}, {circle: [64, 6, 5], filled: true}, {d: 'M36 6 L62 36 M64 6 L38 36'}, ARROW_HEAD(38, 36, -0.6, 0.8), ARROW_HEAD(62, 36, 0.6, 0.8), waves(46), waves(54)]},
    'water-treatment': {number: '4.1.5', name: 'Trinkwasseraufbereitung', page: 22,
        parts: [{d: 'M32 14 A20 20 0 0 0 36 50'}, {d: 'M64 10 A20 20 0 0 1 68 46'}, ARROW_HEAD(36, 50, 0.3, 1), ARROW_HEAD(68, 46, -0.2, 1), {d: 'M38 30 q4 -4 8 0 t8 0 t8 0 M40 38 H58 M54 38 V44'}]},
    'radiological': {number: '4.1.6', name: 'Atomare (radiologische/nukleare) Stoffe', page: 23,
        parts: [{circle: [50, 30, 4], filled: true}, {d: 'M50 38 L56 50 A21 21 0 0 1 44 50 Z M43 26 L30 26 A21 21 0 0 1 36 15 Z M57 26 L64 15 A21 21 0 0 1 70 26 Z', filled: true}]},
    'biological': {number: '4.1.7', name: 'Biologische Stoffe', page: 23,
        parts: [{circle: [50, 20, 12]}, {circle: [40, 38, 12]}, {circle: [60, 38, 12]}]},
    'chemical': {number: '4.1.8', name: 'Chemische Stoffe', page: 23, parts: [{d: 'M44 4 V22 L32 56 H68 L56 22 V4'}]},
    'care': {number: '4.2.1', name: 'Grundzeichen Betreuung', page: 23, parts: [{d: 'M30 56 L50 4 L70 56'}]},
    'psychosocial': {number: '4.2.2', name: 'Psychosoziale Notfallversorgung, Notfallbegleitung, Krisenintervention', page: 23,
        parts: [{d: 'M32 44 L50 4 L68 44'}, {text: 'PSNV', x: 50, y: 52, size: 12}]},
    'pastoral': {number: '4.2.3', name: 'Seelsorge (religiös/interkonfessionell)', page: 23, parts: [{d: 'M44 4 V56 M56 4 V56 M34 18 H66 M34 28 H66'}]},
    'rest': {number: '4.2.4', name: 'Temporäre (Not-)Unterbringung/Versorgung mit Ruhemöglichkeit (einschl. Sitzgelegenheiten)', page: 23,
        parts: [{d: 'M26 14 V50 M74 14 V50 M26 38 H74 M26 34 Q50 20 74 34'}]},
    'seating': {number: '4.2.5', name: 'Temporäre (Not-)Unterbringung/Versorgung mit Sitzgelegenheit', page: 24, parts: [{d: 'M40 6 V54 M40 28 H62 V54'}]},
    'firefighting': {number: '4.3.1', name: 'Brandbekämpfung, Löscheinsatz (einschl. Retten)', page: 24, parts: [{d: 'M4 30 H96 M66 30 L96 4 M66 30 L96 56'}], stretch: true},
    'extinguishing-water': {number: '4.3.2', name: 'Löschwasser, (Brauch-)Wasser', page: 24, parts: [{d: 'M26 34 q6 -12 12 0 t12 0 t12 0 t12 0'}]},
    'foam': {number: '4.3.3', name: 'Schaummittel', page: 24, parts: [{d: 'M38 16 H62 L50 44 Z', filled: true}]},
    'solid-agent': {number: '4.3.4', name: 'Sonderlöschmittel fest', page: 24, parts: [{d: 'M38 18 H62 V42 H38 Z', filled: true}]},
    'gaseous-agent': {number: '4.3.5', name: 'Sonderlöschmittel gasförmig', page: 24, parts: [{circle: [50, 30, 11], filled: true}]},
    'breathing-protection': {number: '4.3.6', name: 'Atemschutz (umluftunabhängig)', page: 24,
        parts: [{d: 'M42 6 H58 V38 Q58 46 50 48 Q42 46 42 38 Z M50 48 V52'}, {circle: [50, 55, 3]}]},
    'reconnaissance': {number: '4.4.1', name: 'Erkunden, Beobachten, Überwachen', page: 24, parts: [{d: 'M24 54 L76 6'}], stretch: true},
    'locating-biological': {number: '4.4.2', name: 'Orten, biologisch', page: 25,
        parts: [{d: 'M20 46 L34 22 M34 46 L20 22 M27 22 H64 M58 46 L64 22 L70 46 M64 22 L76 8 L82 22 Z'}]},
    'locating-technical': {number: '4.4.3', name: 'Orten, technisch', page: 25,
        parts: [{d: 'M26 30 Q34 6 58 12'}, {d: 'M34 34 L48 46 L52 36 L72 54'}, ARROW_HEAD(72, 54, 0.7, 0.7)]},
    'salvage': {number: '4.5.1', name: 'Bergen, Bergung', page: 25, parts: [{d: 'M20 18 H34 A16 16 0 0 0 66 18 H80'}]},
    'ladder': {number: '4.5.2', name: 'Retten aus Höhen und Tiefen mit tragbaren Leitern', page: 25, parts: [{d: 'M40 4 V56 M60 4 V56 M40 16 H60 M40 30 H60 M40 44 H60'}]},
    'turntable-ladder': {number: '4.5.3', name: 'Retten aus Höhen und Tiefen mit Drehleiter', page: 25, parts: [{d: 'M28 56 L60 24 M60 12 H74 V26 H60 Z'}]},
    'aerial-platform': {number: '4.5.4', name: 'Retten aus Höhen und Tiefen mit Hubarbeitsbühne/Teleskopgelenkmast', page: 25,
        parts: [{d: 'M30 56 L36 34 L60 26 M60 12 H74 V26 H60 Z'}]},
    'boats': {number: '4.5.5', name: 'Einsatz von Wasserfahrzeugen', page: 25,
        parts: [{d: 'M42 24 H58 A8 8 0 0 1 42 24'}, waves(26, 22, 38), waves(26, 62, 78), waves(32, 22, 38), waves(32, 62, 78)]},
    'mountain-rescue': {number: '4.5.6', name: 'Bergrettung', page: 25, parts: [DIAMOND(50, 18, 12), {d: 'M50 32 L62 54 H38 Z', filled: true}]},
    'special-rescue': {number: '4.5.7', name: 'Spezielle Rettung aus Höhen und Tiefen', page: 25,
        parts: [DIAMOND(50, 30, 12), {d: 'M50 16 V4 M50 44 V56'}, ARROW_HEAD(50, 4, 0, -1), ARROW_HEAD(50, 56, 0, 1)]},
    'water-rescue': {number: '4.5.8', name: 'Wasserrettung (einschl. Tauchen)', page: 25, parts: [waves(10), waves(18), DIAMOND(50, 40, 14)]},
    'medical': {number: '4.6.1', name: 'Grundzeichen Sanität', page: 26, parts: [{d: 'M50 4 V56 M24 30 H76'}]},
    'nursing': {number: '4.6.2', name: 'Pflege', page: 26, parts: [{d: 'M50 4 V56 M24 30 H76 M36 24 V36'}]},
    'emergency-medicine': {number: '4.6.3', name: 'Rettungswesen, Intensivmedizin/Notfallmedizin', page: 26, parts: [{d: 'M50 4 V56 M24 30 H76 M64 24 V36'}]},
    'doctors': {number: '4.6.4', name: 'Arztwesen', page: 26, parts: [{d: 'M50 4 V56 M24 30 H76 M44 46 H56'}]},
    'patient-transport': {number: '4.6.5', name: 'Patiententransport', page: 26,
        parts: [{circle: [50, 30, 14]}, {d: 'M40 20 L60 40 M60 20 L40 40 M50 4 V56 M24 30 H76'}]},
    'hospital': {number: '4.6.6', name: 'Krankenhaus, stationäre Versorgung', page: 26,
        parts: [{d: 'M24 20 L50 6 L76 20 V56 H24 Z M24 20 H76 M24 38 H76 M37 28 V48 M50 28 V48 M63 28 V48'}]},
    'flood-defence': {number: '4.7.1', name: 'Abwehr von Wassergefahren, Deichverteidigung', page: 26,
        parts: [waves(14, 26, 46), waves(20, 26, 46), {d: 'M26 52 H44 L56 16 H70 L74 28'}]},
    'excavator': {number: '4.7.2', name: 'Baggerarbeiten', page: 26, parts: [{d: 'M32 56 L44 16 L58 8 L72 20 L66 28'}]},
    'lighting': {number: '4.7.3', name: 'Beleuchten', page: 27, parts: [{d: 'M42 56 V16 Q42 6 54 8'}, {circle: [58, 16, 7]}]},
    'ventilating': {number: '4.7.4', name: 'Belüften', page: 27, parts: [{d: 'M24 12 Q44 12 50 26 H76 M24 48 Q44 48 50 34 H76 M50 4 V20 M50 40 V56'}, ARROW_HEAD(76, 26, 1, 0), ARROW_HEAD(76, 34, 1, 0)]},
    'extracting': {number: '4.7.5', name: 'Entlüften', page: 27, parts: [{d: 'M24 26 H50 Q56 12 76 12 M24 34 H50 Q56 48 76 48 M50 4 V20 M50 40 V56'}, ARROW_HEAD(76, 12, 1, 0), ARROW_HEAD(76, 48, 1, 0)]},
    'ordnance-disposal': {number: '4.7.6', name: 'Entschärfen, Kampfmittelräumung', page: 27,
        parts: [{circle: [50, 30, 18]}, {circle: [50, 30, 10], filled: true}, {d: 'M50 6 V12 M50 48 V54 M26 30 H32 M68 30 H74'}]},
    'hand-tools': {number: '4.7.7', name: 'Einsatz von Handwerkzeugen/Handarbeit', page: 27,
        parts: [{d: 'M32 8 L68 52 M68 8 L32 52'}, {d: 'M26 4 L38 10 L34 16 Z', filled: true}, {d: 'M70 4 Q80 8 74 16 Q66 14 70 4 Z', filled: true}]},
    'forklift': {number: '4.7.8', name: 'Hebearbeit, Umschlagen von Lasten', page: 27, parts: [{d: 'M40 4 V56 M46 10 V48 H66'}]},
    'crane': {number: '4.7.9', name: 'Hebearbeit, Heben von Lasten', page: 27, parts: [{d: 'M38 56 V8 H62 V16 Q62 22 56 20'}]},
    'lifting': {number: '4.7.10', name: '(An-)Heben von Personen oder Lasten', page: 27, parts: [DIAMOND(50, 38, 12), {d: 'M50 26 V6'}, ARROW_HEAD(50, 6, 0, -1)]},
    'telehandler': {number: '4.7.11', name: 'Kombinationsarbeit Heben/Räumen', page: 27, parts: [{d: 'M28 56 L56 24 H72 M56 24 V12'}]},
    'manipulating': {number: '4.7.12', name: '(Fern-)Manipulieren, mechanisch/mit Greifwerkzeug', page: 27, parts: [{d: 'M24 30 H50 L62 18 L72 22 M50 30 L62 42 L72 38'}]},
    'chainsaw': {number: '4.7.13', name: 'Motorsägearbeiten', page: 27,
        parts: [{d: 'M36 20 H68 Q76 20 76 30 Q76 40 68 40 H36 Z M36 24 H30 V36 H36'}]},
    'pumping': {number: '4.7.14', name: 'Pumpen, Lenzen, Beseitigen von Wasserschäden', page: 28,
        parts: [{circle: [50, 30, 12]}, {d: 'M50 18 Q60 8 68 14 M62 30 Q72 40 66 48 M50 42 Q40 52 32 46 M38 30 Q28 20 34 12'}]},
    'clearing': {number: '4.7.15', name: 'Räumarbeiten mit Maschine', page: 28, parts: [{d: 'M26 40 H54 M54 26 V40 H74'}]},
    'protection': {number: '4.7.16', name: 'Sicherheit, Schutz vor Einwirkungen', page: 28, parts: [{d: 'M36 8 Q50 2 64 8 V34 Q64 50 50 56 Q36 50 36 34 Z'}]},
    'blasting': {number: '4.7.17', name: 'Sprengen, Sprengkörper, Blindgänger', page: 28, parts: [{d: 'M42 6 H58 V36 Q58 54 50 56 Q42 54 42 36 Z', filled: true}]},
    'technical-rescue': {number: '4.7.18', name: 'Technische Hilfeleistung (einschl. Retten)', page: 28,
        parts: [{d: 'M38 24 H62 V36 H38 Z M38 30 H28 L20 22 M28 30 L18 36 M22 26 L16 30 M62 30 H72 L80 22 M72 30 L82 38'}]},
    'transporting': {number: '4.7.19', name: 'Transportieren', page: 28,
        parts: [{circle: [50, 30, 22]}, {d: 'M50 8 V52 M28 30 H72 M34 14 L66 46 M66 14 L34 46'}]},
    'door-opening': {number: '4.7.20', name: 'Türöffnung', page: 28, parts: [{d: 'M38 6 H62 V54 H38 Z M38 6 L50 12 V58 L38 54'}]},
    'heights': {number: '4.7.21', name: 'Höhenunterschiede überwinden', page: 28,
        parts: [{d: 'M50 10 H74 M50 10 V50 M26 50 H50'}, ARROW_HEAD(50, 50, 0, 1), ARROW_HEAD(50, 10, 0, -1)]},
    'securing': {number: '4.7.22', name: 'Absicherung', page: 28, parts: [{d: 'M30 54 H70 L56 6 H44 Z M40 22 H60 M36 38 H64'}]},
    'optical-warning': {number: '4.7.23', name: 'Warnen/Informieren mit optischen Anzeigen', page: 28,
        parts: [{d: 'M30 8 H70 V44 H30 Z M50 44 V52 M40 52 H60'}, {text: 'i', x: 50, y: 27, size: 22}]},
    'loudspeaker': {number: '4.7.24', name: 'Warnen mit Lautsprecherdurchsagen', page: 28,
        parts: [{d: 'M30 22 H40 L58 10 V50 L40 38 H30 Z M64 20 Q70 30 64 40 M70 14 Q80 30 70 46'}]},
    'siren': {number: '4.7.25', name: 'Warnen mit Sirene', page: 28, parts: [{d: 'M28 24 Q50 0 72 24 Z M50 24 V56'}]},
    'water-conveying': {number: '4.7.26', name: 'Wasserförderung', page: 29, parts: [{d: 'M30 22 q5 -8 10 0 t10 0 t10 0 M26 38 H74'}, {circle: [26, 38, 3]}, ARROW_HEAD(74, 38, 1, 0)]},
    'water-retention': {number: '4.7.27', name: 'Wasserrückhaltung, Wasserbevorratung', page: 29, parts: [{d: 'M28 52 H72 V12 M34 30 q4 -8 8 0 t8 0 t8 0 t8 0'}]},
    'pulling': {number: '4.7.28', name: 'Ziehen von Lasten', page: 29, parts: [{d: 'M24 18 H44 V42 H24 Z M44 30 H76'}, ARROW_HEAD(76, 30, 1, 0)]},
    'container': {number: '4.8.1', name: '(Transport-)Behälter', page: 29, parts: [{d: 'M30 6 V54 H70 V6'}]},
    'consumables': {number: '4.8.2', name: 'Betriebsstoffe und Verbrauchsgüter', page: 29, parts: [{d: 'M30 6 H70 L54 24 V56 M46 56 V24 L30 6'}]},
    'bridge': {number: '4.8.3', name: 'Brücke/Übergang, Übergabe', page: 29, parts: [{d: 'M24 10 L32 18 H68 L76 10 M24 50 L32 42 H68 L76 50'}]},
    'temporary-bridge': {number: '4.8.4', name: 'Behelfsbrückenbau', page: 29,
        parts: [{d: 'M24 6 L32 12 H68 L76 6 M24 30 L32 24 H68 L76 30'}, {d: 'M38 56 V40 H62 V56 M50 40 V56', width: 5}]},
    'disposal': {number: '4.8.5', name: 'Entsorgung', page: 29, parts: [{d: 'M36 12 H64 M46 8 H54 M38 12 V54 H62 V12 M44 20 V48 M50 20 V48 M56 20 V48'}]},
    'maintenance': {number: '4.8.6', name: 'Instandhaltung, Instandsetzung, materielle Infrastruktur', page: 29,
        parts: [{d: 'M28 16 Q38 30 28 44 M38 30 H62 M72 16 Q62 30 72 44'}]},
    'sandbag': {number: '4.8.7', name: 'Sandsack', page: 29, parts: [{d: 'M44 6 H56 L54 12 Q66 16 64 34 Q64 54 50 56 Q36 54 36 34 Q34 16 46 12 Z'}]},
    'sandbag-filling': {number: '4.8.8', name: 'Sandsackbefüllung', page: 30, parts: [{d: 'M30 54 V6 H70 V54 M30 6 L42 22 H58 L70 6 M42 22 V34 H58 V22'}]},
    'shower': {number: '4.8.9', name: 'Sanitäre Einrichtung, Dusch-, Waschmöglichkeit(en)', page: 30,
        parts: [{d: 'M58 54 V16 Q58 6 48 6 Q38 6 38 16 M32 16 H44 M34 24 V30 M38 24 V30 M42 24 V30'}]},
    'toilets': {number: '4.8.10', name: 'Sanitäre Einrichtung, WC/sanitäre Anlagen', page: 30, parts: [{text: 'WC', x: 50, y: 32, size: 26}]},
    'power': {number: '4.8.11', name: 'Stromversorgung', page: 30, parts: [{d: 'M56 4 L40 30 L58 30 L44 56'}, ARROW_HEAD(44, 56, -0.5, 1)]},
    'drinking-water': {number: '4.8.12', name: 'Trinkwasser', page: 30, parts: [{d: 'M24 26 H66 Q74 26 74 36 M50 26 V20 M44 20 H56'}]},
    'catering': {number: '4.8.13', name: 'Verpflegung', page: 30, parts: [{d: 'M68 18 A18 18 0 1 0 68 42 L50 30 Z'}]},
    'cooking': {number: '4.8.14', name: 'Zubereiten von Verpflegung', page: 30,
        parts: [{d: 'M74 18 A18 18 0 1 0 74 42 L56 30 Z'}, {d: 'M30 6 Q38 6 38 16 Q38 24 32 26 V56 H28 V26 Q22 24 22 16 Q22 6 30 6 Z', filled: true}]},
    'tent': {number: '4.8.15', name: 'Zelt, Schnelleinsatzzelt', page: 30, parts: [{d: 'M30 56 V22 L40 8 H60 L70 22 V56'}]},
    'pole-tent': {number: '4.8.16', name: 'Zelt, Stangengerüstzelt', page: 30, parts: [{d: 'M26 56 L54 8 M74 56 L46 8 M26 56 H74'}]},
    'communication': {number: '4.9.1', name: 'Information und Kommunikation (IuK)/Fernmeldewesen', page: 30, parts: [{d: 'M24 16 L44 44 L52 22 L76 50'}]},
    'veterinary': {number: '4.10.1', name: 'Veterinärwesen', page: 31, parts: [VET]},
    'slaughtering': {number: '4.10.2', name: '(Not-)Schlachten, Keulen', page: 31, parts: [{d: 'M24 26 H76 M24 40 L30 30 L36 40 Z'}]},
    'poultry': {number: '4.10.3', name: 'Geflügel', page: 31, parts: [VET, {d: 'M30 52 V42 L34 46 L36 38 L40 46 L44 40 V52 Z'}]},
    'horses': {number: '4.10.4', name: 'Pferd', page: 31, parts: [VET, {d: 'M28 52 H32 V46 A6 6 0 1 1 40 46 V52 H44'}]},
    'cattle': {number: '4.10.5', name: 'Rind', page: 31, parts: [VET, {d: 'M28 44 L32 52 L36 44 L40 52 L44 44'}]},
    'sheep': {number: '4.10.6', name: 'Schaf', page: 31, parts: [VET, {d: 'M28 48 q2 -8 8 -6 q6 -4 8 4 q4 6 -2 10 q-6 4 -10 0 q-6 0 -4 -8 Z'}]},
    'pigs': {number: '4.10.7', name: 'Schwein', page: 31, parts: [VET, {d: 'M26 48 A10 7 0 1 0 46 48 A10 7 0 1 0 26 48 Z'}, {circle: [32, 48, 2], filled: true}, {circle: [40, 48, 2], filled: true}]},
} as const satisfies Record<string, Ability>

/** An ability of chapter 4. */
export type AbilityName = keyof typeof ABILITIES
