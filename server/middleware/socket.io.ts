import { Server } from 'socket.io'

const rooms = new Map<string, Set<string>>()
const roomVotes = new Map<string, Map<string, string>>()
const socketMap = new Map<string, { roomId: string; name: string }>()

let ioInstance: Server | null = null

export default defineEventHandler((event) => {
  // Skip if already initialized
  if (ioInstance) return

  const req = event.node.req
  // @ts-ignore
  const server = req.socket?.server

  if (!server) return

  const io = new Server(server, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  ioInstance = io

  io.on('connection', (socket) => {
    socket.on('create-room', ({ roomId, name }: { roomId: string; name: string }) => {
      if (rooms.has(roomId)) {
        socket.emit('room-exists', { roomId })
      } else {
        rooms.set(roomId, new Set())
        roomVotes.set(roomId, new Map())
        socket.emit('room-created', { roomId })
      }
    })

    socket.on('join-room', ({ roomId, name }: { roomId: string; name: string }) => {
      if (!rooms.has(roomId)) {
        socket.emit('room-not-found', { roomId })
        return
      }
      const existingSet = rooms.get(roomId)
      if (existingSet && existingSet.has(name)) {
        socket.emit('name-taken', { roomId, name })
        return
      }
      socket.join(roomId)
      socketMap.set(socket.id, { roomId, name })
      rooms.get(roomId)!.add(name)
      if (!roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
      io.to(roomId).emit('presence', { roomId, players: Array.from(rooms.get(roomId)!) })
      socket.emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)!) })
    })

    socket.on('leave-room', ({ roomId, name }: { roomId: string; name: string }) => {
      if (rooms.has(roomId)) {
        rooms.get(roomId)!.delete(name)
        io.to(roomId).emit('presence', { roomId, players: Array.from(rooms.get(roomId)!) })
      }
      if (roomVotes.has(roomId)) {
        roomVotes.get(roomId)!.delete(name)
        io.to(roomId).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)!) })
      }
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
      if (roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
      io.to(roomId).emit('votes-sync', { roomId, votes: {} })
      io.to(roomId).emit('reset-update', { roomId })
    })

    socket.on('disconnect', () => {
      const info = socketMap.get(socket.id)
      if (info) {
        const set = rooms.get(info.roomId)
        if (set) {
          set.delete(info.name)
          io.to(info.roomId).emit('presence', { roomId: info.roomId, players: Array.from(set) })
        }
        if (roomVotes.has(info.roomId)) {
          roomVotes.get(info.roomId)!.delete(info.name)
          io.to(info.roomId).emit('votes-sync', { roomId: info.roomId, votes: Object.fromEntries(roomVotes.get(info.roomId)!) })
        }
        socketMap.delete(socket.id)
      }
    })
  })
})