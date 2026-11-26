import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import type {Plugin} from 'vite'
import {type RootFile, rootFilesPlugin} from './root-files.js'

/** The tools for which `@emberbox/ui` ships a logo. */
export type Logo = 'emberbox' | 'alarmzettel' | 'statussim' | 'calltaker' | 'planspiel' | 'lernkarten'

const LOGOS = fileURLToPath(new URL('../../logos/', import.meta.url))

/** Which file of the logo is served under which name at the tool's root. */
function logoFiles(logo: Logo): Record<string, RootFile> {
    const file = (source: string, type: string): RootFile => ({content: () => readFileSync(`${LOGOS}${source}`), type})
    return {
        'favicon.svg': file(`${logo}.svg`, 'image/svg+xml'),
        'apple-touch-icon.png': file(`${logo}-180.png`, 'image/png'),
        'logo-192.png': file(`${logo}-192.png`, 'image/png'),
        'logo-512.png': file(`${logo}-512.png`, 'image/png'),
        'logo-maskable-192.png': file(`${logo}-maskable-192.png`, 'image/png'),
        'logo-maskable-512.png': file(`${logo}-maskable-512.png`, 'image/png'),
    }
}

/**
 * Serves a tool's logo as `favicon.svg`, `apple-touch-icon.png`, `logo-192.png`, `logo-512.png` and the
 * maskable `logo-maskable-192.png` and `logo-maskable-512.png` at the root, in the dev server as in
 * the build, and links the first two in the head of every page; the rest are the app icons.
 */
export function logoPlugin(logo: Logo): Plugin {
    return {
        ...rootFilesPlugin('emberbox:logo', logoFiles(logo)),
        transformIndexHtml: () => [
            {tag: 'link', attrs: {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}, injectTo: 'head'},
            {tag: 'link', attrs: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'}, injectTo: 'head'},
        ],
    }
}
