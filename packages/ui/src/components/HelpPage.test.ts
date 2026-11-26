import {describe, expect, it, vi} from 'vitest'
import {createApp, h} from 'vue'
import HelpPage from './HelpPage.vue'

vi.mock('@nuxt/ui/components/Link.vue', () => ({
    default: (_props: unknown, {attrs, slots}: {attrs: Record<string, unknown>, slots: Record<string, (() => unknown) | undefined>}) =>
        h('a', {...attrs, href: attrs.to}, slots.default?.() as never),
}))

const topics = [
    {slug: 'anlegen', title: 'Übung anlegen', description: 'So entsteht eine Übung.'},
    {slug: 'drucken', title: 'Drucken', description: 'So kommt der Zettel aufs Papier.'},
]

/** Mounts a help page with the given props, with a plain link in place of Nuxt UI's, and returns its element. */
function mounted(props: Record<string, unknown>): HTMLElement {
    const host = document.createElement('div')
    createApp(() => h(HelpPage, {title: 'Hilfe', ...props})).mount(host)
    return host
}

/** The link whose text is exactly the given one. */
function link(host: HTMLElement, text: string): HTMLAnchorElement | undefined {
    return [...host.querySelectorAll('a')].find(anchor => anchor.textContent?.trim() === text)
}

describe('HelpPage', () => {
    it('leads back to the start without topics, as before', () => {
        const host = mounted({})
        expect(link(host, 'Zurück')?.getAttribute('href')).toBe('/')
        expect(host.querySelector('nav')).toBeNull()
    })

    it('leads back to the overview from a topic and on to the next one', () => {
        const host = mounted({topics, current: 'anlegen'})
        expect(link(host, 'Alle Hilfethemen')?.getAttribute('href')).toBe('/hilfe')
        expect(host.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Übung anlegen')
        expect(link(host, 'Weiter: Drucken')?.getAttribute('href')).toBe('/hilfe/drucken')
    })

    it('has no next link on the last topic and keeps an explicit way back', () => {
        const host = mounted({topics, current: 'drucken', back: '/start'})
        expect(link(host, 'Zurück')?.getAttribute('href')).toBe('/start')
        expect([...host.querySelectorAll('a')].some(anchor => anchor.textContent?.includes('Weiter'))).toBe(false)
    })

    it('marks nothing and links nowhere further for an unknown topic', () => {
        const host = mounted({topics, current: 'gibtsnicht'})
        expect(host.querySelector('[aria-current="page"]')).toBeNull()
        expect([...host.querySelectorAll('a')].some(anchor => anchor.textContent?.includes('Weiter'))).toBe(false)
    })
})
