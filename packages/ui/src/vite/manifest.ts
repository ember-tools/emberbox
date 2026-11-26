import type {Plugin} from 'vite'
import {rootFilesPlugin} from './root-files.js'

/** What a tool calls itself once it is installed as an app. */
export interface AppOptions {
    /** The full name, shown when the app is installed and in its window title. */
    name: string
    /** A short name for the home screen, the full name by default. */
    shortName?: string
    /** One sentence about what the app does. */
    description?: string
    /** Where the installed app opens, `/` by default; a tool whose start page is public points it at the app. */
    startUrl?: string
}

/** The colour of the app's title bar: the signal red of the logos. */
const THEME_COLOR = '#d5271b'

/** The splash screen behind the starting app: the logo's red, so it looks the same in light and dark mode. */
const BACKGROUND_COLOR = THEME_COLOR

const MANIFEST = 'manifest.webmanifest'

/**
 * The web app manifest of a tool, which makes it installable on phones and desktops. It starts at
 * the root, runs without browser chrome and uses the icons the logo plugin serves. There is no
 * service worker: the app always loads from the server, and the new-build banner remains the way
 * updates arrive.
 *
 * @param app the app's names and description
 * @returns the manifest as JSON
 */
function manifest(app: AppOptions): string {
    return JSON.stringify({
        id: '/',
        name: app.name,
        short_name: app.shortName ?? app.name,
        description: app.description,
        lang: 'de',
        start_url: app.startUrl ?? '/',
        scope: '/',
        display: 'standalone',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        icons: [
            {src: '/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {src: '/logo-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable'},
            {src: '/logo-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
            {src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any'},
        ],
    }, null, 2)
}

/**
 * Serves `manifest.webmanifest` at the root, in the dev server as in the build, and links it with
 * the theme colour in the head of every page.
 *
 * @param app the app's names and description
 * @returns the plugin
 */
export function manifestPlugin(app: AppOptions): Plugin {
    const source = manifest(app)
    return {
        ...rootFilesPlugin('emberbox:manifest', {[MANIFEST]: {content: () => source, type: 'application/manifest+json'}}),
        transformIndexHtml: () => [
            {tag: 'link', attrs: {rel: 'manifest', href: `/${MANIFEST}`}, injectTo: 'head'},
            {tag: 'meta', attrs: {name: 'theme-color', content: THEME_COLOR}, injectTo: 'head'},
        ],
    }
}
