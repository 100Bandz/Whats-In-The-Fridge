<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
    <div class="w-full max-w-2xl">
      <h1 class="text-3xl font-bold text-center mb-6">What's In The Fridge</h1>

      <!-- Input -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="ingredientsInput"
          @keyup.enter="addIngredients"
          type="text"
          placeholder="Type ingredient and hit Enter, or paste comma-separated list"
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          @click="addIngredients"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          Add
        </button>
        <button
          @click="getRecipes"
          :disabled="loading || !ingredients.length"
          class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : 'Suggest' }}
        </button>
      </div>

      <!-- Pantry -->
      <div v-if="ingredients.length" class="mb-4">
        <h2 class="font-semibold mb-2">Your Pantry:</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(ingredient, index) in ingredients"
            :key="index"
            class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {{ ingredient }}
            <button @click="removeIngredient(ingredient)" class="text-red-500 font-bold">×</button>
          </span>
        </div>
      </div>

      <!-- Recipes -->
      <div v-if="recipes.length" class="space-y-6 mt-6">
        <div
          v-for="(recipe, index) in recipes"
          :key="index"
          class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 class="text-xl font-semibold mb-2">{{ recipe.name }}</h2>
          <ul class="list-disc pl-5 space-y-1 text-gray-700">
            <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
          </ul>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading" class="text-center text-gray-500 mt-6">
        No recipes yet. Add some ingredients above 👆
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/utils/api'

interface Recipe {
  name: string
  steps: string[]
}

const ingredientsInput = ref('')
const ingredients = ref<string[]>([])
const recipes = ref<Recipe[]>([])
const loading = ref(false)

onMounted(async () => {
  try {
    const data = await apiFetch<{ ingredients: string[] }>('/api/pantry')
    ingredients.value = data.ingredients
  } catch (err) {
    console.error('Failed to load pantry:', err)
  }
})

const addIngredients = async () => {
  if (!ingredientsInput.value.trim()) return

  const newItems = ingredientsInput.value
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i.length > 0)

  try {
    const data = await apiFetch<{ ingredients: string[] }>('/api/pantry', {
      method: 'POST',
      body: JSON.stringify({ ingredients: newItems }),
    })
    ingredients.value = data.ingredients
  } catch (err) {
    console.error('Failed to add ingredients:', err)
  }

  ingredientsInput.value = ''
}

const removeIngredient = async (ingredient: string) => {
  try {
    const data = await apiFetch<{ ingredients: string[] }>(
      `/api/pantry/${encodeURIComponent(ingredient)}`,
      { method: 'DELETE' },
    )
    ingredients.value = data.ingredients
  } catch (err) {
    console.error('Failed to remove ingredient:', err)
  }
}

const getRecipes = async () => {
  recipes.value = []
  loading.value = true

  try {
    const data = await apiFetch<{ recipes: Recipe[] }>('/api/recipes/generate', {
      method: 'POST',
      body: JSON.stringify({ ingredients: ingredients.value }),
    })

    recipes.value = data.recipes || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
