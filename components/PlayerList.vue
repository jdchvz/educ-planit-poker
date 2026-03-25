<template>
  <div class="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-3xl min-h-[160px]">
    <template v-if="players.length === 0">
      <div
        class="text-sm tracking-wide transition-colors duration-300"
        :class="dark ? 'text-slate-500' : 'text-slate-400'"
      >
        Waiting for players to join…
      </div>
    </template>
    <div v-for="p in players" :key="p" class="flex flex-col items-center gap-2">
      <div class="card-flip" :class="{ flipped: revealed && votes[p] !== undefined }">
        <div class="card-flip-inner">
          <!-- Front -->
          <div
            class="card-flip-front w-16 h-24 rounded-lg border-2 flex items-center justify-center shadow-md transition-all duration-200"
            :class="votes[p] !== undefined
              ? dark ? 'border-green-400 bg-[#0f2d1f] shadow-green-900/40' : 'border-green-400 bg-green-50 shadow-green-200/60'
              : dark ? 'border-slate-600 bg-[#132a49]' : 'border-slate-300 bg-white'"
          >
            <span class="text-green-400 text-base font-medium" v-if="votes[p] !== undefined">✓</span>
            <span
              class="text-lg animate-pulse"
              :class="dark ? 'text-slate-500' : 'text-slate-400'"
              v-else
            >?</span>
          </div>
          <!-- Back -->
          <div
            class="card-flip-back w-16 h-24 rounded-lg border-2 flex items-center justify-center shadow-md transition-all duration-200"
            :class="dark
              ? 'border-sky-400 bg-[#132a49]'
              : 'border-sky-400 bg-sky-50'"
          >
            <span
              class="text-lg font-semibold"
              :class="dark ? 'text-slate-300' : 'text-slate-700'"
            >{{ votes[p] ?? '?' }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-1">
        <div
          class="text-sm md:text-base font-medium lowercase tracking-wide flex items-center gap-1 transition-colors duration-300"
          :class="p === currentPlayer
            ? 'text-sky-500 font-bold'
            : dark ? 'text-slate-300' : 'text-slate-600'"
        >
          {{ p }}
          <span v-if="p === currentPlayer" class="text-sky-500 text-xs md:text-sm">(you)</span>
        </div>
        <span
          v-if="votes[p] === undefined && !revealed"
          class="text-xs animate-pulse tracking-wide transition-colors duration-300"
          :class="dark ? 'text-slate-500' : 'text-slate-400'"
        >
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

const { dark } = useTheme()
</script>