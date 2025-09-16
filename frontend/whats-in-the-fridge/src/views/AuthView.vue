<template>
  <div class="max-w-md mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Auth</h1>

    <form @submit.prevent="handleSignup" class="space-y-3 mb-6">
      <h2 class="font-semibold">Sign Up</h2>
      <input
        v-model="signupEmail"
        type="email"
        placeholder="Email"
        class="w-full border p-2 rounded"
      />
      <input
        v-model="signupPassword"
        type="password"
        placeholder="Password"
        class="w-full border p-2 rounded"
      />
      <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Sign Up</button>
    </form>

    <form @submit.prevent="handleLogin" class="space-y-3">
      <h2 class="font-semibold">Login</h2>
      <input
        v-model="loginEmail"
        type="email"
        placeholder="Email"
        class="w-full border p-2 rounded"
      />
      <input
        v-model="loginPassword"
        type="password"
        placeholder="Password"
        class="w-full border p-2 rounded"
      />
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
    </form>

    <div v-if="auth.token" class="mt-6">
      <p class="mb-2">✅ Logged in with token:</p>
      <pre class="bg-gray-100 p-2 text-xs break-all">{{ auth.token }}</pre>
      <button @click="auth.logout" class="mt-2 bg-red-500 text-white px-3 py-1 rounded">
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const auth = useAuth()

// Signup state
const signupEmail = ref('')
const signupPassword = ref('')

// Login state
const loginEmail = ref('')
const loginPassword = ref('')

async function handleSignup() {
  try {
    await auth.signup(signupEmail.value, signupPassword.value)
    alert('Signup successful!')
  } catch (err: any) {
    alert(err.message)
  }
}

async function handleLogin() {
  try {
    await auth.login(loginEmail.value, loginPassword.value)
    alert('Login successful!')
  } catch (err: any) {
    alert(err.message)
  }
}
</script>
