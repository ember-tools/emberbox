import {describe, expect, it} from 'vitest'
import {
    DANGER_LABELS, DANGER_LABEL_PATTERNS, dangerLabel, dangerLabelTree, environmentMark, environmentMarkTree, warningPanel, warningPanelTree,
    type DangerLabelPattern,
} from './hazmat'
import type {SvgElement} from './svg'

/** Every element of a tree, flattened. */
function flat(tree: SvgElement): SvgElement[] {
    const all: SvgElement[] = []
    const walk = (node: SvgElement) => {
        all.push(node)
        node.children?.forEach(walk)
    }
    walk(tree)
    return all
}

/** The writing of a label, in drawing order. */
function writing(pattern: DangerLabelPattern): SvgElement[] {
    return flat(dangerLabelTree(pattern)).filter(part => part.tag === 'text')
}

/** The end points of a path's segments, the corners of rectangles and the extremes of circles. */
function extremes(part: SvgElement): [number, number][] {
    const a = part.attributes
    if (part.tag === 'circle') {
        const [cx, cy, r] = [Number(a.cx), Number(a.cy), Number(a.r)]
        return [[cx - r, cy], [cx + r, cy], [cx, cy - r], [cx, cy + r]]
    }
    if (part.tag === 'rect') {
        const [x, y, w, h] = [Number(a.x), Number(a.y), Number(a.width), Number(a.height)]
        return [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    }
    if (part.tag !== 'path') return []
    const points: [number, number][] = []
    let [x, y] = [0, 0]
    for (const [, command, rest] of String(a.d).matchAll(/([MLHVCQAZmlhvcqaz])([^MLHVCQAZmlhvcqaz]*)/g)) {
        const n = (rest ?? '').trim().split(/[\s,]+/).filter(Boolean).map(Number)
        const relative = command === command!.toLowerCase()
        const step = {m: 2, l: 2, h: 1, v: 1, c: 6, q: 4, a: 7, z: 0}[command!.toLowerCase() as 'm']
        for (let i = 0; step && i < n.length; i += step) {
            const group = n.slice(i, i + step)
            const kind = command!.toLowerCase()
            if (kind === 'h') x = relative ? x + group[0]! : group[0]!
            else if (kind === 'v') y = relative ? y + group[0]! : group[0]!
            else {
                const [ex, ey] = group.slice(-2) as [number, number]
                x = relative ? x + ex : ex
                y = relative ? y + ey : ey
            }
            points.push([x, y])
        }
    }
    return points
}

describe('danger labels', () => {
    it('has every pattern of 5.2.2.2.2 in the order of the ADR', () => {
        expect(DANGER_LABEL_PATTERNS).toEqual(['1', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2',
            '7A', '7B', '7C', '7E', '8', '9', '9A'])
        expect(Object.keys(DANGER_LABELS).sort()).toEqual([...DANGER_LABEL_PATTERNS].sort())
    })

    it('draws every label on its own square canvas', () => {
        for (const pattern of DANGER_LABEL_PATTERNS) {
            const tree = dangerLabelTree(pattern)
            expect(tree.attributes.viewBox, pattern).toBe('0 0 100 100')
            expect(dangerLabel(pattern), pattern).toMatch(/^<svg [^>]*>.*<\/svg>$/)
        }
    })

    it('writes the class in the lower corner as the ADR asks: 4 for 4.1 to 4.3, 6 for 6.1 and 6.2, 5.1 and 5.2 in full', () => {
        const figure = (pattern: DangerLabelPattern) => writing(pattern).at(-1)!.text
        expect(DANGER_LABEL_PATTERNS.map(figure)).toEqual(['1', '1', '1', '1', '2', '2', '2', '3', '4', '4', '4', '5.1', '5.2', '6', '6',
            '7', '7', '7', '7', '8', '9', '9'])
    })

    it('writes the 8 white on black and underlines the 9', () => {
        expect(writing('8').at(-1)!.attributes.fill).toBe('#FFFFFF')
        expect(writing('9').at(-1)!.attributes['text-decoration']).toBe('underline')
        expect(writing('3').at(-1)!.attributes['text-decoration']).toBeUndefined()
    })

    it('shows the division of 1.4 to 1.6 in the upper half', () => {
        for (const pattern of ['1.4', '1.5', '1.6'] as const) expect(writing(pattern).some(part => part.text === pattern && Number(part.attributes.y) < 50)).toBe(true)
    })

    it('gives 4.1 seven red stripes over the whole label and 9 seven black stripes in the upper half', () => {
        const stripes = (pattern: DangerLabelPattern, colour: string) => flat(dangerLabelTree(pattern))
            .filter(part => part.tag === 'path' && part.attributes.fill === colour && String(part.attributes.d).split('Z').length === 8)
        expect(stripes('4.1', '#E30613')).toHaveLength(1)
        const upper = stripes('9', '#000000')
        expect(upper).toHaveLength(1)
        const ys = String(upper[0]!.attributes.d).match(/[\d.]+ ([\d.]+)/g)!.map(pair => Number(pair.split(' ')[1]))
        expect(Math.max(...ys)).toBe(50)
    })

    it('puts one, two or three red bars after RADIOACTIVE for the categories I to III', () => {
        const bars = (pattern: DangerLabelPattern) => flat(dangerLabelTree(pattern)).filter(part => part.tag === 'rect' && part.attributes.fill === '#E30613').length
        expect([bars('7A'), bars('7B'), bars('7C'), bars('7E')]).toEqual([1, 2, 3, 0])
    })

    it('fills the halves of 4.2 and 5.2 to the edge and those of 7B and 8 inside a white rim', () => {
        const fills = (pattern: DangerLabelPattern) => dangerLabelTree(pattern).children![0]!.children!.slice(0, 2).map(part => [part.attributes.d, part.attributes.fill])
        expect(fills('4.2')).toEqual([['M0 50 L50 0 L100 50 Z', '#FFFFFF'], ['M0 50 L50 100 L100 50 Z', '#E30613']])
        expect(fills('7B')[1]).toEqual(['M5 50 L50 5 L95 50 Z', '#FFD500'])
        expect(fills('8')[1]).toEqual(['M5 50 L50 95 L95 50 Z', '#000000'])
    })

    it('keeps every pictogram inside the line around the label', () => {
        for (const pattern of DANGER_LABEL_PATTERNS) {
            const marks = dangerLabelTree(pattern).children![0]!.children!.find(part => part.tag === 'g')!
            for (const [x, y] of flat(marks).flatMap(extremes)) {
                expect(Math.abs(x - 50) + Math.abs(y - 50), `${pattern} at ${x} ${y}`).toBeLessThanOrEqual(44)
            }
        }
    })

    it('keeps the drawing of every label, the environment mark and the plates', () => {
        for (const pattern of DANGER_LABEL_PATTERNS) expect(dangerLabel(pattern)).toMatchSnapshot(pattern)
        expect(environmentMark()).toMatchSnapshot('environment')
        expect(warningPanel()).toMatchSnapshot('plate')
        expect(warningPanel({hazardNumber: '33', unNumber: '1203'})).toMatchSnapshot('plate 33/1203')
    })
})

describe('environment mark', () => {
    it('draws a black symbol on a white diamond with a border', () => {
        const [diamond] = environmentMarkTree().children![0]!.children!
        expect([diamond!.attributes.fill, diamond!.attributes.stroke]).toEqual(['#FFFFFF', '#000000'])
    })
})

describe('orange-coloured plate', () => {
    it('is blank without numbers, with only its black border', () => {
        const parts = flat(warningPanelTree())
        expect(parts.filter(part => part.tag === 'text')).toHaveLength(0)
        expect(parts.filter(part => part.tag === 'path')).toHaveLength(0)
        expect(warningPanelTree().attributes.viewBox).toBe('0 0 400 300')
    })

    it('writes the hazard identification number above the dividing line and the UN number below', () => {
        const parts = flat(warningPanelTree({hazardNumber: 'X423', unNumber: '1428'}))
        const [hazard, un] = parts.filter(part => part.tag === 'text')
        expect([hazard!.text, un!.text]).toEqual(['X423', '1428'])
        expect(Number(hazard!.attributes.y)).toBeLessThan(150)
        expect(Number(un!.attributes.y)).toBeGreaterThan(150)
        expect(parts.find(part => part.tag === 'path')!.attributes['stroke-width']).toBe(15)
    })

    it('takes the classification code as hazard number for class 1', () => {
        expect(warningPanel({hazardNumber: '1.1D', unNumber: '0081'})).toContain('1.1D')
        expect(warningPanel({hazardNumber: '1.4S', unNumber: '0012'})).toContain('1.4S')
        expect(() => warningPanelTree({hazardNumber: '1.7A', unNumber: '0081'})).toThrow()
    })

    it('refuses numbers the ADR cannot have', () => {
        expect(() => warningPanelTree({unNumber: '1203'})).toThrow()
        expect(() => warningPanelTree({hazardNumber: '', unNumber: '1203'})).toThrow()
        expect(() => warningPanelTree({hazardNumber: '33'})).toThrow()
        expect(() => warningPanelTree({hazardNumber: '3', unNumber: '1203'})).toThrow()
        expect(() => warningPanelTree({hazardNumber: '33', unNumber: '120'})).toThrow()
        expect(() => warningPanelTree({hazardNumber: 'Y33', unNumber: '1203'})).toThrow()
        expect(warningPanel({hazardNumber: '268', unNumber: '1005'})).toContain('268')
    })
})
