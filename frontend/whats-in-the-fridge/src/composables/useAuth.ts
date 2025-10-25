import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/utils/api'

const API_BASE = '/api/auth'

interface User {
  id: number
  email: string
  isAdmin: boolean
}

const user = ref<User | null>(null)
const pantry = ref<string[]>([])
const recipes = ref<any[]>([])

export function useAuth() {
  const router = useRouter()

  async function fetchUser() {
    // only call backend if we believe a cookie exists
    const hasSession = localStorage.getItem('hasSession') === 'true'
    if (!hasSession) return null

    if (user.value) return user.value // cached

    try {
      const data = await apiFetch<User>('/api/auth/me', { method: 'GET' })
      user.value = data
      await fetchPantry()
      return data
    } catch {
      // if backend rejects (e.g. cookie expired)
      localStorage.setItem('hasSession', 'false')
      user.value = null
      pantry.value = []
      recipes.value = []
      return null
    }
  }

  async function signup(email: string, password: string) {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Signup failed')

    // After signup, fetch user info
    await fetchUser()
    router.push('/') // redirect to home
  }

  async function login(email: string, password: string) {
    await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('hasSession', 'true')
    await fetchUser()
    router.push('/')
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' })
    localStorage.setItem('hasSession', 'false')
    user.value = null
    pantry.value = []
    recipes.value = []
    router.push('/')
  }

  async function fetchPantry() {
    if (!user.value) return
    try {
      const data = await apiFetch<{ ingredients: string[] }>('/api/pantry', { method: 'GET' })
      pantry.value = data.ingredients || []
    } catch {
      pantry.value = []
    }
  }

  // Initialize flag if missing
  if (localStorage.getItem('hasSession') === null) {
    localStorage.setItem('hasSession', 'false')
  }

  return { user, pantry, recipes, fetchUser, login, logout, signup }
}
