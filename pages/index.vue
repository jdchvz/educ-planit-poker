<template>
  <div class="min-h-screen flex flex-col items-center pt-16 pb-24 bg-[#0f1e33] text-slate-200 font-sans">
    
    <div class="panel-header mb-14 w-[760px] max-w-full">
      <h1 class="text-4xl font-extrabold tracking-wide text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.6)] mb-1">
        Education Poker Planning
      </h1>
      <div class="mt-4 text-sm opacity-75 tracking-wide">Create or join an estimation room</div>
      <div class="mt-2 text-sm opacity-75 tracking-wide">Let the war begin!</div>
    </div>

    <div class="w-full max-w-xl space-y-8">
      <div class="bg-[#132a49] rounded-2xl border border-[#1d3554] px-8 py-8 shadow-lg shadow-black/40">
        <h2 class="text-lg font-semibold mb-6 tracking-wide">Your details</h2>
        <div class="space-y-5">
          <div>
            <label class="block text-xs uppercase font-semibold mb-2 tracking-wider text-slate-400">Name</label>
            <input v-model="playerName" placeholder="Enter your name" class="form-input" @keyup.enter="createRoom" />
          </div>
          <DeckSelector v-model="selectedDeck" />
          <div class="flex gap-4 pt-2">
            <button
              @click="createRoom"
              class="flex-1 px-5 py-3 rounded-lg font-semibold bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-900/40 transition-all duration-150 hover:-translate-y-0.5"
              :disabled="!playerName"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useRoomStore } from '~/stores/room'
import DeckSelector from '~/components/DeckSelector.vue'

const router = useRouter()
const playerName = ref('')
const selectedDeck = ref([1, 2, 3, 5, 8, 13, 21, 34, 55, 89])
const store = useRoomStore()

const createRoom = () => {
  if (playerName.value) {
    const newId = Math.random().toString(36).substring(2, 8)
    store.startNewRoom(playerName.value, selectedDeck.value)
    router.push(`/room/${newId}`)
  }
}
</script>