<template>
  <div class="flex gap-3 md:gap-4">
    <button
      v-if="isCreator"
      @click="emit('reveal')"
      class="px-4 md:px-5 py-2.5 rounded-lg font-medium text-white bg-sky-700 hover:bg-sky-600 disabled:opacity-40 shadow-md shadow-sky-900/40 text-sm md:text-base transition-all duration-150"
      :disabled="revealed || players.length === 0"
    >
      Reveal cards
    </button>
    <button
      v-if="isCreator"
      @click="emit('reset')"
      class="px-4 md:px-5 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/40 text-sm md:text-base transition-all duration-150"
    >
      Reset
    </button>
    <button
      v-if="!isCreator"
      @click="emit('clear-vote')"
      class="px-4 md:px-5 py-2.5 rounded-lg font-medium text-white bg-slate-600 hover:bg-slate-500 disabled:opacity-40 shadow-md shadow-slate-900/40 text-sm md:text-base transition-all duration-150"
      :disabled="revealed || !hasVoted"
    >
      Clear my vote
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ revealed: boolean, players: string[], isCreator: boolean, hasVoted: boolean }>()
const emit = defineEmits<{
  (e: 'reveal'): void
  (e: 'reset'): void
  (e: 'clear-vote'): void
}>()
</script>