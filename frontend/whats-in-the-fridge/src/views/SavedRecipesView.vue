<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
    <div class="w-full max-w-3xl">
      <h1 class="text-3xl font-bold text-center mb-6">⭐ Saved Recipes</h1>

      <div v-if="savedRecipes.length" class="grid gap-6 md:grid-cols-2">
        <div
          v-for="recipe in savedRecipes"
          :key="recipe.id"
          class="bg-yellow-50 p-6 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h3 class="text-lg font-semibold mb-2">{{ recipe.name }}</h3>
            <ul class="list-disc pl-5 space-y-1 text-gray-700">
              <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
            </ul>
          </div>
          <!-- Delete button -->
          <button
            @click="deleteRecipe(recipe.id)"
            class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 mt-6">You haven’t saved any recipes yet.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/utils/api'

interface Recipe {
  id: number
  name: string
  steps: string[]
  createdAt: string
}

const savedRecipes = ref<Recipe[]>([])

// Fetch recipes on mount
onMounted(async () => {
  await fetchRecipes()
})

const fetchRecipes = async () => {
  try {
    const data = await apiFetch<{ recipes: Recipe[] }>('/api/recipes', {
      method: 'GET',
    })
    savedRecipes.value = data.recipes || []
  } catch (err) {
    console.error('Failed to fetch saved recipes', err)
  }
}

// Delete recipe
const deleteRecipe = async (id: number) => {
  try {
    await apiFetch(`/api/recipes/${id}`, { method: 'DELETE' })
    savedRecipes.value = savedRecipes.value.filter((r) => r.id !== id)
  } catch (err) {
    console.error('Failed to delete recipe', err)
  }
}
</script>
