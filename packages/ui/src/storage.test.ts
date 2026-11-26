import {beforeEach, describe, expect, it} from 'vitest'
import {cleanUpStorage} from './storage'

beforeEach(() => localStorage.clear())

describe('cleanUpStorage', () => {
    it('deletes keys and prefixes and keeps the rest', () => {
        localStorage.setItem('ls_name_ABC', 'Anna')
        localStorage.setItem('ls_name_XYZ', 'Ben')
        localStorage.setItem('old', '1')
        localStorage.setItem('tool.keep', '2')
        cleanUpStorage({remove: ['ls_name_*', 'old']})
        expect(Object.keys(localStorage)).toEqual(['tool.keep'])
    })

    it('moves a value to its new key', () => {
        localStorage.setItem('planner_view', 'map')
        cleanUpStorage({move: {planner_view: 'slip_view'}})
        expect(localStorage.getItem('slip_view')).toBe('map')
        expect(localStorage.getItem('planner_view')).toBeNull()
    })

    it('keeps a value already stored under the new key', () => {
        localStorage.setItem('planner_view', 'map')
        localStorage.setItem('slip_view', 'list')
        cleanUpStorage({move: {planner_view: 'slip_view'}})
        expect(localStorage.getItem('slip_view')).toBe('list')
        expect(localStorage.getItem('planner_view')).toBeNull()
    })

    it('leaves a storage alone that refuses access', () => {
        const refusing = {
            get length(): number {
                throw new Error('denied')
            },
        } as unknown as Storage
        expect(() => cleanUpStorage({remove: ['x*']}, refusing)).not.toThrow()
    })

    it('keeps the old value when the new one cannot be written', () => {
        localStorage.setItem('planner_view', 'map')
        const full = {
            getItem: (key: string) => localStorage.getItem(key),
            setItem: () => {
                throw new Error('quota')
            },
            removeItem: (key: string) => localStorage.removeItem(key),
        } as unknown as Storage
        cleanUpStorage({move: {planner_view: 'slip_view'}}, full)
        expect(localStorage.getItem('planner_view')).toBe('map')
    })
})
