<template>
  <div>
    <label class="block text-xs uppercase font-semibold mb-2 tracking-wider text-slate-400">Card Deck</label>
    <select v-model="model" class="form-input bg-[#0f1e33] cursor-pointer w-full">
      <option v-for="deck in deckOptions" :key="deck.label" :value="deck.value">
        {{ deck.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<(string | number)[]>({ required: true })

const deckOptions = [
  { label: 'Fibonacci (1, 2, 3, 5, 8, 13, 21, 34, 55, 89)', value: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89] },
  { label: 'Modified Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 40, 100)', value: [0, 1, 2, 3, 5, 8, 13, 21, 40, 100] },
  { label: 'T-Shirt (XS, S, M, L, XL, XXL)', value: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Powers of 2 (1, 2, 4, 8, 16, 32, 64)', value: [1, 2, 4, 8, 16, 32, 64] },
]
</script>