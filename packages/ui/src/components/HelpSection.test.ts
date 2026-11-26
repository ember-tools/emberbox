import {describe, expect, it} from 'vitest'
import {createApp, h} from 'vue'
import HelpSection from './HelpSection.vue'

/** Mounts a section with the given props and returns its element. */
function mounted(props: Record<string, unknown>): HTMLElement {
    const host = document.createElement('div')
    createApp(() => h(HelpSection, props, () => 'Inhalt')).mount(host)
    return host
}

describe('HelpSection', () => {
    it('is a named section with a heading when it has a title', () => {
        const host = mounted({title: 'Tipps'})
        expect(host.querySelector('section')?.getAttribute('aria-label')).toBe('Tipps')
        expect(host.querySelector('h2')?.textContent).toBe('Tipps')
    })

    it('is only the frame without a title', () => {
        const host = mounted({})
        expect(host.querySelector('section')).toBeNull()
        expect(host.firstElementChild?.hasAttribute('aria-label')).toBe(false)
        expect(host.querySelector('h2')).toBeNull()
        expect(host.textContent).toBe('Inhalt')
    })
})
