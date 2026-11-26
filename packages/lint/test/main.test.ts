import {spawnSync} from 'node:child_process'
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'
import {describe, expect, it} from 'vitest'

/**
 * The `emberbox-lint` runner, started as a process in a temporary project.
 *
 * @vitest-environment node
 */
const MAIN = resolve('src/cli/main.mjs')
const CONFIG = "export default {sources: [{path: 'src', extensions: ['.ts']}]}\n"

/**
 * A project holding one source file, with or without a lint configuration.
 *
 * @param source the source file's content
 * @param config the configuration module, or none
 * @returns the project's folder
 */
function project(source: string, config: string | null = CONFIG): string {
    const dir = mkdtempSync(join(tmpdir(), 'emberbox-main-'))
    mkdirSync(join(dir, 'src'))
    writeFileSync(join(dir, 'src', 'a.ts'), source)
    if (config) writeFileSync(join(dir, 'emberbox-lint.config.mjs'), config)
    return dir
}

/**
 * Runs `emberbox-lint` in a folder.
 *
 * @param dir the folder
 * @param args the arguments
 * @returns the exit code and everything it printed
 */
function lint(dir: string, ...args: string[]) {
    const result = spawnSync(process.execPath, [MAIN, ...args], {cwd: dir, encoding: 'utf-8'})
    return {status: result.status, output: result.stdout + result.stderr}
}

const CLEAN = '/** Says what it is. */\nexport const a = 1\n'
const DIRTY = 'export const a = 1 // why\n'

describe('emberbox-lint', () => {
    it('needs a configuration', () => {
        expect(lint(project(CLEAN, null), 'comments').status).toBe(2)
    })

    it('runs one linter by name and refuses an unknown one', () => {
        expect(lint(project(CLEAN), 'comments').status).toBe(0)
        expect(lint(project(DIRTY), 'comments').status).toBe(1)
        const unknown = lint(project(CLEAN), 'spelling')
        expect(unknown.status).toBe(2)
        expect(unknown.output).toContain('Known: eslint, em-dash, comments')
    })

    it('runs every linter before failing, and never fails in an audit', () => {
        const all = lint(project(DIRTY))
        expect(all.status).toBe(1)
        expect(all.output).toContain('Em dash lint passed.')
        expect(all.output).toMatch(/Linters failed: .*comments/)
        expect(lint(project(DIRTY), '--audit').status).toBe(0)
    })

    it('counts a linter that cannot run as failed and goes on', () => {
        const config = "export default {sources: [{path: 'src', extensions: ['.ts']}], browserStorage: {catalogue: 'missing.json', sources: 'src'}}\n"
        const run = lint(project(CLEAN, config))
        expect(run.status).toBe(1)
        expect(run.output).toContain('browser-storage could not run')
        expect(run.output).toContain('Comment lint passed.')
        expect(run.output).toMatch(/Linters failed: .*browser-storage/)
    })
})
