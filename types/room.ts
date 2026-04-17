/**
 * Room data type definitions
 */

export type CardValue = string | number

export interface RoomMeta {
  deck: CardValue[]
  creator: string
  creatorName: string
  revealed: boolean
  roundId: string
}

export interface RoomState {
  roomId: string
  players: Set<string>
  votes: Map<string, CardValue>
  meta: RoomMeta
}

export interface RoomData {
  roomId: string
  players: string[]
  votes: Record<string, CardValue>
  deck: CardValue[]
  creator: string
  revealed: boolean
  roundId: string
}
