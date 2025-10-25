<!-- Toast.vue -->
<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="[
        'fixed top-16 right-4 text-white px-4 py-2 rounded shadow-lg z-50',
        typeClass
      ]"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')

const typeClass = computed(() => {
  return {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  }[type.value]
})

function showToast(msg: string, t: 'success' | 'error' | 'info' = 'info', duration = 4000) {
  message.value = msg
  type.value = t
  visible.value = true
  setTimeout(() => (visible.value = false), duration)
}

defineExpose({ showToast })
</script>
