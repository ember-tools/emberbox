import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import type {Plugin} from 'vite'

/** The tools for which `@emberbox/ui` ships a logo. */
export type Logo = 'emberbox' | 'alarmzettel' | 'statussim' | 'calltaker'

const LOGOS = fileURLToPath(new URL('../../logos/', import.meta.url))

const CONTENT_TYPES: Record<string, string> = {svg: 'image/svg+xml', png: 'image/png'}

/** Which file is served under which name at the tool's root. */
function logoFiles(logo: Logo): Record<string, string> {
    return {
        'favicon.svg': `${LOGOS}${logo}.svg`,
        'apple-touch-icon.png': `${LOGOS}${logo}-180.png`,
        'logo-512.png': `${LOGOS}${logo}-512.png`,
    }
}

/**
 * Serves a tool's logo as `favicon.svg`, `apple-touch-icon.png` and `logo-512.png` at the root, in
 * the dev server as in the build, and links the first two in the head of every page.
 */
export function logoPlugin(logo: Logo): Plugin {
    const files = logoFiles(logo)
    return {
        name: 'emberbox:logo',
        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                const name = request.url?.split('?')[0]?.slice(1) ?? ''
                const file = files[name]
                if (!file) return next()
                response.setHeader('Content-Type', CONTENT_TYPES[name.split('.').pop() ?? ''] ?? 'application/octet-stream')
                response.end(readFileSync(file))
            })
        },
        generateBundle() {
            if (this.environment?.config.build.ssr) return
            for (const [name, file] of Object.entries(files)) {
                this.emitFile({type: 'asset', fileName: name, source: readFileSync(file)})
            }
        },
        transformIndexHtml: () => [
            {tag: 'link', attrs: {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}, injectTo: 'head'},
            {tag: 'link', attrs: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'}, injectTo: 'head'},
        ],
    }
}
