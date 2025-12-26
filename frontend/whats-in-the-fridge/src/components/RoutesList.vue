<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-3">API Routes</h2>
      <div class="overflow-x-auto">
        <table class="table table-zebra text-sm">
          <thead>
            <tr><th>Method</th><th>Path</th></tr>
          </thead>
          <tbody>
            <tr v-for="route in routes" :key="route.path">
              <td><div class="badge badge-info">{{ route.method }}</div></td>
              <td>{{ route.path }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/utils/api'

const routes = ref<{ method: string; path: string }[]>([])

onMounted(async () => {
  try {
    const data = await apiFetch<{ routes: { method: string; path: string }[] }>('/api/admin/routes', { method: 'GET' })
    routes.value = data.routes
  } catch (err) {
    console.error('Failed to fetch routes', err)
  }
})
</script>
