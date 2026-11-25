import {_api} from '@iconify/vue'
import nuxtUi from '@nuxt/ui/vue-plugin'
import type {App} from 'vue'

/**
 * Vue-Plugin, das Nuxt UI im Emberbox-Stil in eine App einhängt. Icons kommen ausschließlich aus
 * dem gebündelten Satz; ein fehlendes Icon bleibt leer, statt bei der Iconify-API nachgeladen zu
 * werden, damit kein Besuch eines Werkzeugs bei einem Dritten landet.
 */
export const emberboxUi = {
    install(app: App) {
        _api.setFetch(() => Promise.reject(new Error('Icons werden nicht nachgeladen.')))
        app.use(nuxtUi)
    },
}
