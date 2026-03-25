import { io, Socket } from 'socket.io-client'
import { useRoomStore } from '../stores/room'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp: any) => {
  let socket: Socket | null = null
  const store = useRoomStore() as any
  let privateVotes: Record<string, any> = {} // Hidden from DevTools

  function connect(roomId: string, name: string) {
    if (socket) return

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
      if (store.isCreator) {
        socket!.emit('create-room', {
          roomId,
          name: store.currentPlayer,
          deck: Array.isArray(store.cardDeck) ? store.cardDeck : [...[1, 2, 3, 5, 8, 13, 21, 34, 55, 89]],
        })
      } else {
        // Reset votes and revealed state when joining a room
        privateVotes = {}
        store.revealed = false
        localStorage.setItem('revealed', JSON.stringify(store.revealed))
        socket!.emit('join-room', { roomId, name })
      }
    })

    socket.on('room-created', ({ roomId: createdId }: { roomId: string }) => {
      socket!.emit('join-room', { roomId: createdId, name: store.currentPlayer })
    })

    socket.on('presence', (payload: { players: string[] }) => {
      store.players = payload.players
    })

    socket.on('votes-sync', (payload: { roomId: string; votes: Record<string, any> }) => {
      if (payload.roomId === store.currentRoomId) {
        privateVotes = { ...payload.votes }
        // Only expose player names who have voted (not their actual votes)
        store.votes = Object.keys(privateVotes).reduce((acc, player) => {
          acc[player] = privateVotes[player] ? '●' : null
          return acc
        }, {} as Record<string, any>)
      }
    })

    socket.on('reveal-update', (payload: { roomId: string }) => {
      if (payload.roomId === store.currentRoomId) {
        store.revealed = true
        // Now expose actual votes only after reveal
        store.votes = privateVotes
        localStorage.setItem('revealed', JSON.stringify(store.revealed))
      }
    })

    socket.on('reset-update', (payload: { roomId: string }) => {
      if (payload.roomId === store.currentRoomId) {
        privateVotes = {}
        store.votes = {}
        store.revealed = false
        localStorage.setItem('revealed', JSON.stringify(store.revealed))
      }
    })

    socket.on('deck-sync', (payload: { deck: (string | number)[] }) => {
      store.setCardDeck(payload.deck)
    })

    socket.on('room-not-found', (payload: { roomId: string }) => {
      store.setError(`Room "${payload.roomId}" was not found. Redirecting to home...`)
      store.currentRoomId = ''
      store.players = []
      privateVotes = {}
      store.votes = {}
      store.revealed = false
      store.isCreator = false
      localStorage.setItem('players', JSON.stringify(store.players))
      localStorage.setItem('revealed', JSON.stringify(store.revealed))
      socket?.disconnect()
      store._socketConnected = false
      socket = null
      setTimeout(() => {
        store.setError('')
        nuxtApp.$router.push('/')
      }, 2500)
    })

    socket.on('name-taken', (payload: { name: string }) => {
      store.setError(`Name "${payload.name}" is already taken in this room`)
      store.currentPlayer = ''
      localStorage.removeItem('currentPlayer')
      store.setNeedNameModal(true)
      socket?.disconnect()
      store._socketConnected = false
      socket = null
    })

    socket.on('connect_error', (err: Error) => console.error('[socket] connect_error', err))
    socket.on('error', (err: Error) => console.error('[socket] error', err))
  }

  function disconnect(roomId: string) {
    if (socket) {
      socket.emit('leave-room', { roomId, name: store.currentPlayer })
      socket.disconnect()
      store._socketConnected = false
      socket = null
    }
  }

  store.connectSocket = connect
  store.disconnectSocket = disconnect
  store.emitVote = (card: any) => {
    if (socket && store.currentRoomId && store.currentPlayer) {
      socket.emit('vote', { roomId: store.currentRoomId, name: store.currentPlayer, card })
    }
  }
  store.emitReveal = () => {
    if (socket && store.currentRoomId) {
      socket.emit('reveal', { roomId: store.currentRoomId })
    }
  }
  store.emitReset = () => {
    if (socket && store.currentRoomId) {
      socket.emit('reset', { roomId: store.currentRoomId })
    }
  }
})
