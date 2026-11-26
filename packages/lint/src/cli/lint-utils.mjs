/**
 * Shared utilities for the script linters: a file walker and a reporter that groups and prints what
 * the linters find. Every path a linter is given is relative to the repository root.
 */

import {existsSync, readdirSync} from 'node:fs'
import {join, relative} from 'node:path'

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

/** Folders no linter looks into: dependencies, builds and caches. */
const SKIPPED_DIRS = new Set(['node_modules', 'frontend_dist', 'dist', '__pycache__', '.venv', '.git'])

/**
 * Every file below a folder whose name ends in the extension.
 *
 * @param dir the folder, which may be missing
 * @param ext the extension, with its dot
 * @returns the absolute paths
 */
export function walk(dir, ext) {
    if (!existsSync(dir)) return []
    const results = []
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
            if (!SKIPPED_DIRS.has(entry.name)) results.push(...walk(full, ext))
        } else if (entry.name.endsWith(ext)) {
            results.push(full)
        }
    }
    return results
}

/**
 * Every file of the given targets, each a folder or a file relative to the repository root.
 *
 * @param root the absolute repository root
 * @param targets `{path, extensions}` entries; `extensions` is null for a single file
 * @returns the absolute paths of the files that exist
 */
export function targetFiles(root, targets) {
    return targets.flatMap(target => {
        const absolute = join(root, target.path)
        if (!target.extensions) return existsSync(absolute) ? [absolute] : []
        return target.extensions.flatMap(extension => walk(absolute, extension))
    })
}

/**
 * A collector for errors that prints them grouped by category.
 *
 * @param root the absolute repository root, which file names in messages are relative to
 * @returns the reporter
 */
export function createReporter(root) {
    const errors = []
    const entry = (file, line, msg, category) => ({file: typeof file === 'string' && file.startsWith('/') ? relative(root, file) : file, line, msg, category})

    return {
        error(file, line, msg, category = '') {
            errors.push(entry(file, line, msg, category))
        },
        get errors() { return errors },

        /**
         * Prints the errors, or the message of a passed check when there are none.
         *
         * @param passed what a passed check says
         * @returns whether the check passed
         */
        finish(passed) {
            if (errors.length === 0) {
                console.log(`${GREEN}${BOLD}${passed}${RESET}`)
                return true
            }
            printGroup(errors, RED, 'Errors')
            return false
        },
    }
}

/**
 * Prints one group of findings, split by category when there is more than one.
 *
 * @param items the findings
 * @param color the colour of the label
 * @param label the group's name
 */
function printGroup(items, color, label) {
    if (items.length === 0) return
    console.log(`\n${color}${BOLD}${label} (${items.length}):${RESET}`)
    const groups = Map.groupBy(items, item => item.category || 'Other')
    for (const [category, entries] of groups) {
        if (groups.size > 1) console.log(`\n  ${BOLD}${category}${RESET}`)
        for (const e of entries) {
            const loc = e.line > 0 ? `:${e.line}` : ''
            console.log(`    ${color}${label.toLowerCase().slice(0, -1)}${RESET} ${e.file}${loc}: ${e.msg}`)
        }
    }
}
