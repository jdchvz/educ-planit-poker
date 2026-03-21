<template>
  <div class="min-h-screen flex flex-col items-center pt-10 pb-20 bg-[#0f1e33] text-white">
    <div class="w-full max-w-5xl mb-6 px-6 flex justify-start">
      <a href="/" class="text-lg font-semibold tracking-wide text-slate-200 hover:text-white transition-colors">Poker Planning</a>
    </div>
    <div class="panel-header mb-10">
      Pick your cards!
      <div class="mt-4 text-xs tracking-wide opacity-70">Room: {{ roomId }}</div>
      <div class="mt-2 flex items-center gap-2">
        <input type='text' :value='shareLink' readonly
          class='bg-[#132a49] border border-slate-600 rounded px-2 py-1 text-xs w-72 text-slate-200 focus:outline-none'/>
        <div class="relative">
          <button @click="copyLink" :title="copied ? 'Copied!' : 'Copy link'"
            class="p-1.5 rounded bg-[#132a49] border border-slate-600 hover:bg-slate-700 transition-colors">
            <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="copied"
              class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
              Copied!
              <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Confetti + Congrats Overlay -->
    <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showCongrats" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/60 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4 z-10">
          <div class="text-6xl animate-bounce">🎉</div>
          <div class="text-3xl font-bold text-white drop-shadow-lg tracking-wide text-center">
            Everyone agreed!
          </div>
          <div class="text-5xl font-extrabold text-sky-400 drop-shadow-lg animate-pulse">
            {{ agreedValue }}
          </div>
        </div>
        <!-- Confetti particles -->
        <div v-for="i in 40" :key="i" class="confetti-particle" :style="confettiStyle(i)"></div>
      </div>
    </transition>

    <div class="flex flex-col items-center gap-8 w-full max-w-4xl">
      <div class="flex justify-center gap-6 w-full max-w-3xl min-h-[160px]">
        <template v-if="players.length === 0 && !showNameModal">
          <div class="text-sm text-slate-500 tracking-wide">Waiting for players to join…</div>
        </template>
        <div v-for="p in players" :key="p" class="flex flex-col items-center">
          <div class="user-badge-card" :class="{ voted: votes[p] !== undefined }">
            <span class="text-slate-300 text-lg font-semibold" v-if="revealed && votes[p] !== undefined">{{ votes[p] }}</span>
            <span class="text-green-300 text-base font-medium" v-else-if="votes[p] !== undefined">Voted</span>
            <span class="text-slate-500 text-lg" v-else>?</span>
          </div>
          <div class="text-base font-medium lowercase tracking-wide mt-2 flex items-center gap-1"
            :class="p === store.currentPlayer ? 'text-sky-400 font-bold' : ''">
            {{ p }}
            <span v-if="p === store.currentPlayer" class="text-sky-400 text-sm">(you)</span>
          </div>
        </div>
      </div>

      <div class="flex gap-4 mt-2">
        <button @click='reveal' class='px-5 py-2 rounded-lg font-medium bg-sky-700 hover:bg-sky-600 disabled:opacity-40 shadow-md shadow-sky-900/40'
          :disabled='revealed || players.length===0'>Reveal cards</button>
  <button @click='reset' class='px-5 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/40'>Reset</button>
      </div>

      <div class="mt-10 text-center">
        <h3 class='text-lg mb-5 font-medium tracking-wide'>Choose your card 👇</h3>
        <div class='flex gap-4 justify-center max-w-4xl'>
          <button v-for='card in cards' :key='card' @click='handleVote(card)' class='fib-card'
            :disabled='revealed'
            :class='{ active: votes[store.currentPlayer]===card, "opacity-40 cursor-not-allowed": revealed }'>{{ card }}</button>
        </div>
      </div>
    </div>

    <NameModal :show="showNameModal" @submit="handleNameSubmit" />
    <ErrorModal />
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
import { useRoomStore } from '../../stores/room'
import PlayerList from '../../components/PlayerList.vue'
import NameModal from '../../components/NameModal.vue'
import ErrorModal from '../../components/ErrorModal.vue'
const route = useRoute()
const roomId = route.params.id
const shareLink = ref('')
// Use centralized flag from store
const showNameModal = computed(() => store.needNameModal)
onMounted(() => {
  shareLink.value = `${window.location.origin}/room/${roomId}`
  if(store.currentRoomId && store.currentRoomId !== String(roomId)){
    // Clear stale state when navigating directly to new room link
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
const copyLink = async () => {
  await navigator.clipboard.writeText(shareLink.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
const showCongrats = ref(false)
const agreedValue = ref<any>(null)

const allVotesMatch = computed(() => {
  if (!revealed.value || players.value.length < 2) return false
  const voteValues = players.value.map(p => votes.value[p]).filter(v => v !== undefined)
  if (voteValues.length !== players.value.length) return false
  return voteValues.every(v => v === voteValues[0])
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
</script>

<style>
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
</style>