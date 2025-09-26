<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Health Status</h2>
    <pre>{{ health }}</pre>
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
