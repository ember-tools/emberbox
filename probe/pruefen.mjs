/**
 * Prüft den Build der Probe: vorgerenderte Seiten mit Inhalt und Kopfangaben, die leere Hülle,
 * Sitemap, robots.txt, fassung.json und die Logo-Dateien.
 */
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

const dist = join(import.meta.dirname, 'dist')
const fehler = []

function pruefe(bedingung, meldung) {
    if (!bedingung) fehler.push(meldung)
}

function lies(datei) {
    const pfad = join(dist, datei)
    pruefe(existsSync(pfad), `${datei} fehlt`)
    return existsSync(pfad) ? readFileSync(pfad, 'utf8') : ''
}

const start = lies('seiten/index.html')
pruefe(start.includes('Probe-Startseite'), 'Startseite ohne Inhalt')
pruefe(start.includes('<title>Probe – Emberbox</title>'), 'Startseite ohne Titel')
pruefe(!start.includes('<title>Probe</title>'), 'Startseite behält den Titel der Vorlage')
pruefe(start.includes('rel="canonical" href="https://probe.emberbox.app/"'), 'Startseite ohne canonical')
pruefe(start.includes('application/ld+json'), 'Startseite ohne strukturierte Daten')
pruefe(start.includes('og:title'), 'Startseite ohne OpenGraph')
pruefe(start.includes('content="https://probe.emberbox.app/logo-512.png"'), 'Startseite ohne Logo als Vorschaubild')
pruefe(start.includes('name="twitter:card" content="summary"'), 'Startseite ohne Twitter-Karte')
pruefe(start.includes('content="index, follow"'), 'Startseite ohne robots')
pruefe(start.includes('A-PROBE'), 'Startseite ohne Code-Anzeige')
pruefe(start.includes('<svg'), 'Startseite ohne gebündelte Icons')
pruefe(start.includes('nuxt-ui-colors'), 'Startseite ohne Farben')
pruefe(start.includes('<html lang="de"'), 'Startseite nicht als Deutsch ausgezeichnet')
pruefe((start.match(/<meta charset/g) ?? []).length === 1, 'Startseite mit doppeltem charset')
pruefe(start.includes("vueuse-color-scheme"), 'Startseite ohne Farbmodus-Skript')

const hilfe = lies('seiten/hilfe/index.html')
pruefe(hilfe.includes('Probe-Hilfe'), 'Hilfe ohne Inhalt')
pruefe(hilfe.includes('href="https://probe.emberbox.app/hilfe"'), 'Hilfe ohne canonical')

const huelle = lies('index.html')
pruefe(huelle.includes('<div id="app"></div>'), 'index.html ist nicht mehr die leere Hülle')
pruefe(huelle.includes('href="/favicon.svg"'), 'index.html ohne Favicon')

pruefe(lies('sitemap.xml').includes('<loc>https://probe.emberbox.app/hilfe</loc>'), 'Sitemap unvollständig')
pruefe(lies('robots.txt').includes('Sitemap: https://probe.emberbox.app/sitemap.xml'), 'robots.txt ohne Sitemap')
pruefe(!lies('sitemap.xml').includes('app//'), 'Adresse mit doppeltem Schrägstrich')
pruefe(JSON.parse(lies('fassung.json') || '{}').gebaut, 'fassung.json ohne Bauzeit')
const css = readdirSync(join(dist, 'assets')).filter(datei => datei.endsWith('.css')).map(datei => readFileSync(join(dist, 'assets', datei), 'utf8')).join('')
pruefe(css.includes('max-w-3xl'), 'Eigene Tailwind-Klassen der App fehlen im CSS')
pruefe(css.includes('--color-signal-500'), 'Emberbox-Theme fehlt im CSS')
for (const datei of ['favicon.svg', 'apple-touch-icon.png', 'logo-512.png']) pruefe(existsSync(join(dist, datei)), `${datei} fehlt`)

if (fehler.length) {
    console.error(`Probe fehlgeschlagen:\n- ${fehler.join('\n- ')}`)
    process.exit(1)
}
console.log('Probe bestanden: gepacktes Paket baut, rendert vor und liefert Logos, Sitemap und Fassung.')
