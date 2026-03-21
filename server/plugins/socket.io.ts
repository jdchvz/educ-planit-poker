import { Server } from 'socket.io'
import { defineNitroPlugin } from 'nitropack/runtime'

const rooms = new Map<string, Set<string>>()
const roomVotes = new Map<string, Map<string, string>>()
const socketMap = new Map<string, { roomId: string; name: string }>()

let ioInstance: Server | null = null

export default defineNitroPlugin((nitroApp) => {
  console.log('[socket.io] plugin loaded')

  const hooks = [
    'listen:node',
    'listen',
    'request',
  ]

  // Log all available hooks
  // @ts-ignore
  console.log('[socket.io] available hooks:', Object.keys(nitroApp.hooks._hooks || {}))

  // @ts-ignore
  nitroApp.hooks.hook('listen:node', ({ server }: { server: any }) => {
    console.log('[socket.io] listen:node fired, server:', !!server)
    initSocket(server)
  })

  // Fallback hook
  // @ts-ignore
  nitroApp.hooks.hook('listen', (listenerOrServer: any) => {
    console.log('[socket.io] listen fired:', typeof listenerOrServer)
    const server = listenerOrServer?.server || listenerOrServer
    if (server && !ioInstance) {
      initSocket(server)
    }
  })

  function initSocket(server: any) {
    if (ioInstance) {
      console.log('[socket.io] already initialized')
      return
    }

    if (!server) {
      console.error('[socket.io] no server provided!')
      return
    }

    try {
      const io = new Server(server, {
        path: '/socket.io',
        transports: ['polling', 'websocket'],
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      })

      ioInstance = io
      console.log('[socket.io] initialized successfully!')

      io.on('connection', (socket) => {
        console.log('[socket.io] connection', socket.id)

        socket.on('create-room', ({ roomId, name }: { roomId: string; name: string }) => {
          console.log('[socket.io] create-room', roomId, name)
          if (rooms.has(roomId)) {
            socket.emit('room-exists', { roomId })
          } else {
            rooms.set(roomId, new Set())
            roomVotes.set(roomId, new Map())
            socket.emit('room-created', { roomId })
          }
        })

        socket.on('join-room', ({ roomId, name }: { roomId: string; name: string }) => {
          console.log('[socket.io] join-room', roomId, name)
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
          console.log('[socket.io] leave-room', roomId, name)
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
          console.log('[socket.io] vote', roomId, name, card)
          if (!roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
          roomVotes.get(roomId)!.set(name, card)
          io.to(roomId).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)!) })
        })

        socket.on('reveal', ({ roomId }: { roomId: string }) => {
          console.log('[socket.io] reveal', roomId)
          io.to(roomId).emit('reveal-update', { roomId })
        })

        socket.on('reset', ({ roomId }: { roomId: string }) => {
          console.log('[socket.io] reset', roomId)
          if (roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
          io.to(roomId).emit('votes-sync', { roomId, votes: {} })
          io.to(roomId).emit('reset-update', { roomId })
        })

        socket.on('disconnect', () => {
          console.log('[socket.io] disconnect', socket.id)
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
    } catch (err) {
      console.error('[socket.io] failed to initialize:', err)
    }
  }
})
