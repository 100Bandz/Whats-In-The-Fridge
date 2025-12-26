<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-2">API Logs</h2>
      <div class="overflow-x-auto">
        <table class="table table-zebra text-sm">
          <thead>
            <tr class="bg-base-200">
              <th>Time</th>
              <th>Endpoint</th>
              <th>User</th>
              <th>Payload</th>
              <th>Messages</th>
              <th>Response/Error</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ log.createdAt }}</td>
              <td>{{ log.endpoint }}</td>
              <td>{{ log.user_id || 'N/A' }}</td>
              <td>
                <button class="btn btn-link btn-xs" @click="openModal(log.payload, 'Payload')">
                  View
                </button>
              </td>
              <td>
                <button class="btn btn-link btn-xs" @click="openModal(log.messages, 'AI Messages')">
                  View
                </button>
              </td>
              <td>
                <button class="btn btn-link btn-xs"
                  @click="openModal(log.ai_response || log.error, 'Response / Error')">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <dialog v-if="modalContent" class="modal modal-open">
      <div class="modal-box w-11/12 max-w-4xl bg-base-100">
        <h3 class="font-bold text-lg mb-2 flex items-center justify-between">
          {{ modalTitle }}
          <button class="btn btn-sm btn-ghost text-lg" @click="closeModal">✕</button>
        </h3>
        <pre v-html="formatJSON(modalContent)"
          class="whitespace-pre-wrap font-mono text-sm bg-base-200 rounded p-3 overflow-auto h-96"></pre>
        <div class="modal-action">
          <button @click="copyJSON" class="btn btn-primary btn-sm">Copy</button>
          <button @click="closeModal" class="btn btn-error btn-sm">Close</button>
        </div>
      </div>
    </dialog>
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
