import { io, Socket } from 'socket.io-client'
import { useRoomStore } from '../stores/room'
declare const defineNuxtPlugin: (cb: (...args:any[])=>void) => any

export default defineNuxtPlugin((nuxtApp: any) => {
  let socket: Socket | null = null
  const store = useRoomStore() as any
  const config = (nuxtApp.$config || nuxtApp.$config.public || (nuxtApp.$config && nuxtApp.$config.runtimeConfig) || {})
  const url = (nuxtApp.$config?.public?.socketUrl) || process?.env?.NUXT_SOCKET_URL || 'http://localhost:4000'

  function connect(roomId: string, name: string){
    if(socket){ return }
  console.log('[client] connecting to', url, 'room', roomId, 'as', name)
  socket = io(url, { transports: ['websocket', 'polling'] })
    socket.on('connect', () => {
      console.log('[client] connected', socket!.id)
      store._socketConnected = true
      if(store.isCreator){
        socket!.emit('create-room', { roomId, name })
      } else {
        socket!.emit('join-room', { roomId, name })
      }
    })
    socket.on('room-created', ({ roomId: createdId }) => {
      console.log('[client] room-created', createdId)
      socket!.emit('join-room', { roomId: createdId, name: store.currentPlayer })
    })
    socket.on('room-exists', ({ roomId: existingId }) => {
      console.log('[client] room-exists (treating as normal join)', existingId)
      socket!.emit('join-room', { roomId: existingId, name: store.currentPlayer })
    })
    socket.on('presence', (payload: { roomId: string; players: string[] }) => {
      console.log('[client] presence update', payload)
      store.players = payload.players
    })
    socket.on('votes-sync', (payload: { roomId: string; votes: Record<string, any> }) => {
      if(payload.roomId === store.currentRoomId){
        store.votes = { ...payload.votes }
        localStorage.setItem('votes', JSON.stringify(store.votes))
        console.log('[client] votes-sync applied', payload)
      }
    })
    socket.on('reveal-update', (payload: { roomId: string }) => {
      if(payload.roomId === store.currentRoomId){
        store.revealed = true
  localStorage.setItem('revealed', JSON.stringify(store.revealed))
  console.log('[client] reveal-update applied')
      }
    })
    socket.on('reset-update', (payload: { roomId: string }) => {
      if(payload.roomId === store.currentRoomId){
        store.votes = {}
        store.revealed = false
  localStorage.setItem('votes', JSON.stringify(store.votes))
  localStorage.setItem('revealed', JSON.stringify(store.revealed))
  console.log('[client] reset-update applied')
      }
    })
    socket.on('room-not-found', (payload: { roomId: string }) => {
      console.warn('[client] room-not-found', payload)
      store.setError(`Room ${payload.roomId} not found`)
      // Clear room-related state
      store.currentRoomId = ''
      store.players = []
      store.votes = {}
      store.revealed = false
      localStorage.setItem('players', JSON.stringify(store.players))
      localStorage.setItem('votes', JSON.stringify(store.votes))
      localStorage.setItem('revealed', JSON.stringify(store.revealed))
    })
    socket.on('name-taken', (payload: { roomId: string; name: string }) => {
      console.warn('[client] name-taken', payload)
      store.setError(`Name "${payload.name}" is already taken in this room`)
      store.setErrorRedirect(false)
      // clear currentPlayer so user must choose another name
      store.currentPlayer = ''
      localStorage.removeItem('currentPlayer')
      store.setNeedNameModal(true)
      // Allow retry: disconnect so new attempt will create a fresh socket
      if(socket){
        socket.disconnect()
        store._socketConnected = false
        socket = null
      }
    })
    socket.on('connect_error', (err) => {
      console.error('[client] connect_error', err)
    })
    socket.on('error', (err) => {
      console.error('[client] error', err)
    })
  }

  function disconnect(roomId: string){
    if(socket){
      console.log('[client] disconnect socket')
      socket.emit('leave-room', { roomId, name: store.currentPlayer })
      socket.disconnect()
      store._socketConnected = false
      socket = null
    }
  }

  store.connectSocket = connect
  store.disconnectSocket = disconnect
  store.emitVote = (card: any) => {
    if(socket && store.currentRoomId && store.currentPlayer){
      socket.emit('vote', { roomId: store.currentRoomId, name: store.currentPlayer, card })
    }
  }
  store.emitReveal = () => {
    if(socket && store.currentRoomId){
      socket.emit('reveal', { roomId: store.currentRoomId })
    }
  }
  store.emitReset = () => {
    if(socket && store.currentRoomId){
      socket.emit('reset', { roomId: store.currentRoomId })
    }
  }
})
