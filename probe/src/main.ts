import {createToolApp, emberboxUi} from '@emberbox/ui'
import {createWebHistory} from 'vue-router'
import App from './App.vue'
import {createProbeRouter} from './router'
import './style.css'

const router = createProbeRouter(createWebHistory())
const app = createToolApp(App).use(router).use(emberboxUi)
void router.isReady().then(() => app.mount('#app'))
