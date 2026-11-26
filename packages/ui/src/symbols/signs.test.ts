import {describe, expect, it} from 'vitest'
import {ABILITIES} from './abilities'
import {TACTICAL_SIGN_CATALOG, catalogSignTree} from './catalog'
import {
    BASIC_FORMS, DRIVES, FLIGHTS, ORGANISATION_COLOURS, SIGN_ORGANISATIONS, SIGN_SIZES, SUPPLEMENTS, VEHICLE_BODIES,
    tacticalSign, tacticalSignTree, type TacticalSignSpec,
} from './signs'
import {renderSvg, type SvgElement} from './svg'

/** Every element of a sign, flattened. */
function parts(spec: TacticalSignSpec): SvgElement[] {
    const all: SvgElement[] = []
    const walk = (node: SvgElement) => {
        all.push(node)
        node.children?.forEach(walk)
    }
    walk(tacticalSignTree(spec))
    return all
}

/** The outline of a sign's basic form, always the first drawn part. */
function outline(spec: TacticalSignSpec): SvgElement {
    return tacticalSignTree(spec).children![0]!.children![0]!
}

/** The centres of the dots of a size mark. */
function dots(spec: TacticalSignSpec): number[][] {
    return parts(spec).filter(part => part.tag === 'circle' && part.attributes.r === 3).map(part => [Number(part.attributes.cx), Number(part.attributes.cy)])
}

describe('tactical signs', () => {
    it('draws every basic form as a complete SVG', () => {
        for (const form of BASIC_FORMS) expect(tacticalSign({form})).toMatch(/^<svg [^>]*>.*<\/svg>$/)
    })

    it('draws a basic form without an organisation black on white, as chapter 1 does', () => {
        expect(outline({form: 'formation'}).attributes).toMatchObject({fill: '#FFFFFF', stroke: '#000000'})
    })

    it('fills a form with the colour of its organisation and outlines it in black', () => {
        for (const organisation of SIGN_ORGANISATIONS) {
            expect(outline({form: 'formation', organisation}).attributes).toMatchObject({fill: ORGANISATION_COLOURS[organisation].fill, stroke: '#000000'})
        }
    })

    it('outlines in the organisation colour, or black for white', () => {
        expect(outline({form: 'formation', organisation: 'thw', style: 'outline'}).attributes).toMatchObject({fill: '#FFFFFF', stroke: '#003399'})
        expect(outline({form: 'formation', organisation: 'aid', style: 'outline'}).attributes.stroke).toBe('#000000')
    })

    it('draws everything black on white in black and white, hazards and measures included', () => {
        for (const form of ['formation', 'hazard', 'measure'] as const) {
            expect(outline({form, organisation: 'fire', style: 'mono'}).attributes.stroke, form).toBe('#000000')
        }
    })

    it('draws a hazard red with its point up and a measure blue with its point down', () => {
        expect(outline({form: 'hazard', organisation: 'thw'}).attributes).toMatchObject({stroke: '#FA321E', d: 'M60 16 L92 66 H28 Z'})
        expect(outline({form: 'measure'}).attributes).toMatchObject({stroke: '#3264FA', d: 'M28 18 H92 L60 68 Z'})
    })

    it('stacks the dots of a Staffel and sets those of a Gruppe side by side', () => {
        const [first, second] = dots({form: 'formation', size: 'section'})
        expect(first![0]).toBe(second![0])
        expect(first![1]).not.toBe(second![1])
        const [left, right] = dots({form: 'formation', size: 'group'})
        expect(left![1]).toBe(right![1])
        expect(left![0]).not.toBe(right![0])
        expect(dots({form: 'formation', size: 'platoon'})).toHaveLength(3)
    })

    it('marks associations with one to three bars', () => {
        const bars = (size: 'association-1' | 'association-2' | 'association-3') => parts({form: 'formation', size}).filter(part => part.tag === 'rect').length
        expect([bars('association-1'), bars('association-2'), bars('association-3')]).toEqual([1, 2, 3])
    })

    it('rests size marks just above any form, inside the canvas', () => {
        for (const form of BASIC_FORMS) {
            for (const size of ['squad', 'section', 'group', 'platoon'] as const) {
                const top = Math.min(...dots({form, size}).map(([, cy]) => cy!))
                expect(top - 3, `${form} ${size}`).toBeGreaterThanOrEqual(0)
            }
        }
        const aircraft = dots({form: 'aircraft', size: 'squad'})[0]!
        expect(aircraft[1]).toBeGreaterThan(dots({form: 'formation', size: 'squad'})[0]![1]!)
    })

    it('follows the curved top of a land vehicle with the command bar', () => {
        const bar = parts({form: 'land-vehicle', supplements: ['command']}).find(part => part.attributes['stroke-width'] === 5)!
        expect(bar.attributes.d).toContain('Q')
    })

    it('puts the logistics bar low inside the form and the drone V inside it', () => {
        const bar = parts({form: 'formation', supplements: ['logistics']}).find(part => part.attributes['stroke-width'] === 5)!
        expect(String(bar.attributes.d)).toBe('M15 62 H105')
        const drone = parts({form: 'aircraft', supplements: ['uncrewed']}).find(part => part.attributes['stroke-width'] === 4)!
        expect(Number(/L60 (\d+)/.exec(String(drone.attributes.d))![1])).toBeLessThan(62)
    })

    it('draws a protected vehicle with a straight top and a curved underside', () => {
        expect(outline({form: 'land-vehicle', protected: true}).attributes.d).toBe('M10 16 H110 V60 Q60 52 10 60 Z')
    })

    it('writes the short name in every style, beside forms too small to hold it', () => {
        for (const style of ['filled', 'outline', 'mono'] as const) {
            expect(tacticalSign({form: 'formation', organisation: 'thw', abbreviation: true, style}), style).toContain('>THW<')
        }
        expect(tacticalSign({form: 'formation', organisation: 'thw'})).not.toContain('>THW<')
        const short = parts({form: 'person', organisation: 'fire', abbreviation: true}).find(part => part.text === 'Fw')!
        expect(Number(short.attributes.x)).toBeGreaterThan(86)
        expect(short.attributes.fill).toBe('#000000')
    })

    it('draws every size, supplement, drive, body and flight', () => {
        for (const size of SIGN_SIZES) expect(tacticalSign({form: 'formation', size})).toContain('<svg')
        for (const kind of SUPPLEMENTS) expect(tacticalSign({form: 'formation', supplements: [kind]})).toContain('<path')
        const plain = parts({form: 'land-vehicle'}).length
        for (const drive of DRIVES) expect(parts({form: 'land-vehicle', drive}).length, drive).toBeGreaterThan(plain)
        for (const body of VEHICLE_BODIES) expect(parts({form: 'land-vehicle', body}).length, body).toBeGreaterThan(plain)
        for (const flight of FLIGHTS) expect(parts({form: 'aircraft', flight}).length, flight).toBeGreaterThan(parts({form: 'aircraft'}).length)
    })

    it('combines a body with a drive, such as a cross-country swap loader', () => {
        const wheels = parts({form: 'land-vehicle', body: 'swap-loader', drive: 'offroad'}).filter(part => part.tag === 'circle')
        expect(wheels).toHaveLength(3)
    })

    it('escapes writing', () => {
        expect(tacticalSign({form: 'formation', text: '<b>'})).toContain('&#60;b&#62;')
    })
})

