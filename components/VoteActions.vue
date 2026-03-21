<template>
  <div class="flex gap-3 md:gap-4">
    <button @click="emit('reveal')"
      class="px-4 md:px-5 py-2.5 rounded-lg font-medium bg-sky-700 hover:bg-sky-600 disabled:opacity-40 shadow-md shadow-sky-900/40 text-sm md:text-base"
      :disabled="revealed || players.length === 0">Reveal cards</button>
    <button @click="emit('reset')"
      class="px-4 md:px-5 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/40 text-sm md:text-base">Reset</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ revealed: boolean, players: string[] }>()
const emit = defineEmits<{
  (e: 'reveal'): void
  (e: 'reset'): void
}>()
</script>