<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <div class="tabs tabs-boxed mb-6">
      <a @click="activeTab = 'logs'" :class="tabClass('logs')">API Logs</a>
      <a @click="activeTab = 'health'" :class="tabClass('health')">Health</a>
      <a @click="activeTab = 'routes'" :class="tabClass('routes')">Routes</a>
      <a @click="activeTab = 'users'" :class="tabClass('users')">Users</a>
    </div>

    <LogsTable v-if="activeTab === 'logs'"/>
    <HealthPanel v-if="activeTab === 'health'"/>
    <RoutesList v-if="activeTab === 'routes'"/>
    <UsersTable v-if="activeTab === 'users'" :activeTab="activeTab"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LogsTable from '@/components/LogsTable.vue'
import HealthPanel from '@/components/HealthPanel.vue'
import RoutesList from '@/components/RoutesList.vue'
import UsersTable from '@/components/UsersTable.vue'

const activeTab = ref('logs')
const tabClass = (tab:string) => ['tab', activeTab.value===tab?'tab-active':''].join(' ')
</script>