describe('catalogue', () => {
    it('has unique ids and numbers after the chapters, own marks apart', () => {
        const ids = TACTICAL_SIGN_CATALOG.map(entry => entry.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const entry of TACTICAL_SIGN_CATALOG) {
            expect(entry.number, entry.id).toMatch(entry.recommended ? /^([1-5]|C)(\.\d+)+$/ : /^W\.\d+$/)
            expect(entry.page !== undefined, entry.id).toBe(entry.recommended)
        }
    })

    it('covers chapters 1 to 4, 5.1, 5.4, 5.5 and annex C of the recommendations', () => {
        const numbers = new Set(TACTICAL_SIGN_CATALOG.map(entry => entry.number))
        const expected = [
            ...Array.from({length: 14}, (_, n) => `1.${n + 1}`),
            ...Array.from({length: 8}, (_, n) => `2.${n + 1}`),
            ...Array.from({length: 7}, (_, n) => `3.${n + 1}`),
            '5.1.1', '5.1.2',
            ...Array.from({length: 9}, (_, n) => `5.1.1.${n + 1}`),
            ...Array.from({length: 5}, (_, n) => `5.1.2.${n + 1}`),
            ...Array.from({length: 4}, (_, n) => `5.1.3.${n + 1}`),
            ...Array.from({length: 3}, (_, n) => `5.1.4.${n + 1}`),
            '5.4.1', '5.4.2', '5.4.3', '5.4.4', '5.5.1', '5.5.2', '5.5.3',
            ...Object.values(ABILITIES).map(ability => ability.number),
            ...Array.from({length: 15}, (_, n) => `C.1.${n + 1}`),
            ...Array.from({length: 31}, (_, n) => `C.2.${n + 1}`),
        ]
        for (const number of expected) expect(numbers.has(number), number).toBe(true)
    })

    it('keeps the drawing of every entry', () => {
        for (const entry of TACTICAL_SIGN_CATALOG) expect(renderSvg(catalogSignTree(entry))).toMatchSnapshot(entry.id)
    })
})

