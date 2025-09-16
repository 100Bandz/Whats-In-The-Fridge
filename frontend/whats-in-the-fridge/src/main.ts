import { createApp } from 'vue'
import { createPinia } from 'pinia'

import router from './router'

import './styles.css'

import BaseLayout from '@/layouts/BaseLayout.vue'

const app = createApp(BaseLayout)

app.use(createPinia())
app.use(router)

app.mount('#app')
