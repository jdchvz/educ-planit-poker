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
      </div>
    </div>

    <div class="flex flex-col items-center gap-8 w-full max-w-4xl">
      <div class="flex flex-wrap justify-center gap-6 w-full max-w-3xl min-h-[160px]">
        <template v-if="players.length === 0 && !showNameModal">
          <div class="text-sm text-slate-500 tracking-wide">Waiting for players to join…</div>
        </template>
        <div v-for="p in players" :key="p" class="flex flex-col items-center">
          <div class="user-badge-card" :class="{ voted: votes[p] !== undefined }">
            <span class="text-slate-300 text-sm font-semibold" v-if="revealed && votes[p] !== undefined">{{ votes[p] }}</span>
            <span class="text-green-300 text-xs font-medium" v-else-if="votes[p] !== undefined">Voted</span>
            <span class="text-slate-500 text-sm" v-else>?</span>
          </div>
          <div class="text-xs font-medium lowercase tracking-wide mt-2">{{ p }}</div>
        </div>
      </div>

      <div class="flex gap-4 mt-2">
        <button @click='reveal' class='px-5 py-2 rounded-lg font-medium bg-sky-700 hover:bg-sky-600 disabled:opacity-40 shadow-md shadow-sky-900/40'
          :disabled='revealed || players.length===0'>Reveal cards</button>
  <button @click='reset' class='px-5 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/40'>Reset</button>
      </div>

      <div class="mt-10 text-center">
        <h3 class='text-sm mb-3 font-medium tracking-wide'>Choose your card 👇</h3>
        <div class='flex flex-wrap gap-3 justify-center max-w-3xl'>
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
import { onMounted, ref, computed } from 'vue'
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
</script>