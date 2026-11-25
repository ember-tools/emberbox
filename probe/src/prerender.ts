import {renderPage} from '@emberbox/ui/prerender'
import {createSSRApp} from 'vue'
import {createMemoryHistory} from 'vue-router'
import App from './App.vue'
import {createProbeRouter} from './router'

/** Prerenders one public page of the probe. */
export async function render(path: string, template: string): Promise<string> {
    const router = createProbeRouter(createMemoryHistory())
    const app = createSSRApp(App).use(router)
    await router.push(path)
    await router.isReady()
    return renderPage(app, template)
}
