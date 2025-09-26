// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import AuthView from '../views/AuthView.vue'
import SavedRecipesView from '@/views/SavedRecipesView.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'

// JWT helper
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: App },
    { path: '/auth', name: 'auth', component: AuthView },
    { path: '/saved', name: 'saved', component: SavedRecipesView },
    { path: '/admin', name: 'admin', component: AdminDashboard },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  if (to.path === '/admin') {
    const token = localStorage.getItem('token')
    if (!token) return next('/') // not logged in
    const payload = parseJwt(token)
    if (!payload?.isAdmin) return next('/') // not an admin
  }
  next()
})

export default router
