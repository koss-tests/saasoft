import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara'
import './style.css'
import 'primeicons/primeicons.css'
import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia).use(PrimeVue, {
  theme: {
    preset: Lara
  }
})

app.mount('#app')
