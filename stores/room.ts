import { defineStore } from 'pinia'

const DEFAULT_DECK: (string | number)[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

const safeDeck = (val: any): (string | number)[] =>
  Array.isArray(val) && val.length > 0 ? val : [...DEFAULT_DECK]

export const useRoomStore = defineStore('room', {
  state: () => ({
    players: [] as string[],
    votes: {} as Record<string, any>,
    revealed: false,
    currentPlayer: '',
    currentRoomId: '',
    _socketConnected: false,
    error: '',
    errorRedirect: false,        // ← add this
    isCreator: false,
    needNameModal: false,
    cardDeck: [...DEFAULT_DECK] as (string | number)[],
  }),
  actions: {
    init() {
      let savedDeck: any = null
      try { savedDeck = JSON.parse(localStorage.getItem('cardDeck') || 'null') } catch { savedDeck = null }
      this.players = JSON.parse(localStorage.getItem('players') || '[]')
      this.votes = JSON.parse(localStorage.getItem('votes') || '{}')
      this.revealed = JSON.parse(localStorage.getItem('revealed') || 'false')
      this.currentPlayer = localStorage.getItem('currentPlayer') || ''
      this.cardDeck = safeDeck(savedDeck)
    },
    vote(card: any) {
      if (this.revealed) return
      ;(this as any).emitVote?.(card)
    },
    reveal() {
      this.revealed = true
      localStorage.setItem('revealed', JSON.stringify(this.revealed))
      ;(this as any).emitReveal?.()
    },
    reset() {
      this.votes = {}
      this.revealed = false
      localStorage.setItem('votes', JSON.stringify(this.votes))
      localStorage.setItem('revealed', JSON.stringify(this.revealed))
      ;(this as any).emitReset?.()
    },
    addPlayer(name: string) {
      if (!name) return
      this.currentPlayer = name
      localStorage.setItem('currentPlayer', name)
      if (!this.players.includes(name)) {
        this.players.push(name)
        localStorage.setItem('players', JSON.stringify(this.players))
      }
    },
    removePlayer(name: string) {
      const idx = this.players.indexOf(name)
      if (idx !== -1) {
        this.players.splice(idx, 1)
        localStorage.setItem('players', JSON.stringify(this.players))
      }
      if (this.currentPlayer === name) {
        this.currentPlayer = ''
        localStorage.removeItem('currentPlayer')
      }
    },
    startNewRoom(creatorName: string, deck: (string | number)[] = [...DEFAULT_DECK]) {
      this.players = []
      this.votes = {}
      this.revealed = false
      this.currentPlayer = ''
      this.isCreator = true
      this.cardDeck = safeDeck(deck)
      localStorage.setItem('players', JSON.stringify(this.players))
      localStorage.setItem('votes', JSON.stringify(this.votes))
      localStorage.setItem('revealed', JSON.stringify(this.revealed))
      localStorage.setItem('cardDeck', JSON.stringify(this.cardDeck))
      localStorage.removeItem('currentPlayer')
      this.addPlayer(creatorName)
    },
    setRoom(roomId: string) {
      this.currentRoomId = roomId
      if (!this.isCreator) {
        localStorage.removeItem('cardDeck')
        this.cardDeck = [...DEFAULT_DECK]
      }
    },
    setCardDeck(deck: any) {
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
  }
})

declare module 'pinia' {
  export interface PiniaCustomProperties {
    connectSocket?: (roomId: string, name: string) => void
    disconnectSocket?: (roomId: string) => void
    emitVote?: (card: any) => void
    emitReveal?: () => void
    emitReset?: () => void
  }
}