import {createHead, transformHtmlTemplate} from '@unhead/vue/server'
import type {App} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {emberboxUi} from './index'

/**
 * Renders a fully set up app (router on the path, data loaded) to a complete HTML page. Installs
 * head management and Nuxt UI itself, so the app must not use `emberboxUi` yet. The content goes
 * into the template's `<div id="app">`, title and meta tags into its head.
 *
 * @param app the app created with `createSSRApp`
 * @param template the tool's built `index.html`
 * @returns the prerendered page
 */
export async function renderPage(app: App, template: string): Promise<string> {
    const head = createHead({disableDefaults: true})
    app.use(head)
    app.use(emberboxUi)
    const content = await renderToString(app)
    const page = template.replace('<div id="app"></div>', `<div id="app">${content}</div>`)
    if (page === template) throw new Error('The template has no empty <div id="app"></div>.')
    return transformHtmlTemplate(head, page)
}
