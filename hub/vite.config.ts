import vue from '@vitejs/plugin-vue'
import {emberbox} from '@emberbox/ui/vite'
import {defineConfig} from 'vite'

export default defineConfig({
    plugins: [
        vue(),
        emberbox({
            url: 'https://emberbox.app',
            logo: 'emberbox',
            prerender: {entry: 'src/prerender.ts', paths: ['/', '/impressum', '/datenschutz']},
        }),
    ],
})
