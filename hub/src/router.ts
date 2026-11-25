import {createRouter, type RouteRecordRaw, type RouterHistory} from 'vue-router'

/** Die öffentlichen Seiten; jede wird beim Bauen vorgerendert. */
export const SEITEN: RouteRecordRaw[] = [
    {path: '/', component: () => import('./seiten/StartSeite.vue')},
    {path: '/impressum', component: () => import('./seiten/ImpressumSeite.vue')},
    {path: '/datenschutz', component: () => import('./seiten/DatenschutzSeite.vue')},
]

const entwicklung: RouteRecordRaw[] = import.meta.env.DEV
    ? [
        {path: '/muster', component: () => import('./muster/MusterSeite.vue')},
        {path: '/muster/hilfe', component: () => import('./muster/HilfeMuster.vue')},
    ]
    : []

/** Der Router des Hubs, im Browser mit Web-History, beim Vorrendern mit Memory-History. */
export function routerErzeugen(history: RouterHistory) {
    return createRouter({history, routes: [...SEITEN, ...entwicklung]})
}
