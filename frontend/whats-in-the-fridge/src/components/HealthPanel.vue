<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-3">System Health</h2>
      <div v-if="health" class="overflow-x-auto">
        <table class="table w-full text-sm">
          <tbody>
            <tr><th>Status</th><td><span class="badge badge-success">{{ health.status }}</span></td></tr>
            <tr><th>Uptime (s)</th><td>{{ (health.uptime ?? 0).toFixed(2) }}</td></tr>
            <tr><th>Timestamp</th><td>{{ health.timestamp }}</td></tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-error">
        <span>Failed to load health data</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/utils/api'

const health = ref<any>({})

onMounted(async () => {
  try {
    const data = await apiFetch('/api/admin/health', { method: 'GET' })
    health.value = data
  } catch (err) {
    console.error('Failed to fetch health', err)
  }
})
</script>
