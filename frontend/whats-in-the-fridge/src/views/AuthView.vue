<template>
  <div class="min-h-[75vh] flex items-center justify-center p-6">
    <div class="card bg-base-100 shadow-2xl w-full max-w-sm">
      <div class="card-body space-y-6">
        <h1 class="text-3xl font-bold mb-2 text-center">
          {{ isLogin ? 'Login' : 'Signup' }}
        </h1>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div class="form-control">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="input input-bordered w-full"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary w-full text-base font-semibold">
            {{ isLogin ? 'Login' : 'Signup' }}
          </button>
        </form>

        <div class="divider my-0"></div>

        <p class="text-sm text-center">
          {{ isLogin ? "Don't have an account?" : 'Already registered?' }}
          <button @click="isLogin = !isLogin" class="link link-primary font-medium">
            {{ isLogin ? 'Signup' : 'Login' }}
          </button>
        </p>

        <div v-if="error" class="alert alert-error mt-3"><span>{{ error }}</span></div>
      </div>
    </div>
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
