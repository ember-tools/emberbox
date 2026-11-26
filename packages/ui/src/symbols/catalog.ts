import {ABILITIES, type AbilityName} from './abilities'
import {tacticalSignTree, type TacticalSignSpec} from './signs'
import type {SvgElement} from './svg'
import {markSymbolTree, type MarkKind} from './tactical'

/**
 * One sign of the catalogue: its number and name after the recommendations "Taktische Zeichen im
 * Bevölkerungsschutz" (BBK, 2024), shortened where the printed name runs on, the printed page it is
 * on, and how the library draws it. Numbers repeat in a few places of the recommendations (5.1.1
 * and 5.1.2 name both a vehicle and a section), so `id` is what tells entries apart.
 *
 * A few signs the library draws are not part of the recommendations, such as the marks of the
 * water supply; they carry `recommended: false`, no page and a number of their own, and should not
 * be asked about as if they were.
 */
export interface CatalogEntry {
    id: string
    number: string
    name: string
    page?: number
    recommended: boolean
    drawing: {sign: TacticalSignSpec} | {mark: MarkKind}
}

/** The source the catalogue follows, to be named wherever its signs are shown. */
export const CATALOG_SOURCE = 'Bundesamt für Bevölkerungsschutz und Katastrophenhilfe (BBK): Taktische Zeichen im Bevölkerungsschutz – '
    + 'Empfehlungen zur Einführung einer FwDV 102/DV 102, Stand Mai 2024, ISBN 978-3-949117-29-9'

function entry(number: string, name: string, page: number, sign: TacticalSignSpec, id = number): CatalogEntry {
    return {id, number, name, page, recommended: true, drawing: {sign}}
}

function ownMark(number: string, name: string, mark: MarkKind): CatalogEntry {
    return {id: number, number, name, recommended: false, drawing: {mark}}
}

/** The drawing of a catalogue entry as a tree of SVG elements. */
export function catalogSignTree(entry: CatalogEntry): SvgElement {
    return 'sign' in entry.drawing ? tacticalSignTree(entry.drawing.sign) : markSymbolTree(entry.drawing.mark)
}

const FIRE = {organisation: 'fire'} as const

/**
 * The signs of chapters 1 to 4, 5.1, 5.4, 5.5 and annex C of the recommendations, in their order,
 * then the library's own water supply marks. Chapter 1 is drawn black on white as printed, chapter 4
 * on a plain formation; colours are shown on a tactical formation, supplements, vehicles and sizes
 * in fire service red. Letters that annex C writes inside a symbol ("P", "G", "ATF") stand in field A
 * here, and the flying line of C.1.13 sits under the form as in 5.1.4.
 */
