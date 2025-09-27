<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <nav class="bg-white shadow p-4 relative flex items-center justify-between">
      <div>
        <h1 class="font-bold text-xl">🥕 FridgeApp</h1>
      </div>

      <div class="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
        <router-link to="/" class="text-blue-600 hover:underline">Home</router-link>
        <router-link to="/saved" class="text-yellow-600 hover:underline">Saved Recipes</router-link>
      </div>

      <div class="flex items-center gap-4">
        <template v-if="user">
          <span class="text-gray-600 whitespace-nowrap">Hello, {{ user.email }}</span>
          <router-link v-if="user.isAdmin" to="/admin" class="text-purple-600 hover:underline">
            Admin Dashboard
          </router-link>
          <button @click="logout" class="text-red-600 hover:underline">Logout</button>
        </template>
        <template v-else>
          <router-link to="/auth" class="text-blue-600 hover:underline">Signup / Login</router-link>
        </template>
      </div>
    </nav>

    <!-- Main content -->
    <main class="p-6 flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white shadow-inner p-4 text-center mt-auto text-gray-600">
      Created by
      <a
        href="https://github.com/100Bandz"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-600 hover:text-blue-800 underline ml-1"
      >
        Me
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
</script>
