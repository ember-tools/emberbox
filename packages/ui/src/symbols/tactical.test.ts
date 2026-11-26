import {describe, expect, it} from 'vitest'
import {MARK_KINDS, escapeSvg, markSymbol, renderSvg, unitSymbol, unitSymbolTree, type UnitSize} from './tactical'

describe('escapeSvg', () => {
    it('escapes everything that could leave a text node or an attribute', () => {
        expect(escapeSvg(`<script>&"'`)).toBe('&#60;script&#62;&#38;&#34;&#39;')
    })
})

describe('unitSymbol', () => {
    it('never puts its text into the markup unescaped', () => {
        const svg = unitSymbol({shape: 'vehicle', organisation: 'fire', text: '<img src=x onerror=alert(1)>'})
        expect(svg).not.toContain('<img')
        expect(svg).toContain('&#60;img')
    })

    it('marks the sizes as the recommendations do: one dot, two stacked, two apart, three', () => {
        const dots = (size: UnitSize) => unitSymbolTree({shape: 'unit', organisation: 'fire', text: 'A', size}).children!
            .filter(child => child.tag === 'circle').map(child => [child.attributes.cx, child.attributes.cy])
        expect(dots('squad')).toEqual([[60, 6]])
        expect(dots('section')).toEqual([[60, 3], [60, 10]])
        expect(dots('group')).toEqual([[52, 6], [68, 6]])
        expect(dots('platoon')).toEqual([[50, 6], [60, 6], [70, 6]])
    })

    it('draws a squad as a compact rounded form below its size mark', () => {
        const tree = unitSymbolTree({shape: 'squad', organisation: 'fire', text: 'AT', size: 'squad'})
        const body = tree.children!.find(child => child.tag === 'rect')!
        expect(body.attributes).toMatchObject({x: 24, y: 18, width: 72, rx: 14})
        const lowestDot = Math.max(...tree.children!.filter(child => child.tag === 'circle')
            .map(child => Number(child.attributes.cy) + Number(child.attributes.r)))
        expect(Number(body.attributes.y) - 1.5).toBeGreaterThan(lowestDot)
    })

    it('squeezes long writing into the squad form', () => {
        const tree = unitSymbolTree({shape: 'squad', organisation: 'fire', text: 'command-support'})
        const text = tree.children!.find(child => child.tag === 'text')!
        expect(Number(text.attributes.textLength)).toBeLessThanOrEqual(69)
    })

    it('draws medical units red on white', () => {
        expect(unitSymbol({shape: 'vehicle', organisation: 'medical', text: 'RTW'})).toContain('fill="white"')
    })
})

describe('markSymbol', () => {
    it('is a complete SVG element for every kind', () => {
        for (const kind of MARK_KINDS) {
            expect(markSymbol(kind)).toMatch(/^<svg [^>]*>.*<\/svg>$/)
        }
    })
})

describe('water supply marks', () => {
    it('tells underground and pillar hydrants apart', () => {
        expect(markSymbol('hydrant-underground')).toContain('>UH<')
        expect(markSymbol('hydrant-pillar')).toContain('>ÜH<')
    })

    it('draws every kind differently', () => {
        expect(new Set(MARK_KINDS.map(markSymbol)).size).toBe(MARK_KINDS.length)
    })
})

describe('renderSvg', () => {
    it('escapes attribute values as well as text', () => {
        expect(renderSvg({tag: 'text', attributes: {fill: '"><script>'}, text: 'a'}))
            .toBe('<text fill="&#34;&#62;&#60;script&#62;">a</text>')
    })

    it('closes elements without content itself', () => {
        expect(renderSvg({tag: 'circle', attributes: {r: 3}})).toBe('<circle r="3"/>')
    })
})
