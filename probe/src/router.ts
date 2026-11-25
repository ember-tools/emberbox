import {createRouter, type RouterHistory} from 'vue-router'

/** Die Seiten der Probe, für Browser und Vorrendern mit jeweils eigener History. */
export function routerErzeugen(history: RouterHistory) {
    return createRouter({
        history,
        routes: [
            {path: '/', component: () => import('./StartSeite.vue')},
            {path: '/hilfe', component: () => import('./HilfeSeite.vue')},
        ],
    })
}
