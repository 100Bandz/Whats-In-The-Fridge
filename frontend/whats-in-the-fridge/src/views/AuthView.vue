<template>
  <div class="max-w-md mx-auto bg-white shadow p-6 rounded">
    <h1 class="text-xl font-bold mb-4">{{ isLogin ? 'Login' : 'Signup' }}</h1>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <input v-model="email" type="email" placeholder="Email" class="border p-2 rounded" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="border p-2 rounded"
        required
      />

      <button type="submit" class="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        {{ isLogin ? 'Login' : 'Signup' }}
      </button>
    </form>

    <p class="mt-4 text-sm">
      {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
      <button @click="isLogin = !isLogin" class="text-blue-600 hover:underline">
        {{ isLogin ? 'Signup' : 'Login' }}
      </button>
    </p>

    <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { login, signup } = useAuth()

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  try {
    if (isLogin.value) {
      await login(email.value, password.value)
    } else {
      await signup(email.value, password.value)
    }
  } catch (e: any) {
    error.value = e.message || 'Something went wrong'
  }
}
</script>
