/**
 * Checks that `OWN_ICONS` in `src/vite.ts` lists exactly the icons the library's components use. A
 * missing one would stay empty in every tool, because a tool's icon scan does not walk
 * `node_modules`; an extra one would be bundled for nothing.
 */
import {readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

const source = join(import.meta.dirname, '..', 'src')
const ICON = /i-lucide-[a-z0-9-]+/g

const used = new Set(
    readdirSync(join(source, 'components'), {recursive: true})
        .filter(file => String(file).endsWith('.vue'))
        .flatMap(file => readFileSync(join(source, 'components', String(file)), 'utf8').match(ICON) ?? []),
)
const list = readFileSync(join(source, 'vite.ts'), 'utf8').match(/OWN_ICONS = \[([^\]]*)\]/)?.[1] ?? ''
const listed = new Set(list.match(ICON) ?? [])

const missing = [...used].filter(icon => !listed.has(icon))
const unused = [...listed].filter(icon => !used.has(icon))

if (missing.length || unused.length) {
    if (missing.length) console.error(`Missing from OWN_ICONS: ${missing.join(', ')}`)
    if (unused.length) console.error(`Unused in OWN_ICONS: ${unused.join(', ')}`)
    process.exit(1)
}
console.log(`OWN_ICONS matches (${used.size} icons).`)
