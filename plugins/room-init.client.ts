import { useRoomStore } from '../stores/room'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const store = useRoomStore()
  store.init()
})
