<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow p-4 flex gap-4 justify-center">
      <router-link to="/" class="text-blue-600 hover:underline">Home</router-link>
      <router-link to="/saved" class="text-yellow-600 hover:underline">Saved Recipes</router-link>
      <router-link to="/auth" class="text-blue-600 hover:underline">Auth</router-link>
    </nav>
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>
