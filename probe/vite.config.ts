import vue from '@vitejs/plugin-vue'
import {emberbox, helpPaths} from '@emberbox/ui/vite'
import {defineConfig} from 'vite'
import {HELP_TOPICS} from './src/help-topics'

export default defineConfig({
    plugins: [
        vue(),
        emberbox({
            url: 'https://probe.emberbox.app/',
            logo: 'calltaker',
            app: {name: 'Probe', shortName: 'Probe', description: 'Prüft die Bibliothek.', startUrl: '/hilfe'},
            prerender: {entry: 'src/prerender.ts', paths: ['/', ...helpPaths(HELP_TOPICS)]},
        }),
    ],
})
