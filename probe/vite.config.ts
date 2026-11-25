import vue from '@vitejs/plugin-vue'
import {emberbox} from '@emberbox/ui/vite'
import {defineConfig} from 'vite'

export default defineConfig({
    plugins: [
        vue(),
        emberbox({
            adresse: 'https://probe.emberbox.app/',
            logo: 'calltaker',
            vorrendern: {eintrag: 'src/vorrendern.ts', pfade: ['/', '/hilfe']},
        }),
    ],
})
