<template>
  <div
    class="rounded-2xl border px-8 py-8 shadow-lg transition-colors duration-300"
    :class="dark
      ? 'bg-[#132a49] border-[#1d3554] shadow-black/40'
      : 'bg-white border-slate-200 shadow-slate-200/60'"
  >
    <h2
      class="text-lg font-semibold mb-6 tracking-wide transition-colors duration-300"
      :class="dark ? 'text-slate-100' : 'text-slate-800'"
    >
      Your details
    </h2>
    <div class="space-y-5">
      <div>
        <label
          class="block text-xs uppercase font-semibold mb-2 tracking-wider transition-colors duration-300"
          :class="dark ? 'text-slate-400' : 'text-slate-500'"
        >
          Name
        </label>
        <input
          v-model="playerName"
          placeholder="Enter your name"
          class="w-full px-4 py-3 rounded-lg border outline-none transition-colors duration-300 focus:ring-2"
          :class="dark
            ? 'bg-[#0f1e33] border-[#2e4f70] text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:bg-[#173256] focus:ring-sky-500/40'
            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/40'"
          @keyup.enter="emit('create')"
        />
      </div>
      <DeckSelector v-model="selectedDeck" />
      <div class="flex gap-4 pt-2">
        <button
          @click="emit('create')"
          class="flex-1 px-5 py-3 rounded-lg font-semibold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-900/40 transition-all duration-150 hover:-translate-y-0.5"
          :disabled="!playerName"
        >
          Create Room
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { dark } = useTheme()

const playerName = defineModel('playerName', { default: '' })
const selectedDeck = defineModel('selectedDeck', { default: () => [1, 2, 3, 5, 8, 13, 21, 34, 55, 89] })

const emit = defineEmits(['create'])
</script>