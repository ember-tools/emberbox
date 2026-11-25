import {appErzeugen, emberboxUi} from '@emberbox/ui'
import {createWebHistory} from 'vue-router'
import App from './App.vue'
import {routerErzeugen} from './router'
import './stil.css'

const router = routerErzeugen(createWebHistory())
const app = appErzeugen(App).use(router).use(emberboxUi)
void router.isReady().then(() => app.mount('#app'))
