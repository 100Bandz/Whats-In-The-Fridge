<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
    <div class="w-full max-w-3xl">
      <!-- Title -->
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">🥕 What's In The Fridge?</h1>
      </header>

      <!-- Pantry Input -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="ingredientsInput"
          @keyup.enter="addIngredients"
          type="text"
          placeholder="Type ingredient and press Enter (or use commas)"
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          @click="addIngredients"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
          :disabled="!ingredientsInput.trim()"
        >
          Add
        </button>
      </div>

      <!-- Pantry Chips -->
      <div class="flex flex-wrap gap-2 mb-6">
        <span
          v-for="(ingredient, idx) in pantry"
          :key="idx"
          class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 hover:bg-green-200 transition"
        >
          {{ ingredient }}
          <button
            @click="removeIngredient(ingredient)"
            class="text-red-500 hover:text-red-700 font-bold"
            aria-label="Remove ingredient"
          >
            ×
          </button>
        </span>

        <span v-if="!pantry.length" class="text-gray-400 italic">
          Your pantry is empty. Add some ingredients 👆
        </span>
      </div>

      <!-- Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Free text -->
        <input
          v-model="cuisine"
          type="text"
          class="p-2 border rounded"
          placeholder="Cuisine (e.g. Italian)"
        />

        <!-- Meal Type Dropdown -->
        <select v-model="mealType" class="p-2 border rounded">
          <option value="">Any Meal</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>

        <!-- Diet Type Dropdown -->
        <select v-model="dietType" class="p-2 border rounded">
          <option value="">Any Diet</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Gluten-Free">Gluten-Free</option>
          <option value="Keto">Keto</option>
        </select>

        <!-- Difficulty Dropdown -->
        <select v-model="difficulty" class="p-2 border rounded">
          <option value="">Any Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <!-- Free text -->
        <input
          v-model="language"
          type="text"
          class="p-2 border rounded md:col-span-2"
          placeholder="Language (English)"
        />
      </div>

      <!-- Toggle: allow extras -->
      <div class="flex items-center gap-3 mb-6">
        <input
          id="allowExtras"
          type="checkbox"
          v-model="allowExtras"
          class="h-4 w-4 text-green-600 border-gray-300 rounded"
        />
        <label for="allowExtras" class="text-gray-700">
          Allow extra common ingredients (creative mode)
        </label>
      </div>

      <!-- Actions -->
      <div class="flex justify-center mb-6">
        <button
          @click="getRecipes"
          :disabled="!pantry.length || loading"
          class="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          {{ loading ? 'Finding Recipes...' : 'Suggest Recipes' }}
        </button>
      </div>

      <!-- Recipes -->
      <div v-if="recipes.length" class="grid gap-6 md:grid-cols-2">
        <div
          v-for="(recipe, index) in recipes"
          :key="index"
          class="bg-white p-6 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition flex flex-col justify-between"
        >
          <div>
            <h2 class="text-xl font-semibold mb-3">{{ recipe.name }}</h2>

            <!-- optional fields -->
            <div
              v-if="recipe.cuisine || recipe.dietType || recipe.difficulty"
              class="text-sm text-gray-500 mb-2"
            >
              <span v-if="recipe.cuisine">Cuisine: {{ recipe.cuisine }}</span>
              <span v-if="recipe.dietType" class="ml-3">Diet: {{ recipe.dietType }}</span>
              <span v-if="recipe.difficulty" class="ml-3">Difficulty: {{ recipe.difficulty }}</span>
            </div>

            <ul class="list-disc pl-5 space-y-1 text-gray-700">
              <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
            </ul>
          </div>

          <!-- Save button -->
          <button
            @click="saveRecipe(recipe)"
            class="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
          >
            ⭐ Save Recipe
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading" class="text-center text-gray-500 mt-6">
        No recipes yet. Add ingredients and click <strong>Suggest Recipes</strong> 🍳
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/utils/api'

interface Recipe {
  id?: number
  name: string
  steps: string[]
  cuisine?: string
  dietType?: string
  mealType?: string
  difficulty?: string
  prepTime?: string
  ingredients?: string[]
  createdAt?: string
}

const ingredientsInput = ref<string>('')
const pantry = ref<string[]>([])
const recipes = ref<Recipe[]>([])
const loading = ref(false)
const allowExtras = ref<boolean>(false)

// free text
const cuisine = ref<string>('')
const language = ref<string>('English')

// dropdowns
const mealType = ref<string>('')
const dietType = ref<string>('')
const difficulty = ref<string>('')

onMounted(async () => {
  try {
    const data = await apiFetch<{ ingredients: string[] }>('/api/pantry', { method: 'GET' })
    pantry.value = data.ingredients || []
  } catch (err) {
    console.error('Failed to fetch pantry', err)
  }
})

const addIngredients = async () => {
  const newIngredients = ingredientsInput.value
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i.length > 0)

  if (!newIngredients.length) return
  ingredientsInput.value = ''

  try {
    const data = await apiFetch<{ ingredients: string[] }>('/api/pantry', {
      method: 'POST',
      body: JSON.stringify({ ingredients: newIngredients }),
    })
    pantry.value = data.ingredients || pantry.value
  } catch (err) {
    console.error('Failed to add ingredients', err)
  }
}

const removeIngredient = async (ingredient: string) => {
  try {
    const data = await apiFetch<{ ingredients: string[] }>(
      `/api/pantry/${encodeURIComponent(ingredient)}`,
      {
        method: 'DELETE',
      },
    )
    pantry.value = data.ingredients || pantry.value
  } catch (err) {
    console.error('Failed to remove ingredient', err)
  }
}

const getRecipes = async () => {
  recipes.value = []
  loading.value = true

  try {
    const endpoint = allowExtras.value ? '/api/recipes/suggest' : '/api/recipes/generate'
    const payload = {
      ingredients: pantry.value,
      cuisine: cuisine.value,
      mealType: mealType.value,
      dietType: dietType.value,
      difficulty: difficulty.value,
      language: language.value || 'English',
    }
    const data = await apiFetch<{ recipes: Recipe[] }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    recipes.value = data.recipes || []
  } catch (err) {
    console.error('Failed to fetch recipes', err)
  } finally {
    loading.value = false
  }
}

const saveRecipe = async (recipe: Recipe) => {
  try {
    await apiFetch('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    })
    alert('Recipe saved! ⭐')
  } catch (err) {
    console.error('Failed to save recipe', err)
    alert('Save failed. Check console.')
  }
}
</script>
