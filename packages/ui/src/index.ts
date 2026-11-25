import {_api} from '@iconify/vue'
import nuxtUi from '@nuxt/ui/vue-plugin'
import type {App} from 'vue'

export {HUB_URL, IMPRESSUM_URL, DATENSCHUTZ_URL} from './adressen'
export {fassung, gebautLesbar} from './fassung'
export {useNeueFassung} from './composables/useNeueFassung'
export {usePolling, type PollingOptionen} from './composables/usePolling'
export {useRueckfrage, type RueckfrageOptionen} from './composables/useRueckfrage'
export {default as EmberboxApp} from './komponenten/EmberboxApp.vue'
export {default as AppKopf} from './komponenten/AppKopf.vue'
export {default as AppFuss} from './komponenten/AppFuss.vue'
export {default as NeueFassung} from './komponenten/NeueFassung.vue'
export {default as CodeAnzeige} from './komponenten/CodeAnzeige.vue'
export {default as Rueckfrage} from './komponenten/Rueckfrage.vue'
export {default as HilfeSeite} from './komponenten/HilfeSeite.vue'
export {default as HilfeAbschnitt} from './komponenten/HilfeAbschnitt.vue'
export {default as HilfeThema} from './komponenten/HilfeThema.vue'
export {default as HilfeMockup} from './komponenten/HilfeMockup.vue'

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
