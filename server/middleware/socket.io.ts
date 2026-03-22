import { Server } from 'socket.io'

const rooms = new Map<string, Set<string>>()
const roomVotes = new Map<string, Map<string, string>>()
const roomDecks = new Map<string, (string | number)[]>()
const socketMap = new Map<string, { roomId: string; name: string }>()

const DEFAULT_DECK = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

let ioInstance: Server | null = null

export default defineEventHandler((event) => {
  if (ioInstance) return

  const req = event.node.req
  // @ts-ignore
  const server = req.socket?.server
  if (!server) return

  const io = new Server(server, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  ioInstance = io

  io.on('connection', (socket) => {

    socket.on('create-room', ({ roomId, name, deck }: { roomId: string; name: string; deck: (string | number)[] }) => {
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
        roomDecks.set(roomId, Array.isArray(deck) ? deck : DEFAULT_DECK)
      }
      socket.emit('room-created', { roomId })
    })

    socket.on('join-room', ({ roomId, name }: { roomId: string; name: string }) => {
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
      io.to(roomId).emit('presence', { roomId, players: Array.from(players) })
      socket.emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)!) })
      socket.emit('deck-sync', { roomId, deck: roomDecks.get(roomId) ?? DEFAULT_DECK })
    })

    socket.on('leave-room', ({ roomId, name }: { roomId: string; name: string }) => {
      rooms.get(roomId)?.delete(name)
      roomVotes.get(roomId)?.delete(name)
      io.to(roomId).emit('presence', { roomId, players: Array.from(rooms.get(roomId) ?? []) })
      io.to(roomId).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId) ?? new Map()) })
      socket.leave(roomId)
      socketMap.delete(socket.id)
    })

    socket.on('vote', ({ roomId, name, card }: { roomId: string; name: string; card: string }) => {
      if (!roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
      roomVotes.get(roomId)!.set(name, card)
      io.to(roomId).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)!) })
    })

    socket.on('reveal', ({ roomId }: { roomId: string }) => {
      io.to(roomId).emit('reveal-update', { roomId })
    })

    socket.on('reset', ({ roomId }: { roomId: string }) => {
      roomVotes.set(roomId, new Map())
      io.to(roomId).emit('votes-sync', { roomId, votes: {} })
      io.to(roomId).emit('reset-update', { roomId })
    })

    socket.on('disconnect', () => {
      const info = socketMap.get(socket.id)
      if (!info) return
      const { roomId, name } = info
      rooms.get(roomId)?.delete(name)
      roomVotes.get(roomId)?.delete(name)
      io.to(roomId).emit('presence', { roomId, players: Array.from(rooms.get(roomId) ?? []) })
      io.to(roomId).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId) ?? new Map()) })
      socketMap.delete(socket.id)
    })
  })
})