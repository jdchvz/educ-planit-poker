<template>
  <div class="min-h-screen flex flex-col items-center pt-6 md:pt-10 pb-20 bg-[#0f1e33] text-white"
    @click="handleOutsideClick">
    <div class="w-full max-w-5xl mb-6 px-4 md:px-6 flex justify-between items-center">
      <a href="/" class="text-lg font-semibold tracking-wide text-slate-200 hover:text-white transition-colors">Poker Planning</a>

      <!-- Invite Button -->
      <div class="relative" ref="inviteRef">
        <button @click.stop="showInvite = !showInvite"
          class="flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg bg-[#132a49] border border-slate-600 hover:border-sky-500 hover:bg-[#1a3a5c] transition-all text-sm font-medium text-slate-200 hover:text-white shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span class="hidden sm:inline">Invite Players</span>
        </button>

        <!-- Dropdown -->
        <transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
          <div v-if="showInvite" @click.stop class="absolute right-0 mt-2 w-72 md:w-80 bg-[#132a49] border border-slate-600 rounded-xl shadow-xl p-4 z-40">
            <div class="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-2">Share this room</div>
            <div class="flex items-center gap-2">
              <input type="text" :value="shareLink" readonly
                class="flex-1 bg-[#0f1e33] border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors" />
              <button @click="copyLink"
                class="p-2 rounded-lg bg-sky-700 hover:bg-sky-600 border border-sky-600 transition-colors shadow-md">
                <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="copied" class="mt-2 text-xs text-green-400 font-medium text-center">✓ Link copied to clipboard!</div>
            </transition>
          </div>
        </transition>
      </div>
    </div>

    <div class="panel-header mb-6 md:mb-10 px-4">
      <h1 class="text-3xl md:text-4xl font-extrabold tracking-wide text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.6)] mb-1">
        Pick your cards!
      </h1>
      <div class="mt-4 text-xs tracking-wide opacity-70">Room: {{ roomId }}</div>
    </div>

    <!-- Confetti + Congrats Overlay -->
    <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showCongrats" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/60 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4 z-10 px-4 text-center">
          <div class="text-6xl animate-bounce">🎉</div>
          <div class="text-2xl md:text-3xl font-bold text-white drop-shadow-lg tracking-wide">
            Yay! Everyone agreed!
          </div>
          <div class="text-4xl md:text-5xl font-extrabold text-sky-400 drop-shadow-lg animate-pulse">
            {{ agreedValue }}
          </div>
        </div>
        <div v-for="i in 40" :key="i" class="confetti-particle" :style="confettiStyle(i)"></div>
      </div>
    </transition>

    <div class="flex flex-col items-center gap-6 md:gap-8 w-full max-w-4xl px-4">

      <!-- Players -->
      <div class="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-3xl min-h-[160px]">
        <template v-if="players.length === 0 && !showNameModal">
          <div class="text-sm text-slate-500 tracking-wide">Waiting for players to join…</div>
        </template>
        <div v-for="p in players" :key="p" class="flex flex-col items-center gap-2">
          <!-- Card with flip animation -->
          <div class="card-flip" :class="{ flipped: revealed && votes[p] !== undefined }">
            <div class="card-flip-inner">
              <!-- Front (hidden state) -->
              <div class="card-flip-front user-badge-card" :class="{ voted: votes[p] !== undefined }">
                <span class="text-green-300 text-base font-medium" v-if="votes[p] !== undefined">✓</span>
                <span class="text-slate-500 text-lg animate-pulse" v-else>?</span>
              </div>
              <!-- Back (revealed state) -->
              <div class="card-flip-back user-badge-card" :class="{ voted: votes[p] !== undefined }">
                <span class="text-slate-300 text-lg font-semibold">{{ votes[p] ?? '?' }}</span>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div class="flex flex-col items-center gap-1">
            <div class="text-sm md:text-base font-medium lowercase tracking-wide flex items-center gap-1"
              :class="p === store.currentPlayer ? 'text-sky-400 font-bold' : 'text-slate-300'">
              {{ p }}
              <span v-if="p === store.currentPlayer" class="text-sky-400 text-xs md:text-sm">(you)</span>
            </div>
            <span v-if="votes[p] === undefined && !revealed"
              class="text-xs text-slate-500 animate-pulse tracking-wide">
              waiting...
            </span>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full max-w-3xl flex items-center gap-4">
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        <span class="text-slate-500 text-xs tracking-widest uppercase">Vote</span>
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 md:gap-4">
        <button @click='reveal'
          class='px-4 md:px-5 py-2.5 rounded-lg font-medium bg-sky-700 hover:bg-sky-600 disabled:opacity-40 shadow-md shadow-sky-900/40 text-sm md:text-base'
          :disabled='revealed || players.length===0'>Reveal cards</button>
        <button @click='reset'
          class='px-4 md:px-5 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/40 text-sm md:text-base'>Reset</button>
      </div>

      <!-- Fib Cards -->
      <div class="text-center w-full">
        <h3 class='text-base md:text-lg mb-4 md:mb-5 font-medium tracking-wide'>Choose your card 👇</h3>
        <div class='flex flex-wrap gap-3 md:gap-4 justify-center'>
          <button v-for='card in cards' :key='card' @click='handleVote(card)' class='fib-card'
            :disabled='revealed'
            :class='{ active: votes[store.currentPlayer]===card, "opacity-40 cursor-not-allowed": revealed }'>{{ card }}</button>
        </div>
      </div>

      <!-- Vote Distribution Chart -->
      <transition enter-active-class="transition-all duration-500" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
        <div v-if="revealed && Object.keys(voteDistribution).length > 0" class="w-full max-w-3xl bg-[#132a49] border border-slate-700 rounded-xl p-4 md:p-6 shadow-lg">
          <h3 class="text-sm font-semibold tracking-widest uppercase text-slate-400 mb-4">Vote Distribution</h3>
          <div class="flex items-end justify-center gap-2 md:gap-4 pt-10 overflow-x-auto">
            <div v-for="(count, value) in voteDistribution" :key="value"
              class="flex flex-col items-center gap-2 flex-1 min-w-[40px] max-w-[80px]">
              <div class="h-6 flex items-center justify-center">
                <span v-if="value === mostCommonVote" class="text-xl">👑</span>
              </div>
              <span class="text-sm font-bold"
                :class="value === mostCommonVote ? 'text-sky-400' : 'text-slate-300'">
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

    </div>

    <NameModal :show="showNameModal" @submit="handleNameSubmit" />
    <ErrorModal />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRoomStore } from '../../stores/room'
