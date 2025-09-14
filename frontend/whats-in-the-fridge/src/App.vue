<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
    <div class="w-full max-w-2xl">
      <h1 class="text-3xl font-bold text-center mb-6">What's In The Fridge</h1>

      <!-- Input -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="ingredientsInput"
          type="text"
          placeholder="Enter ingredients (comma-separated)"
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          @click="getRecipes"
          :disabled="loading"
          class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : 'Suggest' }}
        </button>
      </div>

      <!-- Recipes -->
      <div v-if="recipes.length" class="space-y-6 mt-6">
        <div
          v-for="(recipe, index) in recipes"
          :key="index"
          class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 class="text-xl font-semibold mb-2">{{ recipe.name }}</h2>
          <p class="text-gray-600 mb-4">{{ recipe.description }}</p>
          <ul class="list-disc pl-5 space-y-1 text-gray-700">
            <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
          </ul>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading" class="text-center text-gray-500 mt-6">
        No recipes yet. Enter some ingredients above 👆
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Recipe {
  name: string
  description: string
  steps: string[]
}

const ingredientsInput = ref('')
const recipes = ref<Recipe[]>([])
const loading = ref(false)

const getRecipes = async () => {
  recipes.value = []
  loading.value = true

  try {
    const ingredients = ingredientsInput.value
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0)

    const res = await fetch('/api/recipes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    })

    const data = await res.json()
    recipes.value = data.recipes || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
