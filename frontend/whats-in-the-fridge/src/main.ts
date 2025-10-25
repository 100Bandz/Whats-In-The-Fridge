import { createApp } from 'vue'

import router from './router'

import './styles.css'

import BaseLayout from '@/layouts/BaseLayout.vue'

import { useAuth } from '@/composables/useAuth'

const app = createApp(BaseLayout)

const { fetchUser } = useAuth()
fetchUser().finally(() => {
  app.use(router)
  app.mount('#app')
})