describe('abilities', () => {
    /** The ability groups of a sign with their offset and scale. */
    function boxes(spec: TacticalSignSpec): {x: number, y: number, sx: number, sy: number, node: SvgElement}[] {
        return parts(spec).filter(part => part.tag === 'g' && String(part.attributes.transform ?? '').startsWith('translate')).map(node => {
            const [, x, y, sx, sy] = /translate\((\S+) (\S+)\) scale\((\S+)(?: (\S+))?\)/.exec(String(node.attributes.transform))!
            return {x: Number(x), y: Number(y), sx: Number(sx), sy: Number(sy ?? sx), node}
        })
    }

    it('stacks several abilities from the bottom up, the main one lowest', () => {
        const [main, second] = boxes({form: 'formation', abilities: ['medical', 'care']})
        expect(main!.y).toBeGreaterThan(second!.y)
    })

    it('stretches firefighting over the whole room of the form, below a designation if there is one', () => {
        const [box] = boxes({form: 'formation', organisation: 'fire', abilities: ['firefighting']})
        expect(box!.x).toBe(16)
        expect(box!.x + 100 * box!.sx).toBeCloseTo(104, 5)
        expect(box!.sx).not.toBeCloseTo(box!.sy, 2)
        const [below] = boxes({form: 'formation', organisation: 'fire', abilities: ['firefighting'], designation: 'TSF'})
        expect(below!.x + 100 * below!.sx).toBeCloseTo(104, 5)
        expect(below!.y).toBeGreaterThan(box!.y)
    })

    it('keeps the dots of a stretched CBRN cross round', () => {
        const dots = parts({form: 'formation', organisation: 'fire', abilities: ['cbrn']}).filter(part => part.tag === 'circle')
        expect(dots).toHaveLength(2)
        for (const dot of dots) expect(dot.attributes.r).toBeGreaterThan(0)
    })

    it('keeps abilities and the designation clear of the command and logistics bars', () => {
        const spec: TacticalSignSpec = {form: 'land-vehicle', organisation: 'fire', supplements: ['command', 'logistics'], designation: 'ELW 1', abilities: ['power']}
        const [box] = boxes(spec)
        const text = parts(spec).find(part => part.text === 'ELW 1')!
        expect(Number(text.attributes.y)).toBeGreaterThan(32)
        expect(box!.y).toBeGreaterThan(Number(text.attributes.y))
        expect(box!.y + 60 * box!.sy).toBeLessThanOrEqual(60 - 12 + 0.1)
    })

    it('draws strokes as heavy as the outline at any scale', () => {
        for (const spec of [{form: 'formation', abilities: ['medical']}, {form: 'formation', abilities: ['medical', 'care', 'ladder']}] as TacticalSignSpec[]) {
            for (const box of boxes(spec)) {
                const stroke = box.node.children!.find(part => part.tag === 'path')!.attributes['stroke-width']
                expect(Number(stroke) * box.sx).toBeCloseTo(2.5, 2)
            }
        }
    })

    it('inks abilities black on fire red, white on THW blue, red in outline and black in black and white', () => {
        const ink = (organisation: 'fire' | 'thw', style?: 'outline' | 'mono') =>
            boxes({form: 'formation', organisation, style, abilities: ['medical']})[0]!.node.children![0]!.attributes.stroke
        expect(ink('fire')).toBe('#000000')
        expect(ink('thw')).toBe('#FFFFFF')
        expect(ink('fire', 'outline')).toBe('#FA321E')
        expect(ink('thw', 'mono')).toBe('#000000')
    })

    it('writes a designation in the upper left corner', () => {
        const text = parts({form: 'land-vehicle', organisation: 'fire', designation: 'TSF'}).find(part => part.text === 'TSF')!
        expect(Number(text.attributes.x)).toBeLessThan(30)
        expect(Number(text.attributes.y)).toBeLessThan(30)
    })

    it('has a number, name, page and drawing for every ability of chapter 4', () => {
        const perSection = Object.values(ABILITIES).reduce<Record<string, number>>((counts, ability) => {
            const section = ability.number.split('.').slice(0, 2).join('.')
            return {...counts, [section]: (counts[section] ?? 0) + 1}
        }, {})
        expect(perSection).toEqual({'4.1': 8, '4.2': 5, '4.3': 6, '4.4': 3, '4.5': 8, '4.6': 6, '4.7': 28, '4.8': 16, '4.9': 1, '4.10': 7})
        for (const [name, ability] of Object.entries(ABILITIES)) {
            expect(ability.page, name).toBeGreaterThanOrEqual(22)
            expect(ability.page, name).toBeLessThanOrEqual(31)
            expect(ability.parts.length, name).toBeGreaterThan(0)
        }
    })
})
