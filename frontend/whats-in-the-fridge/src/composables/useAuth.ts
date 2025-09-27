import { ref } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = '/api/auth'

const user = ref<{ id: number; email: string; isAdmin: boolean } | null>(null)
const pantry = ref<string[]>([])
const recipes = ref<any[]>([])

export function useAuth() {
  const router = useRouter()

  async function fetchUser() {
    try {
      const res = await fetch(`${API_BASE}/me`, { credentials: 'include' })
      if (!res.ok) throw new Error('Not logged in')
      user.value = await res.json()
      await fetchPantry()
    } catch {
      user.value = null
      pantry.value = []
      recipes.value = []
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
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')

    await fetchUser()
    router.push('/')
  }

  async function logout() {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    user.value = null
    pantry.value = []
    recipes.value = []

    router.push('/')
  }

  async function fetchPantry() {
    if (!user.value) return
    const res = await fetch('/api/pantry', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      pantry.value = data.ingredients || []
    }
  }

  return { user, pantry, recipes, fetchUser, login, logout, signup }
}
