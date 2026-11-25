import ui from '@nuxt/ui/vite'
import type {NuxtUIOptions} from '@nuxt/ui/unplugin'
import {defu} from 'defu'
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
            label: 'font-condensed font-semibold text-xs uppercase tracking-[0.06em] text-muted',
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
 * Setzt vor dem ersten Zeichnen die Klasse `dark`, damit die Seite nicht hell aufblitzt. Liest
 * denselben Schlüssel wie Nuxt UIs Farbmodus (`useDark` aus VueUse) und folgt ohne Wahl dem System.
 */
export const FARBMODUS_SKRIPT = `(function(){try{var w=localStorage.getItem('vueuse-color-scheme');var d=w==='dark'||((!w||w==='auto')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

/**
 * Richtet Nuxt UI mit dem Emberbox-Stil ein und setzt das Farbmodus-Skript in jede HTML-Seite.
 * Ersetzt in einem Werkzeug `@tailwindcss/vite`, das Nuxt UI selbst mitbringt. Icons werden aus den
 * installierten Iconify-Sammlungen gebündelt, damit der Browser nichts bei der Iconify-API nachlädt.
 */
export function emberbox(optionen: EmberboxOptionen = {}): PluginOption[] {
    return [
        ui({
            router: optionen.router ?? true,
            theme: {colors: FARBEN},
            ui: defu(optionen.ui, VORGABEN),
            icon: {clientBundle: {scan: ICON_SUCHE}},
            scanPackages: ['@emberbox/ui'],
        }),
        {
            name: 'emberbox',
            config: () => ({
                optimizeDeps: {exclude: ['@emberbox/ui', '@iconify/vue']},
                resolve: {dedupe: ['vue', 'vue-router', '@nuxt/ui']},
                ssr: {noExternal: ['@emberbox/ui', '@nuxt/ui']},
            }),
            transformIndexHtml: () => [
                {tag: 'script', children: FARBMODUS_SKRIPT, injectTo: 'head'},
            ],
        },
    ]
}
