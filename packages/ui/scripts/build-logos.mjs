/**
 * Generates the logos of the Emberbox tools: a red plaque with a white Lucide pictogram as SVG,
 * plus PNG versions for touch and app icons. The maskable variant fills the whole square, since a
 * device cuts its own shape out of it; the pictogram already sits inside the safe zone. Run it only
 * when a logo is added or changed; the output is checked in under `logos/`. The PNGs are rendered
 * by `resvg` from `shell.nix`.
 */
import {execFileSync} from 'node:child_process'
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {join} from 'node:path'

const TOOLS = {
    emberbox: 'toolbox',
    alarmzettel: 'clipboard-list',
    statussim: 'radio-tower',
    calltaker: 'headset',
    planspiel: 'map-pinned',
    lernkarten: 'graduation-cap',
    foerderstrecke: 'droplets',
}
const SIGNAL = '#d5271b'
const PNG_SIZES = [180, 192, 512]
const MASKABLE_SIZES = [192, 512]

const lucide = JSON.parse(readFileSync(createRequire(import.meta.url).resolve('@iconify-json/lucide/icons.json'), 'utf8'))
const target = join(import.meta.dirname, '..', 'logos')
mkdirSync(target, {recursive: true})

for (const [tool, icon] of Object.entries(TOOLS)) {
    const body = lucide.icons[icon]?.body
    if (!body) throw new Error(`Lucide has no icon ${icon}`)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="${SIGNAL}"/><g transform="translate(14 14) scale(1.5)" color="#fff">${body}</g></svg>\n`
    const svgFile = join(target, `${tool}.svg`)
    writeFileSync(svgFile, svg)
    for (const size of PNG_SIZES) {
        execFileSync('resvg', ['-w', String(size), '-h', String(size), svgFile, join(target, `${tool}-${size}.png`)])
    }
    const maskable = svg.replace(' rx="8"', '')
    for (const size of MASKABLE_SIZES) {
        execFileSync('resvg', ['-w', String(size), '-h', String(size), '-', join(target, `${tool}-maskable-${size}.png`)], {input: maskable})
    }
}
console.log(`Generated logos for ${Object.keys(TOOLS).join(', ')}.`)
