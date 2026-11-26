import {createRouter, type RouterHistory} from 'vue-router'
import {HELP_TOPICS} from './help-topics'

/**
 * The probe's pages, with a separate history for the browser and for prerendering. An unknown help
 * topic leads to the overview, also when coming from another topic, and every new page starts at
 * the top.
 */
export function createProbeRouter(history: RouterHistory) {
    const router = createRouter({
        history,
        routes: [
            {path: '/', component: () => import('./StartView.vue')},
            {path: '/hilfe', component: () => import('./HelpView.vue')},
            {path: '/hilfe/:slug', name: 'helpTopic', component: () => import('./HelpTopicView.vue'), props: true},
        ],
        scrollBehavior: (_to, _from, saved) => saved ?? {top: 0},
    })
    router.beforeEach(to => to.name !== 'helpTopic' || HELP_TOPICS.some(topic => topic.slug === to.params.slug) || '/hilfe')
    return router
}
