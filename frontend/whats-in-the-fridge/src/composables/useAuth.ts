import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/utils/api'

interface User {
  id: number
  email: string
  isAdmin: boolean
}

interface Recipe {
  id?: number
  name: string
  steps: string[]
  cuisine?: string
  dietType?: string
  mealType?: string
  difficulty?: string
  prepTime?: string
  ingredients?: string[]
  createdAt?: string
}

const user = ref<User | null>(null)
const pantry = ref<string[]>([])
const recipes = ref<Recipe[]>([])
const savedRecipeNames = ref<Set<string>>(new Set())
const loadedSaved = ref(false)

export function useAuth() {
  const router = useRouter()

  async function fetchUser() {
    const hasSession = localStorage.getItem('hasSession') === 'true'
    if (!hasSession) return null
    if (user.value) return user.value // cached

    try {
      const data = await apiFetch<User>('/api/auth/me', { method: 'GET' })
      user.value = data
      await fetchSavedRecipes()
      return data
    } catch {
      // if backend rejects (e.g. cookie expired)
      localStorage.setItem('hasSession', 'false')
      resetUser()
      return null
    }
  }

  async function fetchSavedRecipes() {
    if (!user.value || loadedSaved.value) return
    const data = await apiFetch<{ recipes: Recipe[] }>("/api/recipes", {
      method: "GET",
    })
    savedRecipeNames.value = new Set(data.recipes.map((r) => r.name))
    loadedSaved.value = true
  }

  async function signup(email: string, password: string) {
    await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem("hasSession", "true")
    await fetchUser()
    router.push('/')
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
    await apiFetch("/api/auth/logout", { method: "POST" })
    resetUser()
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

  function resetUser() {
    localStorage.setItem('hasSession', 'false')
    user.value = null
    pantry.value = []
    recipes.value = []
    savedRecipeNames.value.clear()
    loadedSaved.value = false
  }

  return { user, pantry, recipes, savedRecipeNames, loadedSaved, fetchUser, fetchSavedRecipes, fetchPantry, login, logout, signup }
}