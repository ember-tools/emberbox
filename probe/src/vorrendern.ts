import {seiteRendern} from '@emberbox/ui/vorrendern'
import {createSSRApp} from 'vue'
import {createMemoryHistory} from 'vue-router'
import App from './App.vue'
import {routerErzeugen} from './router'

/** Rendert eine öffentliche Seite der Probe vor. */
export async function render(pfad: string, vorlage: string): Promise<string> {
    const router = routerErzeugen(createMemoryHistory())
    const app = createSSRApp(App).use(router)
    await router.push(pfad)
    await router.isReady()
    return seiteRendern(app, vorlage)
}
