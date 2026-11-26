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
    })
})
