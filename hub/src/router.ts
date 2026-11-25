import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

const entwicklung: RouteRecordRaw[] = import.meta.env.DEV
    ? [{path: '/muster', component: () => import('./muster/MusterSeite.vue')}]
    : []

/** Die Seiten des Hubs. Die Musterseite gibt es nur im Entwicklungsserver. */
export const router = createRouter({
    history: createWebHistory(),
    routes: [...entwicklung],
})
