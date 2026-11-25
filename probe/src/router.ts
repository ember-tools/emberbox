import {createRouter, type RouterHistory} from 'vue-router'

/** The probe's pages, with a separate history for the browser and for prerendering. */
export function createProbeRouter(history: RouterHistory) {
    return createRouter({
        history,
        routes: [
            {path: '/', component: () => import('./StartView.vue')},
            {path: '/hilfe', component: () => import('./HelpView.vue')},
        ],
    })
}
