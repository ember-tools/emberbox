import {createApp} from 'vue'
import {emberboxUi} from '@emberbox/ui'
import App from './App.vue'
import {router} from './router'
import './stil.css'

createApp(App).use(router).use(emberboxUi).mount('#app')
