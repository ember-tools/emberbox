/**
 * Erzeugt die Logos der Emberbox-Werkzeuge: je eine rote Plakette mit weißem Lucide-Piktogramm
 * als SVG, dazu PNG-Fassungen für Touch-Icons. Läuft nur, wenn ein Logo dazukommt oder sich
 * ändert; das Ergebnis liegt eingecheckt in `logos/`. Die PNGs rendert `resvg` aus `shell.nix`.
 */
import {execFileSync} from 'node:child_process'
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {join} from 'node:path'

const WERKZEUGE = {
    emberbox: 'toolbox',
    alarmzettel: 'clipboard-list',
    statussim: 'radio-tower',
    calltaker: 'headset',
}
const SIGNAL = '#d5271b'
const PNG_GROESSEN = [180, 512]

const lucide = JSON.parse(readFileSync(createRequire(import.meta.url).resolve('@iconify-json/lucide/icons.json'), 'utf8'))
const ziel = join(import.meta.dirname, '..', 'logos')
mkdirSync(ziel, {recursive: true})

for (const [werkzeug, icon] of Object.entries(WERKZEUGE)) {
    const koerper = lucide.icons[icon]?.body
    if (!koerper) throw new Error(`Lucide kennt kein Icon ${icon}`)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="${SIGNAL}"/><g transform="translate(14 14) scale(1.5)" color="#fff">${koerper}</g></svg>\n`
    const svgDatei = join(ziel, `${werkzeug}.svg`)
    writeFileSync(svgDatei, svg)
    for (const groesse of PNG_GROESSEN) {
        execFileSync('resvg', ['-w', String(groesse), '-h', String(groesse), svgDatei, join(ziel, `${werkzeug}-${groesse}.png`)])
    }
}
console.log(`Logos für ${Object.keys(WERKZEUGE).join(', ')} erzeugt.`)
