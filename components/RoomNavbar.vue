<template>
  <div class="w-full max-w-5xl mb-6 px-4 md:px-6 flex justify-between items-center">
    <a
      href="/"
      class="text-lg font-semibold tracking-wide transition-colors duration-300"
      :class="dark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'"
    >
      Poker Planning
    </a>

    <div class="relative" ref="inviteRef">
      <button
        @click.stop="showInvite = !showInvite"
        class="flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg border transition-all text-sm font-medium shadow-md"
        :class="dark
          ? 'bg-[#132a49] border-slate-600 hover:border-sky-500 hover:bg-[#1a3a5c] text-slate-200 hover:text-white'
          : 'bg-white border-slate-300 hover:border-sky-400 hover:bg-slate-50 text-slate-700 hover:text-slate-900'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span class="hidden sm:inline">Invite Players</span>
      </button>

      <transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="showInvite"
          @click.stop
          class="absolute right-0 mt-2 w-72 md:w-80 rounded-xl shadow-xl p-4 z-40 border transition-colors duration-300"
          :class="dark
            ? 'bg-[#132a49] border-slate-600'
            : 'bg-white border-slate-200'"
        >
          <div
            class="text-xs font-semibold tracking-widest uppercase mb-2 transition-colors duration-300"
            :class="dark ? 'text-slate-400' : 'text-slate-500'"
          >
            Share this room
          </div>
          <div class="flex items-center gap-2">
            <input
              type="text"
              :value="shareLink"
              readonly
              class="flex-1 rounded-lg px-3 py-2 text-xs border outline-none focus:border-sky-500 transition-colors duration-300"
              :class="dark
                ? 'bg-[#0f1e33] border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-700'"
            />
            <button
              @click="copyLink"
              class="p-2 rounded-lg bg-sky-700 hover:bg-sky-600 border border-sky-600 transition-colors shadow-md"
            >
              <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <transition
            enter-active-class="transition-opacity duration-150"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="copied" class="mt-2 text-xs text-green-400 font-medium text-center">✓ Link copied to clipboard!</div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '../composables/useTheme';

const props = defineProps<{ shareLink: string }>()
const { dark } = useTheme()

const showInvite = ref(false)
const copied = ref(false)
const inviteRef = ref<HTMLElement | null>(null)

const copyLink = async () => {
  await navigator.clipboard.writeText(props.shareLink)
  copied.value = true
  setTimeout(() => {
    copied.value = false
    showInvite.value = false
  }, 2000)
}

defineExpose({ inviteRef, showInvite })
</script>