import vue from '@vitejs/plugin-vue'
import {emberbox} from '@emberbox/ui/vite'
import {defineConfig} from 'vite'

export default defineConfig({
    plugins: [
        vue(),
        emberbox({
            adresse: 'https://emberbox.app',
            logo: 'emberbox',
            vorrendern: {eintrag: 'src/vorrendern.ts', pfade: ['/', '/impressum', '/datenschutz']},
        }),
    ],
})
