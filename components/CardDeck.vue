<template>
  <div class="text-center w-full">
    <h3
      class="text-base md:text-lg mb-4 md:mb-5 font-medium tracking-wide transition-colors duration-300"
      :class="dark ? 'text-slate-200' : 'text-slate-700'"
    >
      Choose your card 👇
    </h3>
    <div class="flex flex-wrap gap-3 md:gap-4 justify-center">
      <button
        v-for="card in cards"
        :key="card"
        @click="emit('vote', card)"
        :disabled="revealed"
        class="w-14 h-20 md:w-16 md:h-24 rounded-lg border-2 font-bold text-base md:text-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
        :class="[
          revealed ? 'opacity-40 cursor-not-allowed' : '',
          currentVote === card
            ? 'border-sky-400 bg-sky-500 text-white -translate-y-3 scale-105 shadow-[0_8px_20px_rgba(56,189,248,0.5)]'
            : dark
              ? 'border-slate-600 bg-[#132a49] text-slate-100 hover:border-sky-400 hover:bg-[#1a3a5c] hover:text-white hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-900/50 shadow-[0_4px_8px_rgba(0,0,0,0.4)]'
              : 'border-slate-300 bg-white text-slate-800 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-200/60 shadow-[0_4px_8px_rgba(0,0,0,0.08)]'
        ]"
      >
        {{ card }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

defineProps<{
  cards: any[]
  revealed: boolean
  currentVote: any
}>()

const emit = defineEmits<{ (e: 'vote', card: any): void }>()
const { dark } = useTheme()
</script>