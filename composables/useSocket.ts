import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export default function useSocket() {
  if (import.meta.server) return null // don't run on server

  if (!socket) {
    socket = io({
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[socket] connected', socket?.id)
    })

    socket.on('connect_error', (err) => {
      console.error('[socket] connect_error', err.message)
    })

    socket.on('disconnect', (reason) => {
      console.warn('[socket] disconnected', reason)
    })
  }

  return socket
}