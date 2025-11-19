import { Server } from 'socket.io'
import type { NitroApp } from 'nitropack'

interface PresencePayload { roomId: string; players: string[] }

const rooms: Record<string, Set<string>> = {}
const socketName: Record<string, { roomId: string; name: string }> = {}
let ioInstance: Server | null = null

export default (nitro: NitroApp) => {
  ;(nitro.hooks as any).hook('listen', (server: any) => {
    if(ioInstance){
      console.log('[socket.io] already initialized')
      return
    }
    const io = ioInstance = new Server(server, { path: '/socket.io', cors: { origin: '*'} })
    console.log('[socket.io] initialized')

    io.on('connection', (socket) => {
      console.log('[socket.io] connection', socket.id)
      socket.on('join-room', ({ roomId, name }: { roomId: string; name: string }) => {
        console.log('[socket.io] join-room', roomId, name)
        socket.join(roomId)
        socketName[socket.id] = { roomId, name }
        if(!rooms[roomId]) rooms[roomId] = new Set()
        rooms[roomId].add(name)
        io.to(roomId).emit('presence', { roomId, players: Array.from(rooms[roomId]) } as PresencePayload)
      })

      socket.on('leave-room', ({ roomId, name }: { roomId: string; name: string }) => {
        console.log('[socket.io] leave-room', roomId, name)
        const set = rooms[roomId]
        if(set){
          set.delete(name)
          io.to(roomId).emit('presence', { roomId, players: Array.from(set) })
        }
        delete socketName[socket.id]
        socket.leave(roomId)
      })

      socket.on('disconnect', () => {
        console.log('[socket.io] disconnect', socket.id)
        const info = socketName[socket.id]
        if(info){
          const set = rooms[info.roomId]
          if(set){
            set.delete(info.name)
            io.to(info.roomId).emit('presence', { roomId: info.roomId, players: Array.from(set) })
          }
          delete socketName[socket.id]
        }
      })
    })
  })
}
