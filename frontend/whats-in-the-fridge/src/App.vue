<template>
  <div class="flex flex-col items-center">
    <div class="w-full max-w-3xl">
      <!-- Title -->
      <header class="text-center mb-10">
        <h1 class="text-4xl font-extrabold flex justify-center items-center gap-2 text-primary">
          What's In The Fridge?
        </h1>
        <p class="text-base-content/70 mt-2">
          Generate creative recipes with the ingredients you already have!
        </p>
      </header>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Pantry Input -->
          <div class="form-control">
            <label class="label pb-2"><span class="label-text">Add Ingredients</span></label>

            <div class="flex items-stretch">
              <input
                v-model="ingredientsInput"
                @keyup.enter="addIngredients"
                type="text"
                placeholder="Type ingredient and press Enter (or commas)"
                class="input input-bordered border-r-0 rounded-r-none w-full focus:outline-none focus:ring-0"
              />
              <button
                @click="addIngredients"
                class="btn btn-primary rounded-l-none border border-base-300"
              >
                Add
              </button>
            </div>
          </div>

          <!-- Pantry Chips -->
          <div v-if="pantry" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="(ingredient, idx) in pantry"
              :key="idx"
              class="badge badge-outline text-base-content gap-2 hover:scale-105 transition"
            >
              {{ ingredient }}
              <button
                class="btn btn-xs btn-circle btn-ghost"
                @click="removeIngredient(ingredient)"
                aria-label="Remove"
              >
                ✕
              </button>
            </span>

            <p v-if="!pantry.length" class="italic text-base-content/60">
              Your pantry is empty — add some ingredients
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <input
              v-model="cuisine"
              type="text"
              placeholder="Cuisine (e.g. Italian)"
              class="input input-bordered w-full"
            />
            <select v-model="mealType" class="select select-bordered w-full">
              <option value="">Any Meal</option>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
            <select v-model="dietType" class="select select-bordered w-full">
              <option value="">Any Diet</option>
              <option>Vegetarian</option>
              <option>Vegan</option>
              <option>Gluten-Free</option>
              <option>Keto</option>
            </select>
            <select v-model="difficulty" class="select select-bordered w-full">
              <option value="">Any Difficulty</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input
              v-model="language"
              type="text"
              placeholder="Language (English)"
              class="input input-bordered md:col-span-2"
            />
          </div>

          <!-- Toggle: allow extras -->
          <label
            class="label cursor-pointer mt-4 justify-start items-start gap-3 flex-wrap whitespace-normal break-words text-sm sm:text-base"
          >
            <input
              type="checkbox"
              class="toggle toggle-success flex-shrink-0 mt-1"
              v-model="allowExtras"
            />
            <span class="label-text text-base-content leading-snug">
              Allow extra common ingredients (creative mode)
            </span>
          </label>

          <div class="card-actions justify-center mt-4">
            <button @click="getRecipes" :disabled="loading || !pantry?.length" class="btn btn-success">
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              {{ loading ? "Finding Recipes..." : "Suggest Recipes" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recipes -->
      <div v-if="recipes.length" class="grid gap-6 md:grid-cols-2 mt-8">
        <div
          v-for="(recipe, index) in recipes"
          :key="index"
          class="card bg-base-100 shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
        >
          <div class="card-body">
            <h2 class="card-title text-primary">{{ recipe.name }}</h2>

            <div
              v-if="recipe.cuisine || recipe.dietType || recipe.difficulty"
              class="text-sm text-base-content/70 mb-2 flex flex-wrap gap-2"
            >
              <span v-if="recipe.cuisine" class="badge badge-outline">Cuisine: {{ recipe.cuisine }}</span>
              <span v-if="recipe.dietType" class="badge badge-outline">Diet: {{ recipe.dietType }}</span>
              <span v-if="recipe.difficulty" class="badge badge-outline">Difficulty: {{ recipe.difficulty }}</span>
            </div>

            <ul class="list-disc pl-5 space-y-1 text-base-content/80">
              <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
            </ul>

            <div class="card-actions justify-start mt-auto pt-4">
              <button
                @click="saveRecipe(recipe)"
                :disabled="isSaveDisabled(recipe)"
                class="btn btn-warning"
              >
                <span v-if="user && !loadedSaved" class="loading loading-spinner loading-sm mr-2"></span>
                {{ saveLabel(recipe) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading">
        <div v-if="!pantry?.length" class="alert alert-info text-center mt-8">
          <span>Your pantry is empty. Add ingredients to get started</span>
        </div>
        <div v-else class="alert alert-info text-center mt-8">
          <span>No recipes yet! Click Suggest Recipes to see results</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from "vue";
import { apiFetch } from "@/utils/api";
import { useAuth } from "@/composables/useAuth";

const { pantry, recipes, user, savedRecipeNames, loadedSaved, fetchSavedRecipes, fetchPantry } = useAuth()

const toast = inject('toast') as any

const ingredientsInput = ref("");
const loading = ref(false);
const allowExtras = ref(false);
const cuisine = ref("");
const language = ref("English");
const mealType = ref("");
const dietType = ref("");
const difficulty = ref("");

interface Recipe {
  id?: number;
  name: string;
  steps: string[];
  cuisine?: string;
  dietType?: string;
  mealType?: string;
  difficulty?: string;
  prepTime?: string;
  ingredients?: string[];
  createdAt?: string;
}

onMounted(async () => {
  try {
    if (user.value) {
      await fetchSavedRecipes();
      await fetchPantry();
    }
  } catch (err) {
    console.error("Startup fetch error:", err);
  }
});

async function addIngredients() {
  if (!user.value) {
    toast?.value?.showToast("You must be logged in to add ingredients.", "error")
    return
  }

  const newIngredients = ingredientsInput.value
    .split(",")
    .map((i) => i.trim().toLowerCase())
    .filter((i) => i.length > 0)

  if (!newIngredients.length) return

  const existing = pantry.value?.map((i) => i.toLowerCase()) || []
  const unique = newIngredients.filter((i) => !existing.includes(i))
  if (!unique.length) {
    toast?.value?.showToast("Duplicate ingredients not allowed.", "error")
    ingredientsInput.value = ""
    return
  }

  try {
    const data = await apiFetch<{ ingredients: string[] }>("/api/pantry", {
      method: "POST",
      body: JSON.stringify({ ingredients: unique }),
    })
    pantry.value = data.ingredients || pantry.value || []
    ingredientsInput.value = ""
  } catch (err) {
    console.error("Failed to add ingredients", err)
    toast?.value?.showToast("Failed to add ingredients.", "error")
  }
}

async function removeIngredient(ingredient: string) {
  try {
    const data = await apiFetch<{ ingredients: string[] }>(`/api/pantry/${encodeURIComponent(ingredient)}`, {
      method: "DELETE",
    })
    pantry.value = data.ingredients || pantry.value || []
  } catch (err) {
    console.error("Failed to remove ingredient", err)
    toast?.value?.showToast("Failed to remove ingredient.", "error")
  }
}

async function getRecipes() {
  recipes.value = []
  loading.value = true

  try {
    const endpoint = allowExtras.value ? "/api/recipes/suggest" : "/api/recipes/generate"
    const payload = {
      ingredients: pantry.value,
      cuisine: cuisine.value,
      mealType: mealType.value,
      dietType: dietType.value,
      difficulty: difficulty.value,
      language: language.value || "English",
    }
    const data = await apiFetch<{ recipes: Recipe[] }>(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    recipes.value = data.recipes || []
  } catch (err) {
    console.error("Failed to fetch recipes", err)
    toast?.value?.showToast("Failed to fetch recipes.", "error")
  } finally {
    loading.value = false
  }
}

function isSaveDisabled(recipe: Recipe) {
  if (!user.value) return true
  if (!loadedSaved.value) return true
  return savedRecipeNames.value.has(recipe.name)
}

function saveLabel(recipe: Recipe) {
  if (!user.value) return "Login to save"
  if (!loadedSaved.value) return "Loading..."
  return savedRecipeNames.value.has(recipe.name) ? "Saved ✓" : "Save Recipe"
}

async function saveRecipe(recipe: Recipe) {
  if (!user.value) {
    toast?.value?.showToast("You must be logged in to save recipes.", "error")
    return
  }
  if (savedRecipeNames.value.has(recipe.name)) return

  try {
    await apiFetch("/api/recipes", {
      method: "POST",
      body: JSON.stringify(recipe),
    })
    savedRecipeNames.value.add(recipe.name)
    toast?.value?.showToast("Recipe saved!", "success")
  } catch (err: any) {
    const msg = err?.message || ""
    if (msg.includes("Recipe already saved") || msg.toLowerCase().includes("already")) {
      savedRecipeNames.value.add(recipe.name)
      toast?.value?.showToast("This recipe is already saved.", "info")
    } else {
      console.error("Save recipe error:", err)
      toast?.value?.showToast("Save failed.", "error")
    }
  }
}
</script>