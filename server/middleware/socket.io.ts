import { Server } from 'socket.io'

const rooms = new Map<string, Set<string>>()
const roomVotes = new Map<string, Map<string, string>>()
const roomDecks = new Map<string, (string | number)[]>()
const roomCreators = new Map<string, string>()
const socketMap = new Map<string, { roomId: string; name: string }>()
const roomRevealed = new Map<string, boolean>()
const roomRoundIds = new Map<string, string>()
const emojiThrottleMap = new Map<string, number>() // module-level so disconnect can clean it up

const DEFAULT_DECK = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

let ioInstance: Server | null = null

function generateRoundId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function getMaskedVotes(votes: Map<string, string>): Record<string, any> {
  return Object.fromEntries(
    Array.from(votes.entries()).map(([player, vote]) => [player, vote ? '●' : null])
  )
}

async function broadcastVotes(
  io: Server,
  roomId: string,
  roundId: string | undefined,
  votes: Map<string, string>,
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
            player === sInfo.name ? vote : (vote ? '●' : null),
          ])
        )
    s.emit('votes-sync', { roomId, roundId, votes: personalizedVotes })
  }
}

export default defineEventHandler((event) => {
  if (ioInstance) return

  const req = event.node.req
  // @ts-ignore
  const server = req.socket?.server
  if (!server) return

  const io = new Server(server, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    cors: { origin: '*', methods: ['GET', 'POST'] },
  })

  ioInstance = io

  io.on('connection', (socket) => {

    socket.on('create-room', ({ roomId, name, deck }: { roomId: string; name: string; deck: (string | number)[] }) => {
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
        roomDecks.set(roomId, Array.isArray(deck) ? deck : DEFAULT_DECK)
        roomCreators.set(roomId, socket.id)
        roomRevealed.set(roomId, false)
        roomRoundIds.set(roomId, generateRoundId())
      }
      socket.emit('room-created', { roomId })
    })

    socket.on('join-room', async ({ roomId, name }: { roomId: string; name: string }) => {
      if (!rooms.has(roomId)) {
        socket.emit('room-not-found', { roomId })
        return
      }
      const players = rooms.get(roomId)!
      if (players.has(name)) {
        socket.emit('name-taken', { roomId, name })
        return
      }
      socket.join(roomId)
      socketMap.set(socket.id, { roomId, name })
      players.add(name)
      if (!roomVotes.has(roomId)) roomVotes.set(roomId, new Map())

      const revealed = roomRevealed.get(roomId) ?? false
      const roundId = roomRoundIds.get(roomId) ?? generateRoundId()
      const votes = roomVotes.get(roomId)!

      io.to(roomId).emit('presence', { roomId, players: Array.from(players) })
      await broadcastVotes(io, roomId, roundId, votes, revealed)
      socket.emit('deck-sync', { roomId, deck: roomDecks.get(roomId) ?? DEFAULT_DECK })
    })

    socket.on('leave-room', async ({ roomId, name }: { roomId: string; name: string }) => {
      const info = socketMap.get(socket.id)
      if (!info || info.name !== name || info.roomId !== roomId) return

      rooms.get(roomId)?.delete(name)
      roomVotes.get(roomId)?.delete(name)
      socket.leave(roomId)
      socketMap.delete(socket.id)

      const remainingPlayers = rooms.get(roomId)
      if (!remainingPlayers || remainingPlayers.size === 0) {
        rooms.delete(roomId)
        roomVotes.delete(roomId)
        roomDecks.delete(roomId)
        roomCreators.delete(roomId)
        roomRevealed.delete(roomId)
        roomRoundIds.delete(roomId)
        return
      }

      const votes = roomVotes.get(roomId) ?? new Map()
      const revealed = roomRevealed.get(roomId) ?? false
      io.to(roomId).emit('presence', { roomId, players: Array.from(remainingPlayers) })
      await broadcastVotes(io, roomId, roomRoundIds.get(roomId), votes, revealed)
    })

    socket.on('vote', async ({ roomId, card, roundId }: { roomId: string; card: string; roundId: string }) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return
      if (roomRoundIds.get(roomId) !== roundId) return
      if (roomRevealed.get(roomId)) return

      const name = info.name
      if (!roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
      roomVotes.get(roomId)!.set(name, card)

      await broadcastVotes(io, roomId, roundId, roomVotes.get(roomId)!, false)
    })

    socket.on('reveal', async ({ roomId }: { roomId: string }) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return
      const roundId = roomRoundIds.get(roomId)
      roomRevealed.set(roomId, true)
      await broadcastVotes(io, roomId, roundId, roomVotes.get(roomId) ?? new Map(), true)
      io.to(roomId).emit('reveal-update', { roomId, roundId })
    })

    socket.on('reset', async ({ roomId }: { roomId: string }) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return
      const newRoundId = generateRoundId()
      roomRoundIds.set(roomId, newRoundId)
      roomVotes.set(roomId, new Map())
      roomRevealed.set(roomId, false)
      await broadcastVotes(io, roomId, newRoundId, new Map(), false)
      io.to(roomId).emit('reset-update', { roomId, roundId: newRoundId })
    })

    socket.on('emoji-throw', ({ roomId, to, emoji }: { roomId: string; to: string; emoji: string }) => {
      const info = socketMap.get(socket.id)
      if (!info || info.roomId !== roomId) return
      if (info.name === to) return
      if (typeof emoji !== 'string' || emoji.length > 10) return

      const now = Date.now()
      const last = emojiThrottleMap.get(socket.id) ?? 0
      if (now - last < 300) return
      emojiThrottleMap.set(socket.id, now)

      io.to(roomId).emit('emoji-throw', { from: info.name, to, emoji })
    })

    socket.on('disconnect', async () => {
      emojiThrottleMap.delete(socket.id)

      const info = socketMap.get(socket.id)
      if (!info) return
      const { roomId, name } = info

      rooms.get(roomId)?.delete(name)
      roomVotes.get(roomId)?.delete(name)
      socketMap.delete(socket.id)

      const remainingPlayers = rooms.get(roomId)
      if (!remainingPlayers || remainingPlayers.size === 0) {
        rooms.delete(roomId)
        roomVotes.delete(roomId)
        roomDecks.delete(roomId)
        roomCreators.delete(roomId)
        roomRevealed.delete(roomId)
        roomRoundIds.delete(roomId)
        return
      }

      const votes = roomVotes.get(roomId) ?? new Map()
      const revealed = roomRevealed.get(roomId) ?? false
      io.to(roomId).emit('presence', { roomId, players: Array.from(remainingPlayers) })
      await broadcastVotes(io, roomId, roomRoundIds.get(roomId), votes, revealed)
    })
  })
})