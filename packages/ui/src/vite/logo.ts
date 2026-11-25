import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import type {Plugin} from 'vite'

/** Die Werkzeuge, für die `@emberbox/ui` ein Logo mitbringt. */
export type Logo = 'emberbox' | 'alarmzettel' | 'statussim' | 'calltaker'

const LOGOS = fileURLToPath(new URL('../../logos/', import.meta.url))

/** Welche Datei unter welchem Namen im Wurzelverzeichnis des Werkzeugs liegt. */
function dateien(logo: Logo): Record<string, string> {
    return {
        'favicon.svg': `${LOGOS}${logo}.svg`,
        'apple-touch-icon.png': `${LOGOS}${logo}-180.png`,
        'logo-512.png': `${LOGOS}${logo}-512.png`,
    }
}

const TYPEN: Record<string, string> = {svg: 'image/svg+xml', png: 'image/png'}

/**
 * Liefert das Logo eines Werkzeugs als `favicon.svg`, `apple-touch-icon.png` und `logo-512.png`
 * im Wurzelverzeichnis aus, im Entwicklungsserver wie im Build, und verlinkt die ersten beiden im
 * Kopf jeder Seite.
 */
export function logoPlugin(logo: Logo): Plugin {
    const liste = dateien(logo)
    return {
        name: 'emberbox:logo',
        configureServer(server) {
            server.middlewares.use((anfrage, antwort, weiter) => {
                const name = anfrage.url?.split('?')[0]?.slice(1) ?? ''
                const datei = liste[name]
                if (!datei) return weiter()
                antwort.setHeader('Content-Type', TYPEN[name.split('.').pop() ?? ''] ?? 'application/octet-stream')
                antwort.end(readFileSync(datei))
            })
        },
        generateBundle() {
            if (this.environment?.config.build.ssr) return
            for (const [name, datei] of Object.entries(liste)) {
                this.emitFile({type: 'asset', fileName: name, source: readFileSync(datei)})
            }
        },
        transformIndexHtml: () => [
            {tag: 'link', attrs: {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}, injectTo: 'head'},
            {tag: 'link', attrs: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'}, injectTo: 'head'},
        ],
    }
}
