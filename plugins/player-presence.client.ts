import { useRoomStore } from '../stores/room'
declare const defineNuxtPlugin: (cb: (...args:any[])=>void) => any

export default defineNuxtPlugin(() => {
  const store = useRoomStore() as any
  const handler = () => {
    if(store.currentPlayer){
      if(store.disconnectSocket && store.currentRoomId){
        store.disconnectSocket(store.currentRoomId)
      }
      store.removePlayer(store.currentPlayer)
    }
  }
  window.addEventListener('beforeunload', handler)
})
