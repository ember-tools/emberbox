import {createHead, transformHtmlTemplate} from '@unhead/vue/server'
import type {App} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {emberboxUi} from './index'

/**
 * Rendert eine fertig eingerichtete App (Router auf dem Pfad, Daten geladen) zu einer ganzen
 * HTML-Seite. Hängt Kopfverwaltung und Nuxt UI selbst ein; die App darf `emberboxUi` daher noch
 * nicht benutzen. Der Inhalt landet im `<div id="app">` der Vorlage, Titel und Meta-Angaben im
 * Kopf.
 *
 * @param app die mit `createSSRApp` erzeugte App
 * @param vorlage die gebaute `index.html` des Werkzeugs
 * @returns die vorgerenderte Seite
 */
export async function seiteRendern(app: App, vorlage: string): Promise<string> {
    const kopf = createHead({disableDefaults: true})
    app.use(kopf)
    app.use(emberboxUi)
    const inhalt = await renderToString(app)
    const seite = vorlage.replace('<div id="app"></div>', `<div id="app">${inhalt}</div>`)
    if (seite === vorlage) throw new Error('Die Vorlage hat kein leeres <div id="app"></div>.')
    return transformHtmlTemplate(kopf, seite)
}
