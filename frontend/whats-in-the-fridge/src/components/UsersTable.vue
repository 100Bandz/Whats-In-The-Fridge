<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-3">User Management</h2>
      <div class="overflow-x-auto">
        <table class="table table-zebra text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td>{{ u.email }}</td>
              <td>
                <div v-if="u.isAdmin" class="badge badge-success">Admin</div>
                <div v-else class="badge">User</div>
              </td>
              <td class="flex flex-wrap gap-2">
                <button
                  v-if="!u.isAdmin"
                  @click="makeAdmin(u.id)"
                  class="btn btn-xs btn-secondary"
                >
                  Promote
                </button>
                <button
                  v-else
                  @click="demoteAdmin(u.id)"
                  class="btn btn-xs btn-warning"
                >
                  Demote
                </button>
                <button
                  @click="deleteUser(u.id)"
                  class="btn btn-xs btn-error">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
