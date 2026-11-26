import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {checkBrowserStorage} from '../src/cli/browser-storage.mjs'
import {checkComments} from '../src/cli/comments.mjs'
import {checkEmDash} from '../src/cli/em-dash.mjs'

/**
 * The script linters against files written to a temporary repository.
 *
 * @vitest-environment node
 */
const SOURCES = [{path: 'src', extensions: ['.ts']}]

/**
 * A repository holding the given files.
 *
 * @param files the files by their path below the root
 * @returns the root
 */
function repository(files: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), 'emberbox-cli-'))
    for (const [path, content] of Object.entries(files)) {
        mkdirSync(join(root, path, '..'), {recursive: true})
        writeFileSync(join(root, path), content)
    }
    return root
}

describe('the script linters', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => undefined)
    })
    afterEach(() => vi.restoreAllMocks())

    it('accept doc comments and TODOs and reject other comments', () => {
        const clean = repository({'src/a.ts': '/** Says what it is. */\nexport const a = 1\n// TODO: fill in b\n'})
        const dirty = repository({'src/a.ts': 'export const a = 1 // why\n'})
        expect(checkComments(clean, SOURCES)).toBe(true)
        expect(checkComments(dirty, SOURCES)).toBe(false)
    })

    it('find an em dash, also as an entity', () => {
        const dash = String.fromCharCode(0x2014)
        expect(checkEmDash(repository({'src/a.ts': "export const a = 'x - y'\n"}), SOURCES)).toBe(true)
        expect(checkEmDash(repository({'src/a.ts': `export const a = 'x ${dash} y'\n`}), SOURCES)).toBe(false)
        expect(checkEmDash(repository({'README.md': `a &${'mdash'}; b\n`}), [{path: 'README.md', extensions: null}])).toBe(false)
    })

    it('compare the browser storage catalogue with the keys the code uses', () => {
        const code = "const KEY = 'tool.theme'\nlocalStorage.getItem(KEY)\n"
        const options = {catalogue: 'browser-storage.json', sources: 'src'}
        const declared = JSON.stringify({entries: [{key: 'tool.theme', purpose: 'p', kind: 'LOCAL_STORAGE'}]})
        expect(checkBrowserStorage(repository({'src/a.ts': code, 'browser-storage.json': declared}), options)).toBe(true)
        expect(checkBrowserStorage(repository({'src/a.ts': code, 'browser-storage.json': '{"entries": []}'}), options)).toBe(false)
        expect(checkBrowserStorage(repository({'src/a.ts': 'export {}\n', 'browser-storage.json': declared}), options)).toBe(false)
        const fromDependency = JSON.stringify({entries: [{key: 'vueuse-color-scheme', purpose: 'p', kind: 'LOCAL_STORAGE', source: '@emberbox/ui'}]})
        expect(checkBrowserStorage(repository({'src/a.ts': 'export {}\n', 'browser-storage.json': fromDependency}), options)).toBe(true)
        const ownKeyWithSource = JSON.stringify({entries: [{key: 'tool.theme', purpose: 'p', kind: 'LOCAL_STORAGE', source: '@emberbox/ui'}]})
        expect(checkBrowserStorage(repository({'src/a.ts': code, 'browser-storage.json': ownKeyWithSource}), options)).toBe(false)
    })

    it('accept retired keys only while the code no longer uses them', () => {
        const options = {catalogue: 'browser-storage.json', sources: 'src'}
        const catalogue = (...entries: object[]) => JSON.stringify({entries: [{key: 'tool.view', purpose: 'p', kind: 'LOCAL_STORAGE'}, ...entries]})
        const retiredKey = {key: 'old_view', purpose: 'p', kind: 'LOCAL_STORAGE', retired: true}
        const retiredPrefix = {key: 'old_name_*', purpose: 'p', kind: 'LOCAL_STORAGE', retired: true}
        const current = "localStorage.getItem('tool.view')\n"
        const cleanUp = "cleanUpStorage({remove: ['old_name_*'], move: {old_view: 'tool.view'}})\n"
        const reported = () => vi.mocked(console.log).mock.calls.flat().join('\n')
        const check = (code: string, ...entries: object[]) => {
            vi.mocked(console.log).mockClear()
            return checkBrowserStorage(repository({'src/a.ts': code, 'browser-storage.json': catalogue(...entries)}), options)
        }

        expect(check(current + cleanUp, retiredKey, retiredPrefix)).toBe(true)

        expect(check(current + cleanUp + "localStorage.getItem('old_view')\n", retiredKey, retiredPrefix)).toBe(false)
        expect(reported()).toContain("'old_view' is retired")

        const live = {key: 'old_name_ABC', purpose: 'p', kind: 'LOCAL_STORAGE'}
        expect(check(current + cleanUp + "localStorage.getItem('old_name_ABC')\n", retiredKey, retiredPrefix, live)).toBe(false)
        expect(reported()).toContain("'old_name_ABC' is retired")

        expect(check(current, retiredKey)).toBe(false)
        expect(reported()).toContain("retired 'old_view' appears nowhere")
    })

    it('protect live keys and the shape of retired entries', () => {
        const options = {catalogue: 'browser-storage.json', sources: 'src'}
        const reported = () => vi.mocked(console.log).mock.calls.flat().join('\n')
        const check = (code: string, ...entries: object[]) => {
            vi.mocked(console.log).mockClear()
            return checkBrowserStorage(repository({'src/a.ts': code, 'browser-storage.json': JSON.stringify({entries})}), options)
        }
        const colourMode = {key: 'vueuse-color-scheme', purpose: 'p', kind: 'LOCAL_STORAGE', source: '@emberbox/ui'}

        expect(check("cleanUpStorage({remove: ['vueuse*']})\n", colourMode, {key: 'vueuse*', purpose: 'p', kind: 'LOCAL_STORAGE', retired: true})).toBe(false)
        expect(reported()).toContain("covers the live key 'vueuse-color-scheme'")

        expect(check('export {}\n', colourMode, {key: 'tool_*', purpose: 'p', kind: 'LOCAL_STORAGE'})).toBe(false)
        expect(check("cleanUpStorage({remove: ['ls_*_name']})\n", colourMode, {key: 'ls_*_name', purpose: 'p', kind: 'LOCAL_STORAGE', retired: true})).toBe(false)
        expect(reported()).toContain("only a retired entry may end in '*'")

        expect(check("cleanUpStorage({remove: ['old']})\n", colourMode, {key: 'old', purpose: 'p', kind: 'LOCAL_STORAGE', retired: true, source: '@emberbox/ui'})).toBe(false)
        expect(reported()).toContain("'old' is retired, so it must not name a source")
    })

    it('count the storage key of a component as one of the project', () => {
        const options = {catalogue: 'browser-storage.json', sources: 'src'}
        const sections = '<template><CollapsibleSection storage-key="tool_sections"/></template>\n'
        const own = JSON.stringify({entries: [{key: 'tool_sections', purpose: 'p', kind: 'LOCAL_STORAGE'}]})
        expect(checkBrowserStorage(repository({'src/A.vue': sections, 'browser-storage.json': own}), options)).toBe(true)
        expect(checkBrowserStorage(repository({'src/A.vue': sections, 'browser-storage.json': '{"entries": []}'}), options)).toBe(false)
    })
})
