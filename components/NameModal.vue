<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm"
        :class="dark ? 'bg-black/70' : 'bg-slate-900/40'"
      >
        <div
          class="w-[360px] rounded-2xl px-7 py-7 border shadow-2xl transition-colors duration-300"
          :class="dark
            ? 'bg-[#132a49] border-[#1d3554] text-slate-200 shadow-black/60'
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'"
          @click.stop
        >
          <h3
            class="text-lg font-semibold mb-5 tracking-wide text-center transition-colors duration-300"
            :class="dark ? 'text-slate-100' : 'text-slate-800'"
          >
            Enter your name
          </h3>

          <input
            v-model="name"
            @keyup.enter="submit"
            placeholder="Your name"
            autofocus
            class="w-full px-4 py-3 rounded-lg border outline-none text-sm transition-colors duration-200 focus:ring-2"
            :class="dark
              ? 'bg-[#0f1e33] border-[#2e4f70] text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:bg-[#173256] focus:ring-sky-500/40'
              : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:ring-sky-400/30'"
          />

          <div class="mt-6 text-center">
            <button
              @click="submit"
              :disabled="!name"
              class="px-8 py-3 rounded-lg font-semibold text-white text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40 transition-all duration-150 hover:-translate-y-0.5"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme';

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'submit', name: string): void }>()
const { dark } = useTheme()

const name = ref('')
const submit = () => { if (name.value) { emit('submit', name.value) } }

const lock = () => { document.body.style.overflow = 'hidden' }
const unlock = () => { document.body.style.overflow = '' }
watch(() => props.show, (v) => { v ? lock() : unlock() })
onUnmounted(unlock)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
