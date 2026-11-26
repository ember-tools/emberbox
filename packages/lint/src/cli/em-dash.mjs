import {readFileSync} from 'node:fs'
import {createReporter, targetFiles} from './lint-utils.mjs'

/** Built from its code point so this file does not trip over itself. */
const EM_DASH = String.fromCharCode(0x2014)

/** The names markup gives the same character, assembled here for the same reason. */
const ENTITIES = ['mdash', '#8212', '#x2014', '#X2014'].map(name => `&${name};`)

const SPELLINGS = [EM_DASH, ...ENTITIES]

/**
 * Finds the em dash, which the Emberbox projects keep out of their code and the text they ship, so
 * the interface reads the same everywhere. The first one on each line is reported.
 *
 * @param root the absolute repository root
 * @param targets the `{path, extensions}` targets to scan
 * @returns whether none was found
 */
export function checkEmDash(root, targets) {
    const reporter = createReporter(root)
    const files = targetFiles(root, targets)
    for (const file of files) {
        const lines = readFileSync(file, 'utf-8').split('\n')
        lines.forEach((line, index) => {
            const spelling = SPELLINGS.find(candidate => line.includes(candidate))
            if (!spelling) return
            reporter.error(file, index + 1,
                `Em dash at column ${line.indexOf(spelling) + 1}. Use a comma, a colon, parentheses, a full stop or a spaced hyphen instead.`)
        })
    }
    return reporter.finish(`Em dash lint passed. ${files.length} files carry none.`)
}
