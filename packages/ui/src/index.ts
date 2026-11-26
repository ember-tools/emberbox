import {_api} from '@iconify/vue'
import nuxtUi from '@nuxt/ui/vue-plugin'
import type {App} from 'vue'

export {HUB_URL, IMPRINT_URL, PRIVACY_URL} from './urls'
export {buildInfo, formatBuiltAt} from './build-info'
export {createToolApp} from './create-app'
export {copyToClipboard} from './clipboard'
export {SITE_URL, usePage, webApplicationData, type PageMeta, type WebApplicationInfo} from './page'
export {useNewBuild} from './composables/useNewBuild'
export {usePolling} from './composables/usePolling'
export {createPoller, type Poller, type PollingOptions} from './poller'
export {cleanUpStorage, type StorageCleanUp} from './storage'
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
export {default as TextField} from './components/TextField.vue'
export {default as TextAreaField} from './components/TextAreaField.vue'
export {default as ComboboxField} from './components/ComboboxField.vue'
export {default as YesNoField} from './components/YesNoField.vue'
export {default as DateTimeField} from './components/DateTimeField.vue'
export {default as CollapsibleSection} from './components/CollapsibleSection.vue'
export {default as TacticalSymbol} from './components/TacticalSymbol.vue'
export {
    INCIDENT_MARK_KINDS, MARK_KINDS, SYMBOL_HEIGHT, SYMBOL_WIDTH, WATER_SUPPLY_MARK_KINDS, escapeSvg, markSymbol,
    markSymbolTree, unitSymbol, unitSymbolTree,
    type MarkKind, type Organisation, type SvgElement, type SymbolShape, type SymbolSpec, type UnitSize,
} from './symbols/tactical'
export {
    BASIC_FORMS, DRIVES, FLIGHTS, ORGANISATION_COLOURS, SIGN_FIGURES, SIGN_ORGANISATIONS, SIGN_SIZES, SUPPLEMENTS, VEHICLE_BODIES,
    tacticalSign, tacticalSignTree, type BasicForm, type Drive, type Flight, type SignFigure, type SignOrganisation, type SignSize,
    type SignStyle, type Supplement, type TacticalSignSpec, type VehicleBody,
} from './symbols/signs'
export {CATALOG_SOURCE, TACTICAL_SIGN_CATALOG, catalogSignTree, type CatalogEntry} from './symbols/catalog'
export {ABILITIES, type Ability, type AbilityName, type AbilityPart} from './symbols/abilities'
export {ADDITIONAL_SIGNS, additionalSign, additionalSignTree, type AdditionalSign, type AdditionalSignName} from './symbols/additional'
export type {BoxPart} from './symbols/svg'

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
