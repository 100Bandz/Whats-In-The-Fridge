<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">API Logs</h2>
    <table class="w-full table-auto border">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1">Timestamp</th>
          <th class="border px-2 py-1">Endpoint</th>
          <th class="border px-2 py-1">User</th>
          <th class="border px-2 py-1">Payload</th>
          <th class="border px-2 py-1">AI Messages</th>
          <th class="border px-2 py-1">Response / Error</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td class="border px-2 py-1">{{ log.createdAt }}</td>
          <td class="border px-2 py-1">{{ log.endpoint }}</td>
          <td class="border px-2 py-1">{{ log.user_id || 'N/A' }}</td>
          <td class="border px-2 py-1">
            <button class="text-blue-600 underline" @click="openModal(log.payload, 'Payload')">
              View
            </button>
          </td>
          <td class="border px-2 py-1">
            <button class="text-blue-600 underline" @click="openModal(log.messages, 'AI Messages')">
              View
            </button>
          </td>
          <td class="border px-2 py-1">
            <button
              class="text-blue-600 underline"
              @click="openModal(log.ai_response || log.error, 'Response / Error')"
            >
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div
      v-if="modalContent"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white p-4 rounded-lg w-3/4 h-3/4 overflow-auto relative">
        <!-- Close button (top-right) -->
        <button
          class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
          @click="closeModal"
        >
          ✕
        </button>

        <!-- Header -->
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-bold">{{ modalTitle }}</h3>
          <button
            class="ml-2 bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
            @click="copyJSON"
          >
            📋 Copy JSON
          </button>
        </div>

        <!-- JSON Viewer -->
        <pre v-html="formatJSON(modalContent)" class="whitespace-pre-wrap font-mono text-sm"></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { apiFetch } from '@/utils/api'

const logs = ref<any[]>([])
const modalContent = ref<string | null>(null)
const modalTitle = ref<string>('')

onMounted(async () => {
  try {
    const data = await apiFetch<{ logs: any[] }>('/api/admin/logs', { method: 'GET' })
    logs.value = data.logs
  } catch (err) {
    console.error('Failed to fetch logs', err)
  }
  document.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey)
})

function openModal(content: string, title: string) {
  modalContent.value = content
  modalTitle.value = title
}

function closeModal() {
  modalContent.value = null
  modalTitle.value = ''
}

function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}

function formatJSON(raw: string) {
  try {
    return syntaxHighlight(JSON.stringify(JSON.parse(raw), null, 2))
  } catch {
    return syntaxHighlight(raw) // fallback
  }
}

function syntaxHighlight(json: string) {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-green-600' // default: string
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-red-600' // key
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-600'
        } else if (/null/.test(match)) {
          cls = 'text-gray-500'
        } else {
          cls = 'text-blue-600' // number
        }
        return `<span class="${cls}">${match}</span>`
      },
    )
}

async function copyJSON() {
  try {
    if (!modalContent.value) return
    let text = modalContent.value
    try {
      text = JSON.stringify(JSON.parse(text), null, 2)
    } catch {}
    await navigator.clipboard.writeText(text)
    alert('JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy JSON', err)
  }
}
</script>
