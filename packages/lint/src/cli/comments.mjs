import {readFileSync} from 'node:fs'
import {pythonFindings, scriptFindings} from './comment-scan.mjs'
import {createReporter, targetFiles} from './lint-utils.mjs'

/**
 * Finds every comment that is neither a doc comment nor a TODO.
 *
 * <p>Code documents itself in the Emberbox projects. Clear names, small functions and honest
 * structure carry the meaning, and a passage that needs a comment beside it to be understood wants
 * rewriting rather than annotating. So only doc comments are allowed: the block that introduces a
 * class, a method, a function or a constant and says what it is for, which is a docstring in
 * Python. The one exception is a TODO marking a real gap. Shell scripts are not scanned, since
 * their header and the doc lines above their functions are the shell's doc comments.
 *
 * @param root the absolute repository root
 * @param sources the `{path, extensions}` targets to scan
 * @returns whether nothing was found
 */
export function checkComments(root, sources) {
    const reporter = createReporter(root)
    const files = targetFiles(root, sources)
    for (const file of files) {
        const text = readFileSync(file, 'utf-8')
        const found = file.endsWith('.py') ? pythonFindings(text) : scriptFindings(text, file.endsWith('.vue'))
        for (const one of found) reporter.error(file, one.line, one.message)
    }
    return reporter.finish(`Comment lint passed. ${files.length} files checked.`)
}
