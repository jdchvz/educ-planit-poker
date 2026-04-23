<template>
  <div
    class="min-h-screen flex flex-col items-center pt-16 pb-24 font-sans transition-colors duration-300"
    :class="dark ? 'bg-[#0f1e33] text-slate-200' : 'bg-slate-100 text-slate-800'"
  >
    <ThemeToggle />
    <PageHeader />

    <div class="w-full max-w-xl space-y-8">
      <CreateRoomForm
        v-model:playerName="playerName"
        v-model:selectedDeck="selectedDeck"
        @create="createRoom"
      />
    </div>

    <p class="mt-8 text-sm opacity-50">© {{ new Date().getFullYear() }} by Education Development Team</p>

    <FeedbackWidget />
  </div>
</template>

<script setup>
const router = useRouter()
const store = useRoomStore()
const { dark } = useTheme()

const playerName = ref('')
const selectedDeck = ref([1, 2, 3, 5, 8, 13, 21, 34, 55, 89])

const createRoom = () => {
  if (playerName.value) {
    const newId = Math.random().toString(36).substring(2, 8)
    store.startNewRoom(playerName.value, selectedDeck.value, newId) // add newId
    router.push(`/room/${newId}`)
  }
}
</script>