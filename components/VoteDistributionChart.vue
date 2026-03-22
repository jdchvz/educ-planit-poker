<template>
  <transition enter-active-class="transition-all duration-500" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
    <div v-if="revealed && Object.keys(voteDistribution).length > 0"
      class="w-full max-w-3xl bg-[#132a49] border border-slate-700 rounded-xl p-4 md:p-6 shadow-lg">
      <h3 class="text-sm font-semibold tracking-widest uppercase text-slate-400 mb-4">Vote Distribution</h3>
      <div class="flex items-end justify-center gap-2 md:gap-4 pt-10 overflow-x-auto">
        <div v-for="(count, value) in voteDistribution" :key="value"
          class="flex flex-col items-center gap-2 flex-1 min-w-[40px] max-w-[80px]">
          <div class="h-6 flex items-center justify-center">
            <span v-if="value === mostCommonVote" class="text-xl">👑</span>
          </div>
          <span class="text-sm font-bold" :class="value === mostCommonVote ? 'text-sky-400' : 'text-slate-300'">
            {{ count }}
          </span>
          <div class="w-full rounded-t-lg transition-all duration-700"
            :class="value === mostCommonVote ? 'bg-sky-500 shadow-lg shadow-sky-900/50' : 'bg-slate-600'"
            :style="{ height: `${(count / maxVoteCount) * 120}px` }">
          </div>
          <div class="text-xs md:text-sm font-bold px-1 py-1 rounded"
            :class="value === mostCommonVote ? 'text-sky-400 font-extrabold' : 'text-slate-400'">
            {{ value }}
          </div>
        </div>
      </div>

      <div class="mt-4 text-center text-sm text-slate-400">
        Most voted: <span class="text-sky-400 font-bold text-base">{{ mostCommonVote }}</span>
        <span class="text-slate-500 ml-1">({{ maxVoteCount }} {{ maxVoteCount === 1 ? 'vote' : 'votes' }})</span>
      </div>

      <!-- Average & Median -->
      <div class="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-center">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold tracking-widest uppercase text-slate-500">Average</span>
          <span class="text-2xl font-extrabold text-emerald-400">{{ averageVote }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold tracking-widest uppercase text-slate-500">Median</span>
          <span class="text-2xl font-extrabold text-violet-400">{{ medianVote }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  revealed: boolean
  players: string[]
  votes: Record<string, any>
  cards: any[]
}>()

const TSHIRT_SCALE: Record<string, number> = {
  XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6,
}
const TSHIRT_REVERSE: Record<number, string> = Object.fromEntries(
  Object.entries(TSHIRT_SCALE).map(([k, v]) => [v, k])
)

const isTshirt = computed(() =>
  props.cards.some(c => Object.keys(TSHIRT_SCALE).includes(String(c)))
)

const voteDistribution = computed(() => {
  if (!props.revealed) return {}
  const dist: Record<string, number> = {}
  props.players.forEach(p => {
    const v = props.votes[p]
    if (v !== undefined && v !== '?' && v !== '☕') {
      const key = String(v)
      dist[key] = (dist[key] || 0) + 1
    }
  })
  const cardOrder = props.cards.map(c => String(c))
  return Object.fromEntries(
    Object.entries(dist).sort((a, b) => cardOrder.indexOf(a[0]) - cardOrder.indexOf(b[0]))
  )
})

const maxVoteCount = computed(() => Math.max(...Object.values(voteDistribution.value), 1))

const mostCommonVote = computed(() => {
  const entries = Object.entries(voteDistribution.value)
  if (!entries.length) return null
  return entries.reduce((a, b) => b[1] > a[1] ? b : a)[0]
})

const tshirtScores = computed(() =>
  props.players
    .map(p => props.votes[p])
    .filter(v => v !== undefined && v !== '?' && v !== '☕' && TSHIRT_SCALE[String(v)] !== undefined)
    .map(v => TSHIRT_SCALE[String(v)])
    .sort((a, b) => a - b)
)

const numericVotes = computed(() =>
  props.players
    .map(p => props.votes[p])
    .filter(v => v !== undefined && v !== '?' && v !== '☕')
    .map(v => Number(v))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b)
)

const averageVote = computed(() => {
  if (isTshirt.value) {
    const scores = tshirtScores.value
    if (!scores.length) return '-'
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return TSHIRT_REVERSE[Math.round(avg)] ?? '-'
  }
  if (!numericVotes.value.length) return '-'
  const avg = numericVotes.value.reduce((a, b) => a + b, 0) / numericVotes.value.length
  return Number.isInteger(avg) ? avg : avg.toFixed(1)
})

const medianVote = computed(() => {
  if (isTshirt.value) {
    const scores = tshirtScores.value
    if (!scores.length) return '-'
    const mid = Math.floor(scores.length / 2)
    const median = scores.length % 2 !== 0
      ? scores[mid]
      : (scores[mid - 1] + scores[mid]) / 2
    return TSHIRT_REVERSE[Math.round(median)] ?? '-'
  }
  const sorted = numericVotes.value
  if (!sorted.length) return '-'
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
})
</script>