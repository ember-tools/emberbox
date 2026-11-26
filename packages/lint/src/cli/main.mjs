#!/usr/bin/env node
import {spawnSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, join, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {checkBrowserStorage} from './browser-storage.mjs'
import {checkComments} from './comments.mjs'
import {checkEmDash} from './em-dash.mjs'

const require = createRequire(import.meta.url)
const CONFIG_FILE = 'emberbox-lint.config.mjs'

/**
 * The project's lint configuration from `emberbox-lint.config.mjs` in the working directory, the
 * frontend that ESLint also runs in.
 *
 * <p>It exports `root`, the repository root relative to the frontend (`.` by default); `sources`,
 * the `{path, extensions}` targets the comment and the em dash linter read (`extensions` null for a
 * single file); `text`, further targets only the em dash linter reads; `browserStorage`, a
 * `{catalogue, sources}` pair when the project keeps a catalogue; and `duplication`, the jscpd
 * config file when the project measures duplication. Paths of targets and of the catalogue are
 * relative to the root.
 *
 * @returns the configuration, with `root` absolute
 */
async function loadConfig() {
    const file = resolve(CONFIG_FILE)
    if (!existsSync(file)) {
        console.error(`No ${CONFIG_FILE} in ${process.cwd()}.`)
        process.exit(2)
    }
    const config = (await import(pathToFileURL(file).href)).default
    return {...config, root: resolve(config.root ?? '.'), sources: config.sources ?? [], text: config.text ?? []}
}

/**
 * Runs a package's command line tool in the working directory and answers its exit code.
 *
 * @param pkg the package that brings the tool
 * @param bin the path of its entry point inside the package
 * @param args the arguments
 * @returns the exit code, 1 when it could not be started
 */
function runTool(pkg, bin, args) {
    const entry = join(dirname(require.resolve(`${pkg}/package.json`)), bin)
    return spawnSync(process.execPath, [entry, ...args], {stdio: 'inherit'}).status ?? 1
}

/**
 * The linters of a project, each with its name and how it runs. A linter the configuration does not
 * ask for is left out.
 *
 * @param config the loaded configuration
 * @returns the linters, in the order they run
 */
function lintersOf(config) {
    return [
        {name: 'eslint', run: extra => runTool('eslint', 'bin/eslint.js', ['--max-warnings=0', ...extra]) === 0},
        config.duplication && {name: 'duplication', run: extra => runTool('jscpd', 'run-jscpd.js', ['--config', config.duplication, ...extra]) === 0},
        config.browserStorage && {name: 'browser-storage', run: () => checkBrowserStorage(config.root, config.browserStorage)},
        {name: 'em-dash', run: () => checkEmDash(config.root, [...config.sources, ...config.text])},
        {name: 'comments', run: () => checkComments(config.root, config.sources)},
    ].filter(Boolean)
}

/**
 * Runs one linter; one that crashes counts as failed, so the linters after it still run.
 *
 * @param linter the linter
 * @param extra arguments for ESLint or jscpd
 * @returns whether it passed
 */
function passes(linter, extra) {
    try {
        return linter.run(extra)
    } catch (error) {
        console.error(`${linter.name} could not run: ${error instanceof Error ? error.message : error}`)
        return false
    }
}

/**
 * Runs the project's linters.
 *
 * <p>`emberbox-lint` runs all of them and fails when any of them fails, after every one has had its
 * say, so one run shows the whole picture. `--audit` runs all of them and never fails.
 * `emberbox-lint <name> [args]` runs one, handing the arguments on to ESLint or jscpd.
 *
 * @param args the command line arguments
 */
async function main(args) {
    const linters = lintersOf(await loadConfig())
    if (args.length > 0 && args[0] !== '--audit') {
        const [name, ...rest] = args
        const linter = linters.find(candidate => candidate.name === name)
        if (!linter) {
            console.error(`No linter named '${name}'. Known: ${linters.map(candidate => candidate.name).join(', ')}`)
            process.exit(2)
        }
        process.exit(passes(linter, rest) ? 0 : 1)
    }
    const failed = linters.filter(linter => !passes(linter, [])).map(linter => linter.name)
    if (failed.length === 0) return
    console.error(`\nLinters failed: ${failed.join(', ')}`)
    if (args[0] !== '--audit') process.exit(1)
}

await main(process.argv.slice(2))
