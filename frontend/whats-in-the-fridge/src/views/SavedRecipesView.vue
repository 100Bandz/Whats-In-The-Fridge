<template>
  <div class="min-h-[70vh] flex justify-center">
    <div class="w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">Saved Recipes</h1>

      <div v-if="savedRecipes.length" class="grid md:grid-cols-2 gap-6">
        <div
          v-for="recipe in savedRecipes"
          :key="recipe.id"
          class="card bg-base-100 shadow-lg hover:shadow-xl"
        >
          <div class="card-body">
            <h2 class="card-title text-primary">{{ recipe.name }}</h2>
            <ul class="list-disc pl-5 text-base-content/80">
              <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
            </ul>
            <div class="card-actions justify-end mt-2">
              <button @click="deleteRecipe(recipe.id)" class="btn btn-error btn-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-info text-center"><span>You haven't saved any recipes yet</span></div>
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


onMounted(async () => {
  await fetchRecipes()
})

async function fetchRecipes() {
  try {
    const data = await apiFetch<{ recipes: Recipe[] }>('/api/recipes', {
      method: 'GET',
    })
    savedRecipes.value = data.recipes || []
  } catch (err) {
    console.error('Failed to fetch saved recipes', err)
  }
}

async function deleteRecipe(id: number) {
  try {
    await apiFetch(`/api/recipes/${id}`, { method: 'DELETE' })
    savedRecipes.value = savedRecipes.value.filter((r) => r.id !== id)
  } catch (err) {
    console.error('Failed to delete recipe', err)
  }
}
</script>