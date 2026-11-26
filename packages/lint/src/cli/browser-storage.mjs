/**
 * The check of a browser storage catalogue against the code that reads and writes the browser's
 * storage.
 *
 * The catalogue (`browser-storage.json` by convention) lists every value the application keeps in the browser, each with what it
 * holds and why. A key added to the code without an entry would be stored without anybody having
 * written down why, so every key the frontend reads or writes must be declared, and every declared
 * key must still be used.
 *
 * Keys are collected from `localStorage` and `sessionStorage` calls to `getItem`, `setItem` and
 * `removeItem`. A key held in a constant of the same file resolves to its literal; any other
 * argument is reported as one that cannot be checked.
 */

import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {createReporter, walk} from './lint-utils.mjs'

const STORAGE_CALL = /\b(?:localStorage|sessionStorage)\??\.(?:getItem|setItem|removeItem)\(\s*([^,)]+)/g

/**
 * The `const NAME = 'value'` bindings of a file, so a key held in a constant resolves.
 *
 * @param content the file's source
 * @returns the constants by name
 */
function constantsIn(content) {
    return new Map([...content.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*'([^']*)'/g)].map(match => [match[1], match[2]]))
}

/**
 * The storage keys a file uses, and the arguments that are not literals.
 *
 * @param content the file's source
 * @returns the keys and the unresolved arguments
 */
function keysIn(content) {
    const constants = constantsIn(content)
    const keys = new Set()
    const dynamic = []
    for (const match of content.matchAll(STORAGE_CALL)) {
        const argument = match[1].trim()
        const literal = argument.match(/^'([^']*)'$/)
        if (literal) keys.add(literal[1])
        else if (constants.has(argument)) keys.add(constants.get(argument))
        else dynamic.push(argument)
    }
    return {keys, dynamic}
}

/**
 * Compares the keys the code uses with the catalogue: every used key must be declared, every
 * declared key used, and every key a literal or a constant of the same file. An entry with a
 * `source`, the package that stores the key on the project's behalf (such as `@emberbox/ui` for the
 * colour mode), is declared so the catalogue is complete, and is not expected in the project's code.
 *
 * @param root the absolute repository root
 * @param options `catalogue`, the catalogue file, and `sources`, the source folder, both relative to the root
 * @returns whether the catalogue and the code agree
 */
export function checkBrowserStorage(root, {catalogue, sources}) {
    const reporter = createReporter(root)
    const catalog = JSON.parse(readFileSync(join(root, catalogue), 'utf-8'))
    const entries = catalog.entries ?? []
    const declared = new Set(entries.map(entry => entry.key))
    const fromDependencies = new Set(entries.filter(entry => entry.source).map(entry => entry.key))
    const used = new Map()
    const folder = join(root, sources)
    for (const file of [...walk(folder, '.ts'), ...walk(folder, '.vue')]) {
        if (file.endsWith('.test.ts')) continue
        const {keys, dynamic} = keysIn(readFileSync(file, 'utf-8'))
        for (const key of keys) if (!used.has(key)) used.set(key, file)
        for (const argument of dynamic) {
            reporter.error(file, 0, `storage key is not a literal (${argument}), so it cannot be checked against ${catalogue}`, 'dynamic')
        }
    }
    for (const [key, file] of used) {
        if (!declared.has(key)) reporter.error(file, 0, `browser storage key '${key}' is not declared in ${catalogue}`, 'undeclared')
    }
    for (const key of fromDependencies) {
        if (used.has(key)) reporter.error(catalogue, 0, `browser storage key '${key}' is used by this project's own code, so it must not name a source`, 'source')
    }
    for (const key of declared) {
        if (!used.has(key) && !fromDependencies.has(key)) reporter.error(catalogue, 0, `declared browser storage key '${key}' is no longer used`, 'stale')
    }
    return reporter.finish(`Browser storage lint passed. ${used.size} keys used, ${declared.size} declared in ${catalogue}.`)
}
