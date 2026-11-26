import {mkdirSync, writeFileSync} from 'node:fs'
import {join, resolve} from 'node:path'
import {createJiti} from 'jiti'

/** The one file the catalogue is written to, so a renamed catalogue leaves no stale keys behind. */
const SNAPSHOT = 'catalogue.json'

/**
 * A catalogue module as `@intlify/eslint-plugin-vue-i18n` reads it.
 *
 * <p>The plugin loads messages from JSON, YAML or CommonJS files only, and the catalogues of the
 * Emberbox projects are TypeScript modules. So the module is evaluated and written out as JSON
 * below `node_modules/.cache/emberbox-lint/locales` of the directory ESLint runs in, for the plugin's
 * `localeDir`.
 *
 * @param catalogue the catalogue module, relative to `cwd`
 * @param cwd the directory ESLint runs in
 * @returns the snapshot file, for the plugin's `localeDir` setting
 */
export async function localeSnapshots(catalogue, cwd) {
    const snapshots = resolve(cwd, 'node_modules/.cache/emberbox-lint/locales')
    const jiti = createJiti(import.meta.url, {moduleCache: false})
    const messages = await jiti.import(resolve(cwd, catalogue), {default: true})
    mkdirSync(snapshots, {recursive: true})
    writeFileSync(join(snapshots, SNAPSHOT), JSON.stringify(messages))
    return join(snapshots, SNAPSHOT)
}
