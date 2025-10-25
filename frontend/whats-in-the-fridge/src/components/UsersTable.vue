<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">User Management</h2>
    <table class="w-full border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 border">ID</th>
          <th class="p-2 border">Email</th>
          <th class="p-2 border">Role</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" class="text-center">
          <td class="p-2 border">{{ u.id }}</td>
          <td class="p-2 border">{{ u.email }}</td>
          <td class="p-2 border">
            <span v-if="u.isAdmin" class="text-green-600 font-bold">Admin</span>
            <span v-else>User</span>
          </td>
          <td class="p-2 border">
            <button
              v-if="!u.isAdmin"
              @click="makeAdmin(u.id)"
              class="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 mr-2"
            >
              Promote
            </button>

            <button
              v-else
              @click="demoteAdmin(u.id)"
              class="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 mr-2"
            >
              Demote
            </button>

            <button
              @click="deleteUser(u.id)"
              class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { apiFetch } from '@/utils/api'

interface User {
  id: number
  email: string
  isAdmin: boolean
}

const props = defineProps<{ activeTab: string }>()
const users = ref<User[]>([])

async function fetchUsers() {
  try {
    users.value = await apiFetch<User[]>('/api/admin/users', { method: 'GET' })
  } catch (err) {
    console.error('Failed to fetch users', err)
  }
}

async function makeAdmin(id: number) {
  try {
    await apiFetch(`/api/admin/make-admin/${id}`, { method: 'POST' })
    await fetchUsers()
  } catch (err) {
    console.error('Failed to promote user', err)
  }
}

async function demoteAdmin(id: number) {
  try {
    await apiFetch(`/api/admin/demote-admin/${id}`, { method: 'POST' })
    await fetchUsers()
  } catch (err) {
    console.error('Failed to demote user', err)
  }
}

async function deleteUser(id: number) {
  if (!confirm('Are you sure you want to delete this user?')) return
  try {
    await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await fetchUsers()
  } catch (err) {
    console.error('Failed to delete user', err)
  }
}

// fetch if already on "users"
onMounted(() => {
  if (props.activeTab === 'users') {
    fetchUsers()
  }
})

// watch for tab changes
watch(
  () => props.activeTab,
  (newTab) => {
    if (newTab === 'users') {
      fetchUsers()
    }
  },
)
</script>
