<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Navbar -->
    <div class="navbar bg-base-100/90 backdrop-blur sticky top-0 z-50 shadow-md">
      <div class="navbar-start">
        <div class="dropdown">
          <label tabindex="0" class="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>

          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/saved">Saved Recipes</router-link></li>
            <li v-if="user?.isAdmin"><router-link to="/admin">Admin</router-link></li>
            <li class="border-t mt-2 pt-2">
              <details>
                <summary class="cursor-pointer">Theme</summary>
                <ul>
                  <li v-for="t in themes" :key="t">
                    <button @click="setTheme(t)" class="capitalize">{{ t }}</button>
                  </li>
                </ul>
              </details>
            </li>
            <li class="border-t mt-2 pt-2">
              <template v-if="user">
                <button @click="logout" class="text-error">Logout</button>
              </template>
              <template v-else>
                <router-link class="text-primary" to="/auth">Signup / Login</router-link>
              </template>
            </li>
          </ul>
        </div>

        <router-link to="/" class="btn btn-ghost text-xl font-bold flex items-center gap-2">
          <img src="/gradient.svg" alt="Logo" class="h-7 w-auto" />
          <span class="hidden sm:inline">What's In The Fridge?</span>
        </router-link>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/saved">Saved Recipes</router-link></li>
          <li v-if="user?.isAdmin"><router-link to="/admin">Admin</router-link></li>
        </ul>
      </div>

      <div class="navbar-end gap-2 hidden lg:flex">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-sm">Theme</label>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 shadow rounded-box w-44 mt-2"
          >
            <li v-for="t in themes" :key="t">
              <button @click="setTheme(t)" class="capitalize">{{ t }}</button>
            </li>
          </ul>
        </div>

        <div v-if="user" class="flex items-center gap-2">
          <div class="badge badge-neutral hidden sm:inline">{{ user.email }}</div>
          <button @click="logout" class="btn btn-error btn-sm">Logout</button>
        </div>
        <router-link v-else class="btn btn-primary btn-sm" to="/auth">Signup / Login</router-link>
      </div>
    </div>

    <!-- Toast popup -->
    <Toast ref="toastRef" />

    <!-- Main content -->
    <main class="flex-1 container mx-auto p-6">
      <router-view />
    </main>

    <!-- Footer -->
    <footer
      class="footer footer-center bg-base-100 text-base-content p-4 shadow-inner 
             sm:px-4 px-2 text-sm text-center whitespace-normal break-words"
    >
      <aside>
        <p class="max-w-full leading-snug">
          Built with
          <a href="https://vuejs.org" target="_blank" class="link link-primary mx-1">
            Vue
          </a>
          +
          <a href="https://daisyui.com" target="_blank" class="link link-secondary mx-1">
            DaisyUI
          </a>
          by
          <a
            href="https://nicolasbenavides.ca/"
            target="_blank"
            class="link link-accent mx-1"
          >
            Nicolas Benavides
          </a>
        </p>
      </aside>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, provide } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Toast from '@/components/Toast.vue'

const { user, logout } = useAuth()

const toastRef = ref<InstanceType<typeof Toast> | null>(null)

provide('toast', toastRef)

const themes = [
  'light', 'dark', 'lemonade', 'lofi', 'dim', 'nord', 'corporate',
  'coffee', 'carmellatte', 'forest', 'valentine', 'autumn', 'winter'
]

const currentTheme = ref(localStorage.getItem('theme') || 'dim')

function setTheme(theme: string) {
  currentTheme.value = theme
  localStorage.setItem('theme', theme)
  nextTick(() => document.documentElement.setAttribute('data-theme', theme))
}

onMounted(() => document.documentElement.setAttribute('data-theme', currentTheme.value))
</script>