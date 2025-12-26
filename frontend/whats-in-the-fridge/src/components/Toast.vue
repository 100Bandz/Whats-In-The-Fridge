<template>
  <div
    class="toast toast-end fixed bottom-4 right-4 z-[9999] sm:right-6 sm:bottom-6"
  >
    <transition name="toast-slide">
      <div
        v-if="visible && type === 'success'"
        class="alert alert-success shadow-lg"
      >
        <span class="font-medium flex items-center gap-2">
          {{ message }}
        </span>
      </div>
    </transition>

    <transition name="toast-slide">
      <div
        v-if="visible && type === 'error'"
        class="alert alert-error shadow-lg"
      >
        <span class="font-medium flex items-center gap-2">
          {{ message }}
        </span>
      </div>
    </transition>

    <transition name="toast-slide">
      <div
        v-if="visible && type === 'info'"
        class="alert alert-info shadow-lg"
      >
        <span class="font-medium flex items-center gap-2">
          {{ message }}
        </span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
let timer: number | undefined
function showToast(msg: string, t: 'success' | 'error' | 'info' = 'info', duration = 4000) {
  if (timer) clearTimeout(timer)

  message.value = msg
  type.value = t
  visible.value = true

  timer = window.setTimeout(() => {
    visible.value = false
  }, duration)
}

watch(visible, (v) => {
  if (!v) message.value = ''
})

defineExpose({ showToast })
</script>

<style scoped>

.toast {
  pointer-events: none;
}
.alert {
  pointer-events: all;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.35s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.toast-slide-enter-to,
.toast-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>