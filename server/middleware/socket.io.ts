import { Server, Socket } from 'socket.io'
import { defineEventHandler } from 'h3'
import { roomStore } from '../utils/redis'
import type { CardValue } from '../../types/room'
import type {
  CreateRoomPayload,
  JoinRoomPayload,
  LeaveRoomPayload,
  VotePayload,
  RevealPayload,
  ResetPayload,
  UnvotePayload,
  EmojiThrowPayload,
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../types/socket'

// Track socket-to-player mapping in memory (ephemeral)
const socketMap = new Map<string, { roomId: string; name: string }>()
const emojiThrottleMap = new Map<string, number>()

const DEFAULT_DECK: CardValue[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

let ioInstance: Server<ClientToServerEvents, ServerToClientEvents> | null = null

/**
 * Generate a unique round ID
 */
function generateRoundId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Validate room ID format
 */
function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === 'string' && roomId.length > 0 && roomId.length <= 100
}

/**
 * Validate player name
 */
function isValidPlayerName(name: unknown): name is string {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 50
}

/**
 * Validate emoji string
 */
function isValidEmoji(emoji: unknown): emoji is string {
  return typeof emoji === 'string' && emoji.length > 0 && emoji.length <= 10
}

/**
 * Validate card value
 */
function isValidCard(card: unknown): card is CardValue {
  return typeof card === 'string' || typeof card === 'number'
}

/**
 * Broadcast votes to all sockets in a room with personalized visibility
 */
async function broadcastVotes(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomId: string,
  roundId: string,
  votes: Map<CardValue, CardValue>,
  revealed: boolean
) {
  const roomSockets = await io.in(roomId).fetchSockets()

  for (const s of roomSockets) {
    const sInfo = socketMap.get(s.id)
    if (!sInfo) continue

    const personalizedVotes = revealed
      ? Object.fromEntries(votes)
      : Object.fromEntries(
          Array.from(votes.entries()).map(([player, vote]) => [
            player,
            player === sInfo.name ? vote : (vote ? '●' as const : null),
          ])
        )

    s.emit('votes-sync', { roomId, roundId, votes: personalizedVotes })
  }
}

export default defineEventHandler((event) => {
  if (ioInstance) return

  const res = event.node.res
  // Access the HTTP server from the socket
  const server = (res?.socket as any)?.server
  if (!server) return

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingInterval: 25000,   // send ping every 25s
    pingTimeout: 60000,    // wait 60s before declaring disconnected
  })

  ioInstance = io

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {

    /**
     * Create a new room
     */
    socket.on('create-room', async ({ roomId, name, deck }: CreateRoomPayload) => {
      if (!isValidRoomId(roomId) || !isValidPlayerName(name)) return

      const exists = await roomStore.roomExists(roomId)
      if (!exists) {
        await roomStore.setMeta(roomId, {
          deck: Array.isArray(deck) && deck.length > 0 ? deck : DEFAULT_DECK,
          creator: socket.id,
          creatorName: name,
          revealed: false,
          roundId: generateRoundId(),
        })
      }

      socket.emit('room-created', { roomId })
    })

    /**
     * Join an existing room
     */
    socket.on('join-room', async ({ roomId, name }: JoinRoomPayload) => {
      if (!isValidRoomId(roomId) || !isValidPlayerName(name)) return

      const exists = await roomStore.roomExists(roomId)
      if (!exists) {
        socket.emit('room-not-found', { roomId })
        return
      }

      const hasPlayer = await roomStore.hasPlayer(roomId, name)
      if (hasPlayer) {
        // Check if any live socket is actually using this name
        const isActiveSocket = [...socketMap.values()].some(
          info => info.roomId === roomId && info.name === name
        )
        if (isActiveSocket) {
          socket.emit('name-taken', { roomId, name })
          return
        }
        // Stale entry from a dropped connection — clean it up and allow rejoin
        await roomStore.removePlayer(roomId, name)
        await roomStore.removeVote(roomId, name)
      }

      socket.join(roomId)
      socketMap.set(socket.id, { roomId, name })
      await roomStore.addPlayer(roomId, name)

      const meta = await roomStore.getMeta(roomId)
      const players = await roomStore.getPlayers(roomId)
      const votes = await roomStore.getAllVotes(roomId)

      io.to(roomId).emit('presence', { roomId, players })
      await broadcastVotes(io, roomId, meta?.roundId ?? '', votes, meta?.revealed ?? false)
      socket.emit('deck-sync', { roomId, deck: meta?.deck ?? DEFAULT_DECK })
    })

    /**
     * Leave a room
     */
    socket.on('leave-room', async ({ roomId, name }: LeaveRoomPayload) => {
      const info = socketMap.get(socket.id)
      if (!info || info.name !== name || info.roomId !== roomId) return

      await roomStore.removePlayer(roomId, name)
      await roomStore.removeVote(roomId, name)
      socket.leave(roomId)
      socketMap.delete(socket.id)

      const playerCount = await roomStore.getPlayerCount(roomId)
      if (playerCount === 0) {
        await roomStore.deleteRoom(roomId)
        return
      }

      const players = await roomStore.getPlayers(roomId)
      const votes = await roomStore.getAllVotes(roomId)
      const meta = await roomStore.getMeta(roomId)

      io.to(roomId).emit('presence', { roomId, players })
      await broadcastVotes(io, roomId, meta?.roundId ?? '', votes, meta?.revealed ?? false)
    })

    /**
     * Submit a vote
     */
    socket.on('vote', async ({ roomId, card, roundId }: VotePayload) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return
      if (!isValidCard(card)) return

      const meta = await roomStore.getMeta(roomId)
      if (!meta) return
      if (meta.roundId !== roundId) return
      if (meta.revealed) return

      await roomStore.setVote(roomId, info.name, card)
      const votes = await roomStore.getAllVotes(roomId)

      await broadcastVotes(io, roomId, roundId, votes, false)
    })

    /**
     * Reveal all votes
     */
    socket.on('reveal', async ({ roomId }: RevealPayload) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return

      const meta = await roomStore.getMeta(roomId)
      if (!meta) return
      if (info.name !== meta.creatorName) return

      await roomStore.updateMeta(roomId, { revealed: true })
      const votes = await roomStore.getAllVotes(roomId)

      await broadcastVotes(io, roomId, meta.roundId, votes, true)
      io.to(roomId).emit('reveal-update', { roomId, roundId: meta.roundId })
    })

    /**
     * Reset voting round
     */
    socket.on('reset', async ({ roomId }: ResetPayload) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return

      const meta = await roomStore.getMeta(roomId)
      if (!meta || info.name !== meta.creatorName) return

      const newRoundId = generateRoundId()
      await roomStore.updateMeta(roomId, { revealed: false, roundId: newRoundId })
      await roomStore.clearVotes(roomId)

      await broadcastVotes(io, roomId, newRoundId, new Map(), false)
      io.to(roomId).emit('reset-update', { roomId, roundId: newRoundId })
    })

    /**
     * Clear the current player's own vote
     */
    socket.on('unvote', async ({ roomId }: UnvotePayload) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return

      const meta = await roomStore.getMeta(roomId)
      if (!meta || meta.revealed) return

      await roomStore.removeVote(roomId, info.name)
      const votes = await roomStore.getAllVotes(roomId)
      await broadcastVotes(io, roomId, meta.roundId, votes, false)
    })

    /**
     * Throw emoji to another player
     */
    socket.on('emoji-throw', ({ roomId, to, emoji }: EmojiThrowPayload) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return
      if (info.name === to) return
      if (!isValidEmoji(emoji)) return

      // Throttle emoji throws to 300ms
      const now = Date.now()
      const last = emojiThrottleMap.get(socket.id) ?? 0
      if (now - last < 300) return
      emojiThrottleMap.set(socket.id, now)

      io.to(roomId).emit('emoji-throw', { from: info.name, to, emoji })
    })

    /**
     * Handle disconnect
     */
    socket.on('disconnect', async () => {
      emojiThrottleMap.delete(socket.id)

      const info = socketMap.get(socket.id)
      if (!info) return

      const { roomId, name } = info

      await roomStore.removePlayer(roomId, name)
      await roomStore.removeVote(roomId, name)
      socketMap.delete(socket.id)

      const playerCount = await roomStore.getPlayerCount(roomId)
      if (playerCount === 0) {
        await roomStore.deleteRoom(roomId)
        return
      }

      const players = await roomStore.getPlayers(roomId)
      const votes = await roomStore.getAllVotes(roomId)
      const meta = await roomStore.getMeta(roomId)

      io.to(roomId).emit('presence', { roomId, players })
      await broadcastVotes(io, roomId, meta?.roundId ?? '', votes, meta?.revealed ?? false)
    })
  })
})
