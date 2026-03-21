import { io, Socket } from 'socket.io-client'
import { useRoomStore } from '../stores/room'
declare const defineNuxtPlugin: (cb: (...args:any[])=>void) => any

export default defineNuxtPlugin((nuxtApp: any) => {
  let socket: Socket | null = null
  const store = useRoomStore() as any

  function connect(roomId: string, name: string){
    if(socket){ return }

    // No URL = connects to same host automatically
    socket = io({
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      store._socketConnected = true
      if(store.isCreator){
        socket!.emit('create-room', { roomId, name })
      } else {
        socket!.emit('join-room', { roomId, name })
      }
    })
    socket.on('room-created', ({ roomId: createdId }) => {
      socket!.emit('join-room', { roomId: createdId, name: store.currentPlayer })
    })
    socket.on('room-exists', ({ roomId: existingId }) => {
      socket!.emit('join-room', { roomId: existingId, name: store.currentPlayer })
    })
    socket.on('presence', (payload: { roomId: string; players: string[] }) => {
      store.players = payload.players
    })
    socket.on('votes-sync', (payload: { roomId: string; votes: Record<string, any> }) => {
      if(payload.roomId === store.currentRoomId){
        store.votes = { ...payload.votes }
        localStorage.setItem('votes', JSON.stringify(store.votes))
      }
    })
    socket.on('reveal-update', (payload: { roomId: string }) => {
      if(payload.roomId === store.currentRoomId){
        store.revealed = true
  localStorage.setItem('revealed', JSON.stringify(store.revealed))
      }
    })
    socket.on('reset-update', (payload: { roomId: string }) => {
      if(payload.roomId === store.currentRoomId){
        store.votes = {}
        store.revealed = false
  localStorage.setItem('votes', JSON.stringify(store.votes))
  localStorage.setItem('revealed', JSON.stringify(store.revealed))
      }
    })
    socket.on('room-not-found', (payload: { roomId: string }) => {
      store.setError(`Room "${payload.roomId}" was not found. Redirecting to home...`)
      // Clear room-related state
      store.currentRoomId = ''
      store.players = []
      store.votes = {}
      store.revealed = false
      store.isCreator = false
      localStorage.setItem('players', JSON.stringify(store.players))
      localStorage.setItem('votes', JSON.stringify(store.votes))
      localStorage.setItem('revealed', JSON.stringify(store.revealed))
      // Disconnect socket
      if(socket){
        socket.disconnect()
        store._socketConnected = false
        socket = null
      }
      // Redirect to homepage after short delay so user can see the error
      setTimeout(() => {
        store.setError('')
        nuxtApp.$router.push('/')
      }, 2500)
    })
    socket.on('name-taken', (payload: { roomId: string; name: string }) => {
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
