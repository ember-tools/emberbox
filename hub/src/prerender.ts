import {renderPage} from '@emberbox/ui/prerender'
import {createSSRApp} from 'vue'
import {createMemoryHistory} from 'vue-router'
import App from './App.vue'
import {createHubRouter} from './router'

/** Prerenders one page of the hub. */
export async function render(path: string, template: string): Promise<string> {
    const router = createHubRouter(createMemoryHistory())
    const app = createSSRApp(App).use(router)
    await router.push(path)
    await router.isReady()
    return renderPage(app, template)
}
