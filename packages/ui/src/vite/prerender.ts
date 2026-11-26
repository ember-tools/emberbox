import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs'
import {basename, extname, join, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {build, type Plugin, type ResolvedConfig} from 'vite'

/** Which pages of a tool become finished HTML at build time. */
export interface PrerenderOptions {
    /** Module that exports `render(path, template)`, such as `src/prerender.ts`. */
    entry: string
    /** The public paths, such as `['/', '/hilfe']`. */
    paths: string[]
}

/** What a tool's entry module provides. */
interface PrerenderEntry {
    render(path: string, template: string): Promise<string>
}

/** The directory below the build output that holds the prerendered pages. */
export const PAGES_DIR = 'pages'

function pageFile(outDir: string, path: string): string {
    return join(outDir, PAGES_DIR, path.replace(/^\/+|\/+$/g, ''), 'index.html')
}

function sitemap(url: string, paths: string[]): string {
    const entries = paths.map(path => `  <url><loc>${url}${path}</loc></url>`).join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

/**
 * Vue's compile-time feature flags with their production values. Dependencies that Node loads in
 * their bundler build, such as vue-i18n, read them as globals: a bundler replaces them, Node does not.
 * The values are the defaults of `@vitejs/plugin-vue`.
 */
const VUE_FLAGS = {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
}

/** Defines Vue's feature flags as globals where nothing has defined them yet, as Vue's own bundler build does. */
function defineVueFlags(): void {
    const scope = globalThis as Record<string, unknown>
    for (const [flag, value] of Object.entries(VUE_FLAGS)) scope[flag] ??= value
}

/**
 * Prerenders the public pages once the client build is written. It builds the entry as an SSR
 * bundle, calls `render` for every path with the built `index.html` as template and writes the
 * result to `pages/<path>/index.html`. `index.html` itself stays the empty shell for all other
 * routes. `sitemap.xml` and `robots.txt` are written next to it.
 */
export function prerenderPlugin(options: PrerenderOptions, url: string): Plugin {
    let config: ResolvedConfig
    return {
        name: 'emberbox:prerender',
        apply: 'build',
        configResolved(resolved) {
            config = resolved
        },
        async writeBundle() {
            if (config.build.ssr) return
            const outDir = resolve(config.root, config.build.outDir)
            const ssrOutDir = resolve(config.root, 'node_modules', '.emberbox-prerender')
            await build({
                configFile: config.configFile,
                root: config.root,
                mode: config.mode,
                logLevel: 'warn',
                build: {ssr: options.entry, outDir: ssrOutDir, emptyOutDir: true, copyPublicDir: false},
            })
            const name = basename(options.entry, extname(options.entry))
            const bundle = readdirSync(ssrOutDir).find(candidate => /^(.+)\.m?js$/.exec(candidate)?.[1] === name)
            if (!bundle) throw new Error(`The SSR bundle of ${options.entry} is missing in ${ssrOutDir}.`)
            defineVueFlags()
            const entry = await import(pathToFileURL(join(ssrOutDir, bundle)).href) as PrerenderEntry
            const template = readFileSync(join(outDir, 'index.html'), 'utf8')
            for (const path of options.paths) {
                const target = pageFile(outDir, path)
                mkdirSync(join(target, '..'), {recursive: true})
                writeFileSync(target, await entry.render(path, template))
            }
            writeFileSync(join(outDir, 'sitemap.xml'), sitemap(url, options.paths))
            writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`)
            rmSync(ssrOutDir, {recursive: true, force: true})
            config.logger.info(`emberbox: prerendered ${options.paths.length} pages`)
        },
    }
}
