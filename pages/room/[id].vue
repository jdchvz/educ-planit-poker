<template>
  <div
    class="min-h-screen flex flex-col items-center pt-6 md:pt-10 pb-20 transition-colors duration-300"
    :class="dark ? 'bg-[#0f1e33] text-white' : 'bg-slate-100 text-slate-800'"
    @click="handleOutsideClick"
  >
    <ThemeToggle />
    <RoomNavbar :share-link="shareLink" ref="navbarRef" />
    <RoomHeader :room-id="roomId" />
    <CongratsOverlay :show="showCongrats" :agreed-value="agreedValue" />

    <div class="flex flex-col items-center gap-6 md:gap-8 w-full max-w-4xl px-4">

      <PlayerList
        :players="players"
        :votes="votes"
        :revealed="revealed"
        :current-player="store.currentPlayer"
      />

      <div class="w-full max-w-3xl flex items-center gap-4">
        <div
          class="flex-1 h-px bg-gradient-to-r from-transparent to-transparent transition-colors duration-300"
          :class="dark ? 'via-slate-600' : 'via-slate-300'"
        ></div>
        <span
          class="text-xs tracking-widest uppercase transition-colors duration-300"
          :class="dark ? 'text-slate-500' : 'text-slate-400'"
        >Vote</span>
        <div
          class="flex-1 h-px bg-gradient-to-r from-transparent to-transparent transition-colors duration-300"
          :class="dark ? 'via-slate-600' : 'via-slate-300'"
        ></div>
      </div>

      <VoteActions
        :revealed="revealed"
        :players="players"
        @reveal="reveal"
        @reset="reset"
      />

      <CardDeck
        v-if="store.currentPlayer && store._socketConnected"
        :cards="cards"
        :revealed="revealed"
        :current-vote="votes[store.currentPlayer]"
        @vote="handleVote"
      />

      <VoteDistributionChart
        :revealed="revealed"
        :players="players"
        :votes="votes"
        :cards="cards"
      />

    </div>

    <NameModal :show="showNameModal" @submit="handleNameSubmit" />
    <ErrorModal />

    <p class="mt-8 text-sm opacity-50">© {{ new Date().getFullYear() }} by Education Development Team</p>

    <FeedbackWidget />
  </div>
</template>

<script setup lang="ts">
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
import { useRoomStore } from '../../stores/room'
import { useHead } from 'nuxt/app'
import { useTheme } from '../../composables/useTheme'

const route = useRoute()
const roomId = String(route.params.id)

useHead({ title: `Room ${roomId} | Poker Planning` })

const store = useRoomStore()
const { dark } = useTheme()

const players = computed(() => store.players)
const votes = computed(() => store.votes)
const revealed = computed(() => store.revealed)
const cards = computed(() => {
  if (!import.meta.client) return []
  return [
    ...(Array.isArray(store.cardDeck) && store.cardDeck.length > 0
      ? store.cardDeck
      : [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]),
    '?',
    '☕',
  ]
})

const shareLink = ref('')
const showNameModal = computed(() => store.needNameModal)
const navbarRef = ref<any>(null)

const handleOutsideClick = (e: MouseEvent) => {
  if (navbarRef.value?.inviteRef && !navbarRef.value.inviteRef.contains(e.target as Node)) {
    navbarRef.value.showInvite = false
  }
}

onMounted(() => {
  store.init()
  shareLink.value = `${window.location.origin}/room/${roomId}`
  store.setRoom(roomId)
  if (!store.currentPlayer) {
    store.setNeedNameModal(true)
  } else {
    store.connectSocket?.(roomId, store.currentPlayer)
  }
})

// clean up when leaving room
onBeforeRouteLeave(() => {
  store.disconnectSocket?.(roomId)
  store.isCreator = false
  localStorage.removeItem('isCreator')
})

const reveal = () => store.reveal()
const reset = () => store.reset()
const handleVote = (card: any) => store.vote(card)
const handleNameSubmit = (name: string) => {
  store.addPlayer(name)
  store.setNeedNameModal(false)
  store.connectSocket?.(roomId, name)
}

const showCongrats = ref(false)
const agreedValue = ref<any>(null)

const allVotesMatch = computed(() => {
  if (!revealed.value || players.value.length < 2) return false
  const validVotes = players.value
    .map(p => votes.value[p])
    .filter(v => v !== undefined && v !== '?' && v !== '☕')
  if (validVotes.length < 2) return false
  return validVotes.every(v => v === validVotes[0])
})

watch(allVotesMatch, (val) => {
  if (val) {
    const validVotes = players.value
      .map(p => votes.value[p])
      .filter(v => v !== undefined && v !== '?' && v !== '☕')
    agreedValue.value = [...new Set(validVotes)][0] ?? null
    showCongrats.value = true
    setTimeout(() => showCongrats.value = false, 4000)
  }
})
</script>