import { ref } from 'vue'

const API_BASE = 'api/auth'
const token = ref<string | null>(localStorage.getItem('token'))

export function useAuth() {
  async function signup(email: string, password: string) {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Signup failed')

    token.value = data.token
    localStorage.setItem('token', data.token)
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')

    token.value = data.token
    localStorage.setItem('token', data.token)
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, signup, login, logout }
}
