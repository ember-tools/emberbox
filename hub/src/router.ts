import {createRouter, type RouteRecordRaw, type RouterHistory} from 'vue-router'

/** The public pages; every one of them is prerendered at build time. */
export const PAGES: RouteRecordRaw[] = [
    {path: '/', component: () => import('./pages/StartPage.vue')},
    {path: '/impressum', component: () => import('./pages/ImprintPage.vue')},
    {path: '/datenschutz', component: () => import('./pages/PrivacyPage.vue')},
]

const development: RouteRecordRaw[] = import.meta.env.DEV
    ? [
        {path: '/pattern', component: () => import('./pattern/PatternPage.vue'), meta: {bare: true}},
        {path: '/pattern/help', component: () => import('./pattern/HelpPatternPage.vue'), meta: {bare: true}},
        {path: '/pattern/signs', component: () => import('./pattern/SignsPatternPage.vue'), meta: {bare: true}},
    ]
    : []

/** The hub's router, with web history in the browser and memory history when prerendering. */
export function createHubRouter(history: RouterHistory) {
    return createRouter({history, routes: [...PAGES, ...development]})
}
