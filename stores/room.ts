import { defineStore } from 'pinia'
import type { CardValue } from '../types/room'

const DEFAULT_DECK: CardValue[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

const safeDeck = (val: unknown): CardValue[] =>
  Array.isArray(val) && val.length > 0 ? val : [...DEFAULT_DECK]

export const useRoomStore = defineStore('room', {
  state: () => ({
    players: [] as string[],
    votes: {} as Record<string, CardValue | '●' | null>,
    revealed: false,
    currentPlayer: '',
    currentRoomId: '',
    _socketConnected: false,
    error: '',
    errorRedirect: false,
    isCreator: false,
    needNameModal: false,
    cardDeck: [...DEFAULT_DECK] as CardValue[],
  }),
  actions: {
    init() {
      // only restore what's needed for reconnection
      this.currentPlayer = localStorage.getItem('currentPlayer') || ''
      let savedDeck: unknown = null
      try { savedDeck = JSON.parse(localStorage.getItem('cardDeck') || 'null') } catch { savedDeck = null }
      this.cardDeck = safeDeck(savedDeck)
      // players/votes/revealed are always synced from server via socket
    },
    vote(card: CardValue) {
      if (this.revealed) return
      // @ts-expect-error - emitVote is added by socket plugin
      this.emitVote?.(card)
    },
    reveal() {
      // @ts-expect-error - emitReveal is added by socket plugin
      this.emitReveal?.()
    },
    reset() {
      // @ts-expect-error - emitReset is added by socket plugin
      this.emitReset?.()
    },
    clearVote() {
      // @ts-expect-error - emitUnvote is added by socket plugin
      this.emitUnvote?.()
    },
    addPlayer(name: string) {
      if (!name) return
      this.currentPlayer = name
      localStorage.setItem('currentPlayer', name)
    },
    removePlayer(name: string) {
      const idx = this.players.indexOf(name)
      if (idx !== -1) this.players.splice(idx, 1)
      if (this.currentPlayer === name) {
        this.currentPlayer = ''
        localStorage.removeItem('currentPlayer')
      }
    },
    startNewRoom(creatorName: string, deck: CardValue[] = [...DEFAULT_DECK], roomId: string) {
      this.players = []
      this.votes = {}
      this.revealed = false
      this.currentPlayer = ''
      this.isCreator = true
      this.cardDeck = safeDeck(deck)
      localStorage.setItem(`isCreator_${roomId}`, 'true')  // scoped
      localStorage.setItem('cardDeck', JSON.stringify(this.cardDeck))
      localStorage.removeItem('currentPlayer')
      this.addPlayer(creatorName)
    },
    setRoom(roomId: string) {
      this.currentRoomId = roomId
      this.isCreator = localStorage.getItem(`isCreator_${roomId}`) === 'true'  // scoped
      if (!this.isCreator) {
        localStorage.removeItem('cardDeck')
        this.cardDeck = [...DEFAULT_DECK]
      }
    },
    setCardDeck(deck: unknown) {
      this.cardDeck = safeDeck(deck)
      localStorage.setItem('cardDeck', JSON.stringify(this.cardDeck))
    },
    setError(msg: string, redirect = false) {
      this.error = msg
      this.errorRedirect = redirect
    },
    setNeedNameModal(val: boolean) {
      this.needNameModal = val
    },
  },
})

declare module 'pinia' {
  export interface PiniaCustomProperties {
    connectSocket?: (roomId: string, name: string) => void
    disconnectSocket?: (roomId: string) => void
    emitVote?: (card: CardValue) => void
    emitReveal?: () => void
    emitReset?: () => void
    emitEmojiThrow?: (to: string, emoji: string) => void
  }
}
