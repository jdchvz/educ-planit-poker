// Plugin to initialize room store on client
// Using relative path to satisfy TS in this environment; Nuxt runtime resolves alias normally.
import { useRoomStore } from '../stores/room'
// Fallback declaration if auto-import types not picked up by editor tooling
declare const defineNuxtPlugin: (cb: (...args: any[]) => void) => any

export default defineNuxtPlugin(() => {
  const store = useRoomStore()
  store.init()
})
