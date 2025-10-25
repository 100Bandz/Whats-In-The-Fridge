// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import AuthView from '../views/AuthView.vue'
import SavedRecipesView from '@/views/SavedRecipesView.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: App },
    { path: '/auth', name: 'auth', component: AuthView },
    { path: '/saved', name: 'saved', component: SavedRecipesView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin', component: AdminDashboard, meta: { requiresAdmin: true } },
  ],
})

router.beforeEach(async (to, from, next) => {
  const { user } = useAuth()

  if (to.meta.requiresAuth && !user.value) {
    return next('/auth') // must be logged in
  }

  if (to.meta.requiresAdmin && !user.value?.isAdmin) {
    return next('/') // must be admin
  }

  if (to.path === '/auth' && user.value) {
    return next('/') // already logged in → redirect home
  }

  next()
})

export default router
