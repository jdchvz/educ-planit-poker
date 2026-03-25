<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="message"
        class="fixed inset-0 flex items-center justify-center z-[1100] backdrop-blur-sm"
        :class="dark ? 'bg-black/70' : 'bg-slate-900/40'"
        @click="close"
      >
        <div
          class="w-[360px] rounded-2xl px-7 py-7 border shadow-2xl transition-colors duration-300"
          :class="dark
            ? 'bg-[#2d1f1f] border-red-900/60 text-slate-200 shadow-black/60'
            : 'bg-white border-red-200 text-slate-800 shadow-slate-300/60'"
          @click.stop
        >
          <h3
            class="text-lg font-semibold mb-3 tracking-wide transition-colors duration-300"
            :class="dark ? 'text-red-300' : 'text-red-600'"
          >
            Error
          </h3>
          <p
            class="text-sm leading-relaxed mb-6 transition-colors duration-300"
            :class="dark ? 'text-red-200' : 'text-red-500'"
          >
            {{ message }}
          </p>
          <div class="text-center">
            <button
              @click="close"
              class="px-8 py-2.5 rounded-lg font-semibold text-white text-sm bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoomStore } from '../stores/room'

const store = useRoomStore()
const { dark } = useTheme()

const message = computed(() => store.error)
const close = () => {
  const shouldRedirect = store.errorRedirect
  store.setError('')
  if (shouldRedirect && typeof window !== 'undefined') {
    window.location.href = '/'
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
