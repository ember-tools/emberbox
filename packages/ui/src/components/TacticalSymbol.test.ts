import {describe, expect, it} from 'vitest'
import {createApp, h} from 'vue'
import {unitSymbolTree} from '../symbols/tactical'
import TacticalSymbol from './TacticalSymbol.vue'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/** Mounts a symbol into a fresh element and returns that element. */
function mounted(text: string): HTMLElement {
    const host = document.createElement('div')
    const symbol = unitSymbolTree({shape: 'vehicle', organisation: 'fire', text})
    createApp({render: () => h(TacticalSymbol, {symbol})}).mount(host)
    return host
}

describe('TacticalSymbol', () => {
    it('builds real SVG elements with case-sensitive attributes', () => {
        const svg = mounted('LF').querySelector('svg')!
        expect(svg.namespaceURI).toBe(SVG_NAMESPACE)
        expect(svg.querySelector('rect')!.namespaceURI).toBe(SVG_NAMESPACE)
        expect(svg.getAttribute('viewBox')).toBe('0 0 120 80')
    })

    it('writes the symbol text as text, never as markup', () => {
        const host = mounted('<b>LF</b>')
        expect(host.querySelector('b')).toBeNull()
        expect(host.querySelector('text')!.textContent).toBe('<b>LF</b>')
    })
})
