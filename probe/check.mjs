/**
 * Checks the probe's build: prerendered pages with content and head tags, the empty shell,
 * sitemap, robots.txt, build.json and the logo files.
 */
import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

const dist = join(import.meta.dirname, 'dist')
const failures = []

function expect(condition, message) {
    if (!condition) failures.push(message)
}

function read(file) {
    const path = join(dist, file)
    expect(existsSync(path), `${file} is missing`)
    return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

const start = read('pages/index.html')
expect(start.includes('Probe-Startseite'), 'start page has no content')
expect(start.includes('<title>Probe – Emberbox</title>'), 'start page has no title')
expect(!start.includes('<title>Probe</title>'), 'start page keeps the template title')
expect(start.includes('rel="canonical" href="https://probe.emberbox.app/"'), 'start page has no canonical')
expect(start.includes('application/ld+json'), 'start page has no structured data')
expect(start.includes('og:title'), 'start page has no OpenGraph')
expect(start.includes('content="https://probe.emberbox.app/logo-512.png"'), 'start page has no logo as preview image')
expect(start.includes('name="twitter:card" content="summary"'), 'start page has no Twitter card')
expect(start.includes('content="index, follow"'), 'start page has no robots')
expect(start.includes('A-PROBE'), 'start page has no code display')
expect(start.includes('Probe-Feld') && start.includes('<datalist'), 'start page has no text field')
expect(start.includes('Inhalt des Probe-Abschnitts') && start.includes('aria-expanded="true"'), 'start page has no open collapsible section')
expect(/href="https:\/\/emberbox\.app"[^>]*>(?:(?!<\/a>).)*Ein Werkzeug der/s.test(start), 'start page has no backlink to the hub')
expect(start.includes('<svg'), 'start page has no bundled icons')
expect(start.includes('nuxt-ui-colors'), 'start page has no colours')
expect(start.includes('<html lang="de"'), 'start page is not marked as German')
expect((start.match(/<meta charset/g) ?? []).length === 1, 'start page has a duplicate charset')
expect(start.includes('vueuse-color-scheme'), 'start page has no colour mode script')

const help = read('pages/hilfe/index.html')
expect(help.includes('Probe-Hilfe'), 'help page has no content')
expect(help.includes('href="https://probe.emberbox.app/hilfe"'), 'help page has no canonical')

const shell = read('index.html')
expect(shell.includes('<div id="app"></div>'), 'index.html is no longer the empty shell')
expect(shell.includes('href="/favicon.svg"'), 'index.html has no favicon')

expect(read('sitemap.xml').includes('<loc>https://probe.emberbox.app/hilfe</loc>'), 'sitemap is incomplete')
expect(read('robots.txt').includes('Sitemap: https://probe.emberbox.app/sitemap.xml'), 'robots.txt has no sitemap')
expect(!read('sitemap.xml').includes('app//'), 'url has a double slash')
expect(JSON.parse(read('build.json') || '{}').builtAt, 'build.json has no build time')
const css = readdirSync(join(dist, 'assets')).filter(file => file.endsWith('.css')).map(file => readFileSync(join(dist, 'assets', file), 'utf8')).join('')
expect(css.includes('max-w-3xl'), "the app's own Tailwind classes are missing from the CSS")
expect(css.includes('--color-signal-500'), 'the Emberbox theme is missing from the CSS')
for (const file of ['favicon.svg', 'apple-touch-icon.png', 'logo-512.png']) expect(existsSync(join(dist, file)), `${file} is missing`)

if (failures.length) {
    console.error(`Probe failed:\n- ${failures.join('\n- ')}`)
    process.exit(1)
}
console.log('Probe passed: the packed library builds, prerenders and ships logos, sitemap and build info.')
