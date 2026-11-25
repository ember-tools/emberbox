import ui from '@nuxt/ui/vite'
import type {NuxtUIOptions} from '@nuxt/ui/unplugin'
import {defu} from 'defu'
import {execSync} from 'node:child_process'
import type {PluginOption} from 'vite'
import {type Logo, logoPlugin} from './vite/logo.js'
import {prerenderPlugin, type PrerenderOptions} from './vite/prerender.js'

export {PAGES_DIR, type PrerenderOptions} from './vite/prerender.js'
export type {Logo} from './vite/logo.js'

/** Settings a tool passes to `emberbox()`. */
export interface EmberboxOptions {
    /** `false` for tools without vue-router; links are then rendered as plain anchors. */
    router?: boolean
    /** Additional Nuxt UI settings of the tool, applied on top of the Emberbox defaults. */
    ui?: NuxtUIOptions['ui']
    /** The public address, such as `https://calltaker.emberbox.app`; a trailing `/` is dropped. */
    url?: string
    /** Which Emberbox logo is served as favicon, touch icon and preview image. */
    logo?: Logo
    /** Which public pages are prerendered at build time; needs `url`. */
    prerender?: PrerenderOptions
}

const COLORS = ['primary', 'signal', 'success', 'info', 'warning', 'error']

/**
 * The defaults that make every Nuxt UI component appear in the Emberbox style. The colour names
 * point to the palettes in `style.css`; `primary` is ink there, red is kept for signals and errors.
 */
const DEFAULTS: NuxtUIOptions['ui'] = {
    colors: {
        primary: 'steel',
        signal: 'signal',
        success: 'green',
        info: 'blue',
        warning: 'amber',
        error: 'signal',
        neutral: 'slate',
    },
    formField: {
        slots: {
            label: 'field-label',
        },
    },
}

/**
 * Where to look for used icons. Unlike the `@nuxt/icon` default this includes `.ts` and `.js`
 * files, because tools list icons in menu and route tables.
 */
const ICON_SCAN = {
    globInclude: ['**/*.{vue,ts,tsx,js,jsx}'],
    globExclude: ['node_modules', 'dist', 'build', 'coverage', 'test', 'tests', '.*', '**/*.d.ts'],
}

/**
 * The icons of the `@emberbox/ui` components. The scan does not walk `node_modules`, so they are
 * listed here; whoever gives a component an icon adds it here.
 */
export const OWN_ICONS = [
    'i-lucide-check',
    'i-lucide-chevron-down',
    'i-lucide-chevron-right',
    'i-lucide-copy',
    'i-lucide-github',
    'i-lucide-layout-grid',
    'i-lucide-link',
    'i-lucide-qr-code',
    'i-lucide-rotate-cw',
    'i-lucide-x',
]

/**
 * Sets the class `dark` before the first paint, so the page does not flash light. Reads the same
 * key as Nuxt UI's colour mode (`useDark` from VueUse) and follows the system without a choice.
 */
export const COLOR_MODE_SCRIPT = `(function(){try{var w=localStorage.getItem('vueuse-color-scheme');var d=w==='dark'||((!w||w==='auto')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

/**
 * The short commit being built. An image build without `.git` passes it in as the environment
 * variable `COMMIT`; without either it is `dev`.
 */
function commit(): string {
    if (process.env.COMMIT) return process.env.COMMIT
    try {
        return execSync('git rev-parse --short HEAD', {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim()
    } catch {
        return 'dev'
    }
}

/**
 * Commit and build time of this build. Determined once per process, so the client and SSR build of
 * a tool carry the same build info.
 */
const BUILD_INFO = {commit: commit(), builtAt: process.env.BUILD_TIME || new Date().toISOString()}

/**
 * Sets up Nuxt UI in the Emberbox style and puts the colour mode script into every HTML page.
 * Replaces `@tailwindcss/vite` in a tool, since Nuxt UI brings it along. Icons are bundled from the
 * installed Iconify collections, so the browser fetches nothing from the Iconify API.
 *
 * Commit and build time (`BUILD_TIME` from the environment, or now) are available as `buildInfo`
 * from `@emberbox/ui`, and every build gets a `build.json` by which open pages notice a newer
 * build.
 */
export function emberbox(options: EmberboxOptions = {}): PluginOption[] {
    const url = options.url?.replace(/\/+$/, '') ?? ''
    if (options.prerender && !url) {
        throw new Error('emberbox(): prerendering needs a url.')
    }
    return [
        ui({
            router: options.router ?? true,
            theme: {colors: COLORS},
            ui: defu(options.ui, DEFAULTS),
            icon: {clientBundle: {scan: ICON_SCAN, icons: OWN_ICONS}},
            scanPackages: ['@emberbox/ui'],
            dts: false,
            components: {dirs: []},
        }),
        {
            name: 'emberbox',
            config: () => ({
                define: {
                    __EMBERBOX_COMMIT__: JSON.stringify(BUILD_INFO.commit),
                    __EMBERBOX_BUILT_AT__: JSON.stringify(BUILD_INFO.builtAt),
                    __EMBERBOX_URL__: JSON.stringify(url),
                    __EMBERBOX_IMAGE__: JSON.stringify(options.logo ? '/logo-512.png' : ''),
                },
                optimizeDeps: {exclude: ['@emberbox/ui', '@iconify/vue']},
                resolve: {dedupe: ['vue', 'vue-router', '@nuxt/ui']},
                ssr: {noExternal: ['@emberbox/ui', '@nuxt/ui']},
            }),
            transformIndexHtml: () => [
                {tag: 'script', children: COLOR_MODE_SCRIPT, injectTo: 'head'},
            ],
            generateBundle(this, output) {
                if (output.format === 'es' && !this.environment?.config.build.ssr) {
                    this.emitFile({type: 'asset', fileName: 'build.json', source: JSON.stringify(BUILD_INFO)})
                }
            },
        },
        options.logo ? logoPlugin(options.logo) : false,
        options.prerender && url ? prerenderPlugin(options.prerender, url) : false,
    ]
}
