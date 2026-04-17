/**
 * Socket.io event type definitions
 */

import type { CardValue } from './room'

// Client -> Server events
export interface CreateRoomPayload {
  roomId: string
  name: string
  deck: CardValue[]
}

export interface JoinRoomPayload {
  roomId: string
  name: string
}

export interface LeaveRoomPayload {
  roomId: string
  name: string
}

export interface VotePayload {
  roomId: string
  card: CardValue
  roundId: string
}

export interface RevealPayload {
  roomId: string
}

export interface ResetPayload {
  roomId: string
}

export interface UnvotePayload {
  roomId: string
}

export interface EmojiThrowPayload {
  roomId: string
  to: string
  emoji: string
}

// Server -> Client events
export interface RoomCreatedPayload {
  roomId: string
}

export interface PresencePayload {
  roomId: string
  players: string[]
}

export interface VotesSyncPayload {
  roomId: string
  roundId: string
  votes: Record<string, CardValue | '●' | null>
}

export interface RevealUpdatePayload {
  roomId: string
  roundId: string
}

export interface ResetUpdatePayload {
  roomId: string
  roundId: string
}

export interface DeckSyncPayload {
  roomId: string
  deck: CardValue[]
}

export interface EmojiThrowBroadcastPayload {
  from: string
  to: string
  emoji: string
}

export interface RoomNotFoundPayload {
  roomId: string
}

export interface NameTakenPayload {
  roomId: string
  name: string
}

// Socket event map for type-safe event handling
export interface ServerToClientEvents {
  'room-created': (payload: RoomCreatedPayload) => void
  'presence': (payload: PresencePayload) => void
  'votes-sync': (payload: VotesSyncPayload) => void
  'reveal-update': (payload: RevealUpdatePayload) => void
  'reset-update': (payload: ResetUpdatePayload) => void
  'deck-sync': (payload: DeckSyncPayload) => void
  'emoji-throw': (payload: EmojiThrowBroadcastPayload) => void
  'room-not-found': (payload: RoomNotFoundPayload) => void
  'name-taken': (payload: NameTakenPayload) => void
  'connect_error': (error: Error) => void
  'error': (error: Error) => void
}

export interface ClientToServerEvents {
  'create-room': (payload: CreateRoomPayload) => void
  'join-room': (payload: JoinRoomPayload) => void
  'leave-room': (payload: LeaveRoomPayload) => void
  'vote': (payload: VotePayload) => void
  'reveal': (payload: RevealPayload) => void
  'reset': (payload: ResetPayload) => void
  'unvote': (payload: UnvotePayload) => void
  'emoji-throw': (payload: EmojiThrowPayload) => void
}