export const TACTICAL_SIGN_CATALOG: readonly CatalogEntry[] = [
    entry('1.1', 'Taktische Formation', 14, {form: 'formation'}),
    entry('1.2', 'Person', 14, {form: 'person'}),
    entry('1.3', 'Landfahrzeug', 14, {form: 'land-vehicle'}),
    entry('1.4', 'Luftfahrzeug', 14, {form: 'aircraft'}),
    entry('1.5', 'Wasserfahrzeug', 14, {form: 'watercraft'}),
    entry('1.6', 'Stelle, Platz, Einrichtung', 14, {form: 'place'}),
    entry('1.7', 'Gebäude', 14, {form: 'building'}),
    entry('1.8', 'Raum, Behälter, Ressource, Grundzeichen für Funkgeräte', 14, {form: 'room'}),
    entry('1.9', 'Gebiet, Fläche, Bereich', 15, {form: 'area'}),
    entry('1.10', 'Maßnahme', 15, {form: 'measure'}),
    entry('1.11', 'Gefahr', 15, {form: 'hazard'}),
    entry('1.12', 'Markanter Punkt/Markierung', 15, {form: 'landmark'}),
    entry('1.13', 'Ereignis', 15, {form: 'event'}),
    entry('1.14', 'Spontanhelfer', 15, {form: 'volunteer', organisation: 'civil'}),
    entry('2.1', 'Feuerwehr', 16, {form: 'formation', organisation: 'fire', abbreviation: true}),
    entry('2.2', '(Hilfs-)Organisationen', 16, {form: 'formation', organisation: 'aid', abbreviation: true}),
    entry('2.3', 'Technisches Hilfswerk', 16, {form: 'formation', organisation: 'thw', abbreviation: true}),
    entry('2.4', 'Führung, Leitung', 17, {form: 'formation', organisation: 'command'}),
    entry('2.5', 'Polizei', 17, {form: 'formation', organisation: 'police', abbreviation: true}),
    entry('2.6', 'Bundeswehr', 17, {form: 'formation', organisation: 'military', abbreviation: true}),
    entry('2.7', 'Sonstige Gefahrenabwehr', 17, {form: 'formation', organisation: 'other', abbreviation: true}),
    entry('2.8', 'Zivile Einheiten/ungebundene Kräfte', 17, {form: 'formation', organisation: 'civil', abbreviation: true}),
    entry('3.1', 'Schwerpunkt Einsatzführung (Balken oben)', 20, {form: 'formation', ...FIRE, supplements: ['command']}),
    entry('3.2', 'Person mit Sonderfunktion (Litze)', 20, {form: 'person', ...FIRE, supplements: ['special-function']}),
    entry('3.3', 'Schwerpunkt Versorgung, Entsorgung, Logistik (Balken unten)', 20, {form: 'formation', ...FIRE, supplements: ['logistics']}),
    entry('3.4', 'Drohne, unbemannt', 20, {form: 'aircraft', ...FIRE, supplements: ['uncrewed']}),
    entry('3.5', 'Zweirad, Fahrrad', 20, {form: 'formation', ...FIRE, supplements: ['bicycle']}),
    entry('3.6', 'Zweirad, Kraftrad', 21, {form: 'formation', ...FIRE, supplements: ['motorcycle']}),
    entry('3.7', 'Temporär ortsfeste Struktur (mit festem Dach)', 21, {form: 'place', ...FIRE, supplements: ['roof']}),
    ...Object.entries(ABILITIES).map(([name, ability]) => entry(ability.number, ability.name, ability.page, {form: 'formation', abilities: [name as AbilityName]})),
    entry('5.1.1', 'Fahrzeug, ungeschützt', 32, {form: 'land-vehicle', ...FIRE}, '5.1.1-unprotected'),
    entry('5.1.2', 'Fahrzeug, geschützt', 32, {form: 'land-vehicle', ...FIRE, protected: true}, '5.1.2-protected'),
    entry('5.1.1.1', 'Kraftfahrzeug, straßenfähig (Kategorie 1)', 32, {form: 'land-vehicle', ...FIRE, drive: 'road'}),
    entry('5.1.1.2', 'Kraftfahrzeug, geländefähig (Kategorie 2)', 32, {form: 'land-vehicle', ...FIRE, drive: 'offroad'}),
    entry('5.1.1.3', 'Kraftfahrzeug, geländegängig (Kategorie 3)', 32, {form: 'land-vehicle', ...FIRE, drive: 'all-terrain'}),
    entry('5.1.1.4', 'Amphibienfahrzeug', 32, {form: 'land-vehicle', ...FIRE, drive: 'amphibious'}),
    entry('5.1.1.5', 'Kettenfahrzeug', 33, {form: 'land-vehicle', ...FIRE, drive: 'tracked'}),
    entry('5.1.1.6', 'Schienenfahrzeug', 33, {form: 'land-vehicle', ...FIRE, drive: 'rail'}),
    entry('5.1.1.7', 'Kraftfahrzeug, aufgleisbar', 33, {form: 'land-vehicle', ...FIRE, drive: 'rail-capable'}),
    entry('5.1.1.8', 'Kraftfahrzeug, straßenfähig, Typ Wechsellader', 33, {form: 'land-vehicle', ...FIRE, body: 'swap-loader', drive: 'road'}),
    entry('5.1.1.9', 'Kraftfahrzeug, straßenfähig, Typ Wechselbehälter/Container', 33, {form: 'formation', ...FIRE, body: 'container-carrier', drive: 'road'}),
    entry('5.1.2.1', 'Anhänger, allgemein', 33, {form: 'land-vehicle', ...FIRE, body: 'trailer'}),
    entry('5.1.2.2', 'Anhänger, Typ Abrollbehälter', 33, {form: 'land-vehicle', ...FIRE, body: 'roll-off-trailer'}),
    entry('5.1.2.3', 'Anhänger, Typ Wechselbehälter/Container', 33, {form: 'formation', ...FIRE, body: 'container-trailer'}),
    entry('5.1.2.4', 'Anhänger, von PKW gezogen', 33, {form: 'land-vehicle', ...FIRE, body: 'trailer', drive: 'towed-by-car'}),
    entry('5.1.2.5', 'Anhänger, von LKW gezogen', 33, {form: 'land-vehicle', ...FIRE, body: 'trailer', drive: 'towed-by-truck'}),
    entry('5.1.3.1', 'Abrollbehälter', 34, {form: 'land-vehicle', ...FIRE, body: 'roll-off-container'}),
    entry('5.1.3.2', 'Wechselbehälter/Container', 34, {form: 'formation', ...FIRE, body: 'swap-container'}),
    entry('5.1.3.3', 'Wechselbrücke', 34, {form: 'formation', ...FIRE, body: 'swap-body'}),
    entry('5.1.3.4', 'Behälter zieh-/schiebbar (z. B. Rollcontainer)', 34, {form: 'land-vehicle', ...FIRE, body: 'roll-container'}),
    entry('5.1.4.1', 'Einsatz von Luftfahrzeugen/Fliegen allgemein', 34, {form: 'aircraft', ...FIRE, flight: 'flying'}),
    entry('5.1.4.2', 'Drehflügler/Hubschrauber', 34, {form: 'aircraft', ...FIRE, flight: 'rotary-wing'}),
    entry('5.1.4.3', 'Flächenflügler/Flugzeug', 34, {form: 'aircraft', ...FIRE, flight: 'fixed-wing'}),
    entry('5.4.1', 'Trupp/selbstständiger Trupp', 37, {form: 'formation', ...FIRE, size: 'squad'}),
    entry('5.4.2', 'Staffel', 37, {form: 'formation', ...FIRE, size: 'section'}),
    entry('5.4.3', 'Gruppe', 37, {form: 'formation', ...FIRE, size: 'group'}),
    entry('5.4.4', 'Zug', 37, {form: 'formation', ...FIRE, size: 'platoon'}),
    entry('5.5.1', 'Bereitschaft (Verband I)', 37, {form: 'formation', ...FIRE, size: 'association-1'}),
    entry('5.5.2', 'Abteilung (Verband II)', 37, {form: 'formation', ...FIRE, size: 'association-2'}),
    entry('5.5.3', 'Großverband (Verband III)', 37, {form: 'formation', ...FIRE, size: 'association-3'}),
    entry('C.1.1', 'Löschstaffel (Staffellöschfahrzeug)', 71, {form: 'formation', ...FIRE, size: 'section', abilities: ['firefighting']}),
    entry('C.1.2', 'Löschgruppe (Löschgruppenfahrzeug)', 71, {form: 'formation', ...FIRE, size: 'group', abilities: ['firefighting']}),
    entry('C.1.3', 'Löschzug einer Feuerwehr', 71, {form: 'formation', ...FIRE, size: 'platoon', abilities: ['firefighting']}),
    entry('C.1.4', 'Rüstzug einer Feuerwehr', 71, {form: 'formation', ...FIRE, size: 'platoon', abilities: ['technical-rescue']}),
    entry('C.1.5', 'Fachzug', 71, {form: 'formation', ...FIRE, size: 'platoon', designation: 'FZ-'}),
    entry('C.1.6', 'Fachdienst Brandschutz', 71, {form: 'formation', ...FIRE, size: 'association-1', abilities: ['firefighting'], designation: 'FD'}),
    entry('C.1.7', 'CBRN-Erkundungstrupp (CBRN-ErkKW)', 71, {form: 'formation', ...FIRE, size: 'squad', abilities: ['cbrn-measuring']}),
    entry('C.1.8', 'Staffel Dekontamination von Personal (GW-Dekon P)', 71, {form: 'formation', ...FIRE, size: 'section', abilities: ['decontamination'], designation: 'P'}),
    entry('C.1.9', 'ABC-Erkundungsgruppe einer Feuerwehr', 71, {form: 'formation', ...FIRE, size: 'group', abilities: ['cbrn-measuring']}),
    entry('C.1.10', 'Dekontaminationsgruppe Gerät einer Feuerwehr', 71, {form: 'formation', ...FIRE, size: 'group', abilities: ['decontamination'], designation: 'G'}),
    entry('C.1.11', 'Gefahrstoffzug/ABC-Zug/CBRN-Zug einer Feuerwehr', 72, {form: 'formation', ...FIRE, size: 'platoon', abilities: ['cbrn']}),
    entry('C.1.12', 'Analytische Task Force (ATF)', 72, {form: 'formation', ...FIRE, size: 'platoon', abilities: ['cbrn-measuring'], designation: 'ATF'}),
    entry('C.1.13', 'Flugdrohnentrupp einer Feuerwehr', 72, {form: 'formation', ...FIRE, size: 'squad', supplements: ['uncrewed'], flight: 'flying'}),
    entry('C.1.14', 'Drohnentrupp einer Feuerwehr (allgemein)', 72, {form: 'formation', ...FIRE, size: 'squad', supplements: ['uncrewed']}),
    entry('C.1.15', 'Tauchergruppe einer Feuerwehr', 72, {form: 'formation', ...FIRE, size: 'group', abilities: ['water-rescue']}),
    entry('C.2.1', 'Kommandowagen', 72, {form: 'land-vehicle', ...FIRE, drive: 'road', supplements: ['command'], designation: 'KdoW'}),
    entry('C.2.2', 'Einsatzleitwagen 1', 72, {form: 'land-vehicle', ...FIRE, drive: 'road', supplements: ['command'], designation: 'ELW 1'}),
    entry('C.2.3', 'Einsatzleitwagen 2', 72, {form: 'land-vehicle', ...FIRE, drive: 'road', supplements: ['command'], designation: 'ELW 2'}),
    entry('C.2.4', 'Tragkraftspritzenfahrzeug', 72, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: 'TSF'}),
    entry('C.2.5', 'Tragkraftspritzenfahrzeug mit Wasser', 72, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: 'TSF-W'}),
    entry('C.2.6', 'Kleinlöschfahrzeug', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: 'KLF'}),
    entry('C.2.7', 'Mittleres Löschfahrzeug', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: 'MLF'}),
    entry('C.2.8', '(Hilfeleistungs-)Löschfahrzeug 10', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: '(H)LF 10'}),
    entry('C.2.9', '(Hilfeleistungs-)Löschfahrzeug 20', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: '(H)LF 20'}),
    entry('C.2.10', 'Löschgruppenfahrzeug 20 Katastrophenschutz', 73, {form: 'land-vehicle', ...FIRE, drive: 'offroad', abilities: ['firefighting'], designation: 'LF 20 KatS'}),
    entry('C.2.11', 'Tanklöschfahrzeug 2.000', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: 'TLF 2.000'}),
    entry('C.2.12', 'Tanklöschfahrzeug 3.000', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: 'TLF 3.000'}),
    entry('C.2.13', 'Tanklöschfahrzeug 4.000', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['firefighting'], designation: 'TLF 4.000'}),
    entry('C.2.14', 'Automatikdrehleiter mit Rettungskorb 12/9', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['turntable-ladder'], designation: 'DLAK 12/9'}),
    entry('C.2.15', 'Automatikdrehleiter mit Rettungskorb 18/12', 73, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['turntable-ladder'], designation: 'DLAK 18/12'}),
    entry('C.2.16', 'Automatikdrehleiter mit Rettungskorb 23/12', 74, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['turntable-ladder'], designation: 'DLAK 23/12'}),
    entry('C.2.17', 'Hubarbeitsbühne (HAB) oder Teleskopgelenkmast (TGM)', 74, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['aerial-platform'], designation: 'HAB'}),
    entry('C.2.18', 'Rüstwagen', 74, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['technical-rescue']}),
    entry('C.2.19', 'Wechselladerfahrzeug', 74, {form: 'land-vehicle', ...FIRE, drive: 'road', body: 'swap-loader'}),
    entry('C.2.20', 'Gerätewagen Gefahrgut', 74, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['cbrn'], designation: 'GW-G'}),
    entry('C.2.21', 'Gerätewagen Logistik 1', 74, {form: 'land-vehicle', ...FIRE, drive: 'road', supplements: ['logistics'], designation: 'GW-L1'}),
    entry('C.2.22', 'Gerätewagen Logistik 2', 74, {form: 'land-vehicle', ...FIRE, drive: 'road', supplements: ['logistics'], designation: 'GW-L2'}),
    entry('C.2.23', 'Mannschaftstransportfahrzeug, 9-sitzig', 75, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['transporting'], designation: 'MTF'}),
    entry('C.2.24', 'CBRN-Erkundungswagen', 75, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['cbrn-measuring'], designation: 'CBRN ErkW'}),
    entry('C.2.25', 'Gerätewagen Dekontamination Personal', 75, {form: 'land-vehicle', ...FIRE, drive: 'offroad', abilities: ['decontamination'], designation: 'GW Dekon P'}),
    entry('C.2.26', 'Schlauchwagen Katastrophenschutz', 75, {form: 'land-vehicle', ...FIRE, drive: 'offroad', abilities: ['water-conveying'], designation: 'SW KatS'}),
    entry('C.2.27', 'Feuerwehrkran 30', 75, {form: 'land-vehicle', ...FIRE, drive: 'road', abilities: ['crane'], designation: 'FwK 30'}),
    entry('C.2.28', 'Teleskoplader', 75, {form: 'land-vehicle', ...FIRE, drive: 'offroad', abilities: ['telehandler'], designation: 'Telelader'}),
    entry('C.2.29', 'Tragkraftspritzenanhänger', 76, {form: 'land-vehicle', ...FIRE, body: 'trailer', drive: 'towed-by-car', abilities: ['firefighting']}),
    entry('C.2.30', 'Feuerwehr Netzersatzanlage 120 kVA', 76, {form: 'land-vehicle', ...FIRE, body: 'trailer', drive: 'towed-by-car', supplements: ['logistics'], abilities: ['power'], designation: '120'}),
    entry('C.2.31', 'Geschützte Löschdrohne/Löschroboter auf Kettenfahrgestell', 76, {form: 'land-vehicle', ...FIRE, protected: true, drive: 'tracked', supplements: ['uncrewed'], abilities: ['firefighting']}),
    ownMark('W.1', 'Unterflurhydrant', 'hydrant-underground'),
    ownMark('W.2', 'Überflurhydrant', 'hydrant-pillar'),
    ownMark('W.3', 'Offenes Gewässer', 'open-water'),
    ownMark('W.4', 'Löschwasserbehälter', 'water-tank'),
    ownMark('W.5', 'Verteiler', 'dividing-breeching'),
]
