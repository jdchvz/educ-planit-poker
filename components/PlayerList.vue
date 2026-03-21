<template>
  <div class="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-3xl min-h-[160px]">
    <template v-if="players.length === 0">
      <div class="text-sm text-slate-500 tracking-wide">Waiting for players to join…</div>
    </template>
    <div v-for="p in players" :key="p" class="flex flex-col items-center gap-2">
      <!-- Card with flip animation -->
      <div class="card-flip" :class="{ flipped: revealed && votes[p] !== undefined }">
        <div class="card-flip-inner">
          <div class="card-flip-front user-badge-card" :class="{ voted: votes[p] !== undefined }">
            <span class="text-green-300 text-base font-medium" v-if="votes[p] !== undefined">✓</span>
            <span class="text-slate-500 text-lg animate-pulse" v-else>?</span>
          </div>
          <div class="card-flip-back user-badge-card" :class="{ voted: votes[p] !== undefined }">
            <span class="text-slate-300 text-lg font-semibold">{{ votes[p] ?? '?' }}</span>
          </div>
        </div>
      </div>

      <!-- Name -->
      <div class="flex flex-col items-center gap-1">
        <div class="text-sm md:text-base font-medium lowercase tracking-wide flex items-center gap-1"
          :class="p === currentPlayer ? 'text-sky-400 font-bold' : 'text-slate-300'">
          {{ p }}
          <span v-if="p === currentPlayer" class="text-sky-400 text-xs md:text-sm">(you)</span>
        </div>
        <span v-if="votes[p] === undefined && !revealed" class="text-xs text-slate-500 animate-pulse tracking-wide">
          waiting...
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  players: string[]
  votes: Record<string, any>
  revealed: boolean
  currentPlayer: string
}>()
</script>