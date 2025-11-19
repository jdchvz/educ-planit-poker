<template>
  <div class="relative mx-auto w-full max-w-lg p-6 bg-slate-800/80 border border-slate-600 rounded-xl shadow-lg backdrop-blur text-center">
    <h2 class="text-slate-100 text-lg font-semibold mb-4">Vote Status</h2>
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div v-for="p in players" :key="p" class="flex items-center justify-between px-3 py-2 bg-slate-700 rounded">
        <span class="text-slate-200 text-sm font-medium truncate">{{ p }}</span>
        <span v-if="revealed && votes[p] !== undefined" class="text-sky-400 font-bold">{{ votes[p] }}</span>
        <span v-else-if="votes[p] !== undefined" class="text-green-400 text-xs">Voted</span>
        <span v-else class="text-slate-500 text-xs">Waiting...</span>
      </div>
    </div>
    <div class="space-y-1">
      <p class="text-sm text-slate-300">Players: <strong>{{ players.length }}</strong></p>
      <p class="text-sm text-slate-300">Votes in: <strong>{{ votesCount }}</strong> / {{ players.length }}</p>
      <p v-if="allVoted && !revealed" class="text-xs text-amber-400">All players have voted. Reveal when ready.</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ players: string[]; votes: Record<string, any>; revealed: boolean }>()
const votesCount = computed(() => Object.keys(props.votes).length)
const allVoted = computed(() => props.players.length > 0 && votesCount.value === props.players.length)
</script>
<style scoped>
</style>
