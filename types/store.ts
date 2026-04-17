/**
 * Store type definitions
 */

import type { CardValue } from './room'

export interface RoomStoreState {
  players: string[]
  votes: Record<string, CardValue | '●' | null>
  revealed: boolean
  currentPlayer: string
  currentRoomId: string
  _socketConnected: boolean
  error: string
  errorRedirect: boolean
  isCreator: boolean
  needNameModal: boolean
  cardDeck: CardValue[]
}

export interface RoomStoreActions {
  init(): void
  vote(card: CardValue): void
  reveal(): void
  reset(): void
  addPlayer(name: string): void
  removePlayer(name: string): void
  startNewRoom(creatorName: string, deck?: CardValue[]): void
  setRoom(roomId: string): void
  setCardDeck(deck: CardValue[]): void
  setError(msg: string, redirect?: boolean): void
  setNeedNameModal(val: boolean): void
}

// Extended store with socket methods (added by plugins)
export interface ExtendedRoomStore {
  connectSocket?: (roomId: string, name: string) => void
  disconnectSocket?: (roomId: string) => void
  emitVote?: (card: CardValue) => void
  emitReveal?: () => void
  emitReset?: () => void
  emitEmojiThrow?: (to: string, emoji: string) => void
}
