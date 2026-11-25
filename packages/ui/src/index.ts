import {_api} from '@iconify/vue'
import nuxtUi from '@nuxt/ui/vue-plugin'
import type {App} from 'vue'

export {HUB_URL, IMPRINT_URL, PRIVACY_URL} from './urls'
export {buildInfo, formatBuiltAt} from './build-info'
export {createToolApp} from './create-app'
export {copyToClipboard} from './clipboard'
export {SITE_URL, usePage, webApplicationData, type PageMeta, type WebApplicationInfo} from './page'
export {useNewBuild} from './composables/useNewBuild'
export {usePolling, type PollingOptions} from './composables/usePolling'
export {useConfirm, type ConfirmOptions} from './composables/useConfirm'
export {default as EmberboxApp} from './components/EmberboxApp.vue'
export {default as AppHeader} from './components/AppHeader.vue'
export {default as AppFooter} from './components/AppFooter.vue'
export {default as NewBuildBanner} from './components/NewBuildBanner.vue'
export {default as CodeDisplay} from './components/CodeDisplay.vue'
export {default as ConfirmDialog} from './components/ConfirmDialog.vue'
export {default as HelpPage} from './components/HelpPage.vue'
export {default as HelpSection} from './components/HelpSection.vue'
export {default as HelpTopic} from './components/HelpTopic.vue'
export {default as HelpMockup} from './components/HelpMockup.vue'

/**
 * Vue plugin that installs Nuxt UI in the Emberbox style. Icons come only from the bundled set; a
 * missing icon stays empty instead of being fetched from the Iconify API, so no visit to a tool
 * reaches a third party.
 */
export const emberboxUi = {
    install(app: App) {
        _api.setFetch(() => Promise.reject(new Error('Icons are not fetched at runtime.')))
        app.use(nuxtUi)
    },
}
