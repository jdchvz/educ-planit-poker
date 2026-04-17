import { io, Socket } from 'socket.io-client'
import { useRoomStore } from '../stores/room'
import { useEmojiThrow } from '../composables/useEmojiThrow'
import { useErrorHandler } from '../composables/useErrorHandler'
import { defineNuxtPlugin } from 'nuxt/app'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket'
import type { CardValue } from '../types/room'

export default defineNuxtPlugin((nuxtApp) => {
  let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  const store = useRoomStore()
  const { addThrow } = useEmojiThrow()
  const errorHandler = useErrorHandler()
  let currentRoundId: string = ''
  let reconnectAttempt = 0

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
      reconnectAttempt = 0

      if (store.isCreator) {
        socket!.emit('create-room', {
          roomId,
          name: store.currentPlayer,
          deck: Array.isArray(store.cardDeck) ? store.cardDeck : [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
        })
      } else {
        currentRoundId = ''
        store.revealed = false
        localStorage.setItem('revealed', JSON.stringify(store.revealed))
        socket!.emit('join-room', { roomId, name })
      }

      // Clear any reconnection error messages
      if (reconnectAttempt > 0) {
        errorHandler.handleReconnected()
      }
    })

    socket.on('room-created', ({ roomId: createdId }) => {
      socket!.emit('join-room', { roomId: createdId, name: store.currentPlayer })
    })

    socket.on('presence', (payload) => {
      store.players = payload.players
    })

    socket.on('votes-sync', (payload) => {
      if (payload.roomId !== store.currentRoomId) return
      currentRoundId = payload.roundId
      store.votes = { ...payload.votes }
    })

    socket.on('reveal-update', (payload) => {
      if (payload.roomId !== store.currentRoomId) return
      store.revealed = true
      localStorage.setItem('revealed', JSON.stringify(store.revealed))
    })

    socket.on('reset-update', (payload) => {
      if (payload.roomId !== store.currentRoomId) return
      currentRoundId = payload.roundId
      store.votes = {}
      store.revealed = false
      localStorage.setItem('revealed', JSON.stringify(store.revealed))
    })

    socket.on('deck-sync', (payload) => {
      store.setCardDeck(payload.deck)
    })

    socket.on('emoji-throw', (payload) => {
      addThrow(payload.emoji, payload.from, payload.to)
    })

    socket.on('room-not-found', (payload) => {
      errorHandler.handleRoomNotFound(payload.roomId)
      store.currentRoomId = ''
      store.players = []
      currentRoundId = ''
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

    socket.on('name-taken', (payload) => {
      errorHandler.handleNameTaken(payload.name, payload.roomId)
      store.currentPlayer = ''
      localStorage.removeItem('currentPlayer')
      store.setNeedNameModal(true)
      socket?.disconnect()
      store._socketConnected = false
      socket = null
    })

    socket.on('connect_error', (err: Error) => {
      errorHandler.handleSocketError(err, { roomId, name })
    })

    socket.on('error', (err: Error) => {
      errorHandler.handleSocketError(err, { roomId, name })
    })

    socket.io.on('reconnect_attempt', (attempt: number) => {
      reconnectAttempt = attempt
      errorHandler.handleReconnecting(attempt)
    })

    socket.io.on('reconnect_failed', () => {
      errorHandler.handleReconnectFailed()
    })
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

  store.emitVote = (card: CardValue) => {
    if (socket && store.currentRoomId && store.currentPlayer && currentRoundId) {
      socket.emit('vote', {
        roomId: store.currentRoomId,
        card,
        roundId: currentRoundId,
      })
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

  // @ts-expect-error - emitUnvote is dynamically added to the store
  store.emitUnvote = () => {
    if (socket && store.currentRoomId) {
      socket.emit('unvote', { roomId: store.currentRoomId })
    }
  }

  store.emitEmojiThrow = (to: string, emoji: string) => {
    if (socket && store.currentRoomId) {
      socket.emit('emoji-throw', {
        roomId: store.currentRoomId,
        to,
        emoji,
      })
    }
  }
})
