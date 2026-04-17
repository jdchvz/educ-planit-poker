import { useRoomStore } from '../stores/room'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const store = useRoomStore()

  const handler = () => {
    if (store.currentPlayer) {
      if (store.disconnectSocket && store.currentRoomId) {
        store.disconnectSocket(store.currentRoomId)
      }
      store.removePlayer(store.currentPlayer)
    }
  }

  window.addEventListener('beforeunload', handler)
})
