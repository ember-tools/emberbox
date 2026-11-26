import {describe, expect, it} from 'vitest'
import {helpPath, helpPaths} from './help'
import {breadcrumbData} from './page'

const topics = [
    {slug: 'anlegen', title: 'Übung anlegen', description: 'So entsteht eine Übung.'},
    {slug: 'drucken', title: 'Drucken', description: 'So kommt der Zettel aufs Papier.'},
]

describe('help center', () => {
    it('builds the overview and topic paths', () => {
        expect(helpPath()).toBe('/hilfe')
        expect(helpPath('drucken')).toBe('/hilfe/drucken')
        expect(helpPaths(topics)).toEqual(['/hilfe', '/hilfe/anlegen', '/hilfe/drucken'])
        expect(helpPaths(['anlegen'] as const)).toEqual(['/hilfe', '/hilfe/anlegen'])
    })

    it('numbers the breadcrumb steps', () => {
        const data = breadcrumbData([{name: 'Probe', path: '/'}, {name: 'Hilfe', path: '/hilfe'}]) as {itemListElement: {position: number, name: string}[]}
        expect(data.itemListElement.map(step => [step.position, step.name])).toEqual([[1, 'Probe'], [2, 'Hilfe']])
    })
})
