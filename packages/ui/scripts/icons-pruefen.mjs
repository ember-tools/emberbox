/**
 * Prüft, dass `EIGENE_ICONS` in `src/vite.ts` genau die Icons nennt, die die Komponenten der Lib
 * benutzen. Fehlt eines, bliebe es in jedem Werkzeug leer, denn die Icon-Suche eines Werkzeugs
 * durchläuft `node_modules` nicht; ein überzähliges würde grundlos mitgebündelt.
 */
import {readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

const quelle = join(import.meta.dirname, '..', 'src')
const ICON = /i-lucide-[a-z0-9-]+/g

const benutzt = new Set(
    readdirSync(join(quelle, 'komponenten'), {recursive: true})
        .filter(datei => String(datei).endsWith('.vue'))
        .flatMap(datei => readFileSync(join(quelle, 'komponenten', String(datei)), 'utf8').match(ICON) ?? []),
)
const liste = readFileSync(join(quelle, 'vite.ts'), 'utf8').match(/EIGENE_ICONS = \[([^\]]*)\]/)?.[1] ?? ''
const eingetragen = new Set(liste.match(ICON) ?? [])

const fehlend = [...benutzt].filter(icon => !eingetragen.has(icon))
const ueberzaehlig = [...eingetragen].filter(icon => !benutzt.has(icon))

if (fehlend.length || ueberzaehlig.length) {
    if (fehlend.length) console.error(`In EIGENE_ICONS fehlen: ${fehlend.join(', ')}`)
    if (ueberzaehlig.length) console.error(`In EIGENE_ICONS unbenutzt: ${ueberzaehlig.join(', ')}`)
    process.exit(1)
}
console.log(`EIGENE_ICONS stimmt (${benutzt.size} Icons).`)
