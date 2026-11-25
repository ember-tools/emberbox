import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs'
import {basename, extname, join, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {build, type Plugin, type ResolvedConfig} from 'vite'

/** Welche Seiten eines Werkzeugs beim Bauen als fertiges HTML entstehen. */
export interface VorrendernOptionen {
    /** Modul, das `render(pfad, vorlage)` exportiert, etwa `src/vorrendern.ts`. */
    eintrag: string
    /** Die öffentlichen Pfade, etwa `['/', '/hilfe']`. */
    pfade: string[]
}

/** Was das Eintragsmodul eines Werkzeugs bereitstellt. */
interface Eintrag {
    render(pfad: string, vorlage: string): Promise<string>
}

/** Das Verzeichnis unter dem Build, in dem die vorgerenderten Seiten liegen. */
export const SEITEN_VERZEICHNIS = 'seiten'

function seitenDatei(ausgabe: string, pfad: string): string {
    return join(ausgabe, SEITEN_VERZEICHNIS, pfad.replace(/^\/+|\/+$/g, ''), 'index.html')
}

function sitemap(adresse: string, pfade: string[]): string {
    const eintraege = pfade.map(pfad => `  <url><loc>${adresse}${pfad}</loc></url>`).join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`
}

/**
 * Rendert nach dem Client-Build die öffentlichen Seiten vor. Dazu baut es den Eintrag als
 * SSR-Bündel, ruft für jeden Pfad `render` mit der gebauten `index.html` als Vorlage auf und legt
 * das Ergebnis unter `seiten/<pfad>/index.html` ab. Die `index.html` selbst bleibt die leere Hülle
 * für alle übrigen Routen. Daneben entstehen `sitemap.xml` und `robots.txt`.
 */
export function vorrenderPlugin(optionen: VorrendernOptionen, adresse: string): Plugin {
    let config: ResolvedConfig
    return {
        name: 'emberbox:vorrendern',
        apply: 'build',
        configResolved(aufgeloest) {
            config = aufgeloest
        },
        async writeBundle() {
            if (config.build.ssr) return
            const ausgabe = resolve(config.root, config.build.outDir)
            const ssrAusgabe = resolve(config.root, 'node_modules', '.emberbox-vorrendern')
            await build({
                configFile: config.configFile,
                root: config.root,
                mode: config.mode,
                logLevel: 'warn',
                build: {ssr: optionen.eintrag, outDir: ssrAusgabe, emptyOutDir: true, copyPublicDir: false},
            })
            const name = basename(optionen.eintrag, extname(optionen.eintrag))
            const datei = readdirSync(ssrAusgabe).find(kandidat => /^(.+)\.m?js$/.exec(kandidat)?.[1] === name)
            if (!datei) throw new Error(`Das SSR-Bündel von ${optionen.eintrag} fehlt in ${ssrAusgabe}.`)
            const eintrag = await import(pathToFileURL(join(ssrAusgabe, datei)).href) as Eintrag
            const vorlage = readFileSync(join(ausgabe, 'index.html'), 'utf8')
            for (const pfad of optionen.pfade) {
                const ziel = seitenDatei(ausgabe, pfad)
                mkdirSync(join(ziel, '..'), {recursive: true})
                writeFileSync(ziel, await eintrag.render(pfad, vorlage))
            }
            writeFileSync(join(ausgabe, 'sitemap.xml'), sitemap(adresse, optionen.pfade))
            writeFileSync(join(ausgabe, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${adresse}/sitemap.xml\n`)
            rmSync(ssrAusgabe, {recursive: true, force: true})
            config.logger.info(`emberbox: ${optionen.pfade.length} Seiten vorgerendert`)
        },
    }
}
