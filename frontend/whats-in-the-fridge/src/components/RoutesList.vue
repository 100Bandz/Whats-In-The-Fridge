<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">API Routes</h2>
    <ul class="list-disc pl-5">
      <li v-for="route in routes" :key="route.path">{{ route.method }} - {{ route.path }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/utils/api'

const routes = ref<{ method: string; path: string }[]>([])

onMounted(async () => {
  try {
    const data = await apiFetch('/api/admin/routes', { method: 'GET' })
    routes.value = data.routes
  } catch (err) {
    console.error('Failed to fetch routes', err)
  }
})
</script>
