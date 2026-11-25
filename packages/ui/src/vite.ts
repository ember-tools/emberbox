import ui from '@nuxt/ui/vite'
import type {NuxtUIOptions} from '@nuxt/ui/unplugin'
import {defu} from 'defu'
import {execSync} from 'node:child_process'
import type {PluginOption} from 'vite'

/** Einstellungen, mit denen ein Werkzeug `emberbox()` an seine Lage anpasst. */
export interface EmberboxOptionen {
    /** `false` für Werkzeuge ohne vue-router; Links werden dann als einfache Anker gerendert. */
    router?: boolean
    /** Zusätzliche Nuxt-UI-Einstellungen des Werkzeugs, die über die Emberbox-Vorgaben gelegt werden. */
    ui?: NuxtUIOptions['ui']
}

const FARBEN = ['primary', 'signal', 'success', 'info', 'warning', 'error']

/**
 * Die Vorgaben, mit denen jede Nuxt-UI-Komponente im Emberbox-Stil erscheint. Die Farbnamen zeigen
 * auf die Paletten aus `stil.css`; `primary` ist dort die Tinte, Rot bleibt Signalen und Fehlern.
 */
const VORGABEN: NuxtUIOptions['ui'] = {
    colors: {
        primary: 'stahl',
        signal: 'signal',
        success: 'green',
        info: 'blue',
        warning: 'amber',
        error: 'signal',
        neutral: 'slate',
    },
    formField: {
        slots: {
            label: 'feld-label',
        },
    },
}

/**
 * Wo nach benutzten Icons gesucht wird. Anders als die Vorgabe von `@nuxt/icon` auch in `.ts`- und
 * `.js`-Dateien, weil Werkzeuge Icons in Menü- und Routentabellen eintragen.
 */
const ICON_SUCHE = {
    globInclude: ['**/*.{vue,ts,tsx,js,jsx}'],
    globExclude: ['node_modules', 'dist', 'build', 'coverage', 'test', 'tests', '.*', '**/*.d.ts'],
}

/**
 * Die Icons der Komponenten aus `@emberbox/ui`. Die Suche durchläuft `node_modules` nicht, also
 * stehen sie hier fest; wer einer Komponente ein Icon gibt, trägt es hier ein.
 */
export const EIGENE_ICONS = [
    'i-lucide-check',
    'i-lucide-copy',
    'i-lucide-github',
    'i-lucide-layout-grid',
    'i-lucide-link',
    'i-lucide-qr-code',
    'i-lucide-rotate-cw',
    'i-lucide-x',
]

/**
 * Setzt vor dem ersten Zeichnen die Klasse `dark`, damit die Seite nicht hell aufblitzt. Liest
 * denselben Schlüssel wie Nuxt UIs Farbmodus (`useDark` aus VueUse) und folgt ohne Wahl dem System.
 */
export const FARBMODUS_SKRIPT = `(function(){try{var w=localStorage.getItem('vueuse-color-scheme');var d=w==='dark'||((!w||w==='auto')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

/**
 * Der kurze Commit, aus dem gebaut wird. Ein Image-Build ohne `.git` reicht ihn als Umgebungsvariable
 * `COMMIT` herein; ohne beides heißt er `dev`.
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
 * Commit und Bauzeit dieses Bauvorgangs. Einmal je Prozess bestimmt, damit Client- und SSR-Build
 * eines Werkzeugs dieselbe Fassung tragen.
 */
const FASSUNG = {commit: commit(), gebaut: process.env.GEBAUT || new Date().toISOString()}

/**
 * Richtet Nuxt UI mit dem Emberbox-Stil ein und setzt das Farbmodus-Skript in jede HTML-Seite.
 * Ersetzt in einem Werkzeug `@tailwindcss/vite`, das Nuxt UI selbst mitbringt. Icons werden aus den
 * installierten Iconify-Sammlungen gebündelt, damit der Browser nichts bei der Iconify-API nachlädt.
 *
 * Außerdem stehen Commit und Bauzeit (`GEBAUT` aus der Umgebung oder jetzt) als `fassung` aus
 * `@emberbox/ui` bereit, und neben jedem Build liegt `fassung.json`, an der offene Seiten einen
 * neueren Build erkennen.
 */
export function emberbox(optionen: EmberboxOptionen = {}): PluginOption[] {
    return [
        ui({
            router: optionen.router ?? true,
            theme: {colors: FARBEN},
            ui: defu(optionen.ui, VORGABEN),
            icon: {clientBundle: {scan: ICON_SUCHE, icons: EIGENE_ICONS}},
            scanPackages: ['@emberbox/ui'],
        }),
        {
            name: 'emberbox',
            config: () => ({
                define: {
                    __EMBERBOX_COMMIT__: JSON.stringify(FASSUNG.commit),
                    __EMBERBOX_GEBAUT__: JSON.stringify(FASSUNG.gebaut),
                },
                optimizeDeps: {exclude: ['@emberbox/ui', '@iconify/vue']},
                resolve: {dedupe: ['vue', 'vue-router', '@nuxt/ui']},
                ssr: {noExternal: ['@emberbox/ui', '@nuxt/ui']},
            }),
            transformIndexHtml: () => [
                {tag: 'script', children: FARBMODUS_SKRIPT, injectTo: 'head'},
            ],
            generateBundle(this, ausgabe) {
                if (ausgabe.format === 'es' && !this.environment?.config.build.ssr) {
                    this.emitFile({type: 'asset', fileName: 'fassung.json', source: JSON.stringify(FASSUNG)})
                }
            },
        },
    ]
}
