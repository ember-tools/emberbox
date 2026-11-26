import {renderPage} from '@emberbox/ui/prerender'
import {createSSRApp} from 'vue'
import {createMemoryHistory} from 'vue-router'
import App from './App.vue'
import {createProbeRouter} from './router'

/**
 * Prerenders one public page of the probe. It fails when Vue's feature flags are not globals, since
 * dependencies that Node loads in their bundler build read them there.
 */
export async function render(path: string, template: string): Promise<string> {
    if (typeof Reflect.get(globalThis, '__VUE_PROD_DEVTOOLS__') !== 'boolean') {
        throw new Error('The Vue feature flags are not defined as globals.')
    }
    const router = createProbeRouter(createMemoryHistory())
    const app = createSSRApp(App).use(router)
    await router.push(path)
    await router.isReady()
    return renderPage(app, template)
}
