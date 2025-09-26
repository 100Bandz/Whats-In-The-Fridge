<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <!-- Tabs -->
    <div class="flex gap-4 mb-6">
      <button @click="activeTab = 'logs'" :class="tabClass('logs')">API Logs</button>
      <button @click="activeTab = 'health'" :class="tabClass('health')">Health</button>
      <button @click="activeTab = 'routes'" :class="tabClass('routes')">Routes</button>
    </div>

    <!-- Tab Contents -->
    <div v-if="activeTab === 'logs'">
      <LogsTable />
    </div>

    <div v-if="activeTab === 'health'">
      <HealthPanel />
    </div>

    <div v-if="activeTab === 'routes'">
      <RoutesList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LogsTable from '../components/LogsTable.vue'
import HealthPanel from '../components/HealthPanel.vue'
import RoutesList from '../components/RoutesList.vue'

const activeTab = ref('logs')

const tabClass = (tab: string) =>
  activeTab.value === tab
    ? 'px-4 py-2 bg-blue-600 text-white rounded'
    : 'px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
</script>