import NameModal from '../../components/NameModal.vue'
import ErrorModal from '../../components/ErrorModal.vue'

const route = useRoute()
const roomId = route.params.id

// Page title
useHead({ title: `Room ${roomId} | Poker Planning` })

const shareLink = ref('')
const showNameModal = computed(() => store.needNameModal)

// Close invite dropdown when clicking outside
const inviteRef = ref<HTMLElement | null>(null)
const handleOutsideClick = (e: MouseEvent) => {
  if (showInvite.value && inviteRef.value && !inviteRef.value.contains(e.target as Node)) {
    showInvite.value = false
  }
}

onMounted(() => {
  shareLink.value = `${window.location.origin}/room/${roomId}`
  if(store.currentRoomId && store.currentRoomId !== String(roomId)){
    store.players = []
    store.votes = {}
    store.revealed = false
    localStorage.setItem('players', JSON.stringify(store.players))
    localStorage.setItem('votes', JSON.stringify(store.votes))
    localStorage.setItem('revealed', JSON.stringify(store.revealed))
  }
  store.setRoom(String(roomId))
  if(!store.currentPlayer){
    store.setNeedNameModal(true)
  } else if(store.connectSocket){
    store.connectSocket(store.currentRoomId, store.currentPlayer)
  }
})

const store = useRoomStore()
const players = computed(() => store.players)
const votes = computed(() => store.votes)
const revealed = computed(() => store.revealed)
const reveal = store.reveal
const reset = store.reset
const cards = [0,1,2,3,5,8,13,21,34,55,89,'?','☕']
const handleVote = (card:any) => store.vote(card)
const handleNameSubmit = (name: string) => {
  if(store.connectSocket){
    store.currentPlayer = name
    localStorage.setItem('currentPlayer', name)
    store.setNeedNameModal(false)
    store.connectSocket(store.currentRoomId, name)
  }
}

const copied = ref(false)
const showInvite = ref(false)

const copyLink = async () => {
  await navigator.clipboard.writeText(shareLink.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
    showInvite.value = false
  }, 2000)
}

const showCongrats = ref(false)
const agreedValue = ref<any>(null)

const allVotesMatch = computed(() => {
  if (!revealed.value || players.value.length < 2) return false
  const validVotes = players.value
    .map(p => votes.value[p])
    .filter(v => v !== undefined && v !== '?' && v !== '☕')
  if (validVotes.length === 0) return false
  return validVotes.every(v => v === validVotes[0])
})

watch(allVotesMatch, (val) => {
  if (val) {
    agreedValue.value = votes.value[players.value[0]]
    showCongrats.value = true
    setTimeout(() => showCongrats.value = false, 4000)
  }
})

const confettiStyle = (i: number) => {
  const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c']
  const color = colors[i % colors.length]
  const left = `${Math.random() * 100}%`
  const delay = `${(i * 0.1) % 2}s`
  const duration = `${1.5 + (i % 3) * 0.5}s`
  return {
    position: 'fixed',
    top: '-10px',
    left,
    width: '8px',
    height: '8px',
    backgroundColor: color,
    borderRadius: i % 2 === 0 ? '50%' : '0',
    animation: `confettiFall ${duration} ${delay} ease-in forwards`,
  }
}

const voteDistribution = computed(() => {
  if (!revealed.value) return {}
  const dist: Record<string, number> = {}
  players.value.forEach(p => {
    const v = votes.value[p]
    if (v !== undefined && v !== '?' && v !== '☕') {
      const key = String(v)
      dist[key] = (dist[key] || 0) + 1
    }
  })
  const cardOrder = cards.map(c => String(c))
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

const numericVotes = computed(() =>
  players.value
    .map(p => votes.value[p])
    .filter(v => v !== undefined && v !== '?' && v !== '☕')
    .map(v => Number(v))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b)
)

const averageVote = computed(() => {
  if (!numericVotes.value.length) return '-'
  const avg = numericVotes.value.reduce((a, b) => a + b, 0) / numericVotes.value.length
  return Number.isInteger(avg) ? avg : avg.toFixed(1)
})

const medianVote = computed(() => {
  const sorted = numericVotes.value
  if (!sorted.length) return '-'
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
})
</script>

<style>
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

.card-flip {
  perspective: 600px;
  width: 4rem;
  height: 6rem;
}

.card-flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-flip.flipped .card-flip-inner {
  transform: rotateY(180deg);
}

.card-flip-front,
.card-flip-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-flip-back {
  transform: rotateY(180deg);
}
</style>