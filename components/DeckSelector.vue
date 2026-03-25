<template>
  <div>
    <label
      class="block text-xs uppercase font-semibold mb-2 tracking-wider transition-colors duration-300"
      :class="dark ? 'text-slate-400' : 'text-slate-500'"
    >
      Card Deck
    </label>
    <select
      v-model="model"
      class="w-full px-4 py-3 rounded-lg border outline-none cursor-pointer transition-colors duration-300 focus:ring-2"
      :class="dark
        ? 'bg-[#0f1e33] border-[#2e4f70] text-slate-100 focus:border-blue-500 focus:bg-[#173256] focus:ring-sky-500/40'
        : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-400 focus:ring-emerald-400/40'"
    >
      <option v-for="deck in deckOptions" :key="deck.label" :value="deck.value">
        {{ deck.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const { dark } = useTheme()

const model = defineModel<(string | number)[]>({ required: true })

const deckOptions = [
  { label: 'Fibonacci (1, 2, 3, 5, 8, 13, 21, 34, 55, 89)', value: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89] },
  { label: 'Modified Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 40, 100)', value: [0, 1, 2, 3, 5, 8, 13, 21, 40, 100] },
  { label: 'T-Shirt (XS, S, M, L, XL, XXL)', value: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Powers of 2 (1, 2, 4, 8, 16, 32, 64)', value: [1, 2, 4, 8, 16, 32, 64] },
  { label: 'CEM Custom (0, 1, 2, 5, 10, 20, 30, 50, 70, 100, 200, 500, 1k, 2k, 3k)', value: [0, 1, 2, 5, 10, 20, 30, 50, 70, 100, 200, 500, '1k', '2k', '3k'] },
]
</script>