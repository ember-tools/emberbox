import {createToolApp, emberboxUi} from '@emberbox/ui'
import {createWebHistory} from 'vue-router'
import App from './App.vue'
import {createHubRouter} from './router'
import './style.css'

const router = createHubRouter(createWebHistory())
const app = createToolApp(App).use(router).use(emberboxUi)
void router.isReady().then(() => app.mount('#app'))
