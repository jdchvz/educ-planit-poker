#!/usr/bin/env node
const { Server } = require('socket.io')
const http = require('http')

const server = http.createServer()
const io = new Server(server, { cors: { origin: '*' } })

const rooms = new Map() // roomId => Set(names)
const roomVotes = new Map() // roomId => Map(name -> card)
const socketMap = new Map() // socketId => { roomId, name }

io.on('connection', (socket) => {
  console.log('[socket] connected', socket.id)
  socket.on('create-room', ({ roomId, name }) => {
    console.log('[socket] create-room', roomId, name)
    if(rooms.has(roomId)){
      // already exists; treat as join
      socket.emit('room-exists', { roomId })
    } else {
      rooms.set(roomId, new Set())
      roomVotes.set(roomId, new Map())
    }
    // Auto join creator after creation
    socket.emit('room-created', { roomId })
  })
  socket.on('join-room', ({ roomId, name }) => {
    console.log('[socket] join-room', roomId, name)
    // If room does not exist -> error
    if(!rooms.has(roomId)){
      io.to(socket.id).emit('room-not-found', { roomId })
      return
    }
    // Duplicate name check
    const existingSet = rooms.get(roomId)
    if(existingSet && existingSet.has(name)){
      io.to(socket.id).emit('name-taken', { roomId, name })
      return
    }
    socket.join(roomId)
    socketMap.set(socket.id, { roomId, name })
    rooms.get(roomId).add(name)
    if(!roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
    io.to(roomId).emit('presence', { roomId, players: Array.from(rooms.get(roomId)) })
    io.to(socket.id).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)) })
  })

  socket.on('leave-room', ({ roomId, name }) => {
    console.log('[socket] leave-room', roomId, name)
    if(rooms.has(roomId)){
      rooms.get(roomId).delete(name)
      io.to(roomId).emit('presence', { roomId, players: Array.from(rooms.get(roomId)) })
    }
    if(roomVotes.has(roomId)){
      roomVotes.get(roomId).delete(name)
      io.to(roomId).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)) })
    }
    socket.leave(roomId)
    socketMap.delete(socket.id)
  })

  socket.on('disconnect', () => {
    const info = socketMap.get(socket.id)
    if(info){
      const set = rooms.get(info.roomId)
      if(set){
        set.delete(info.name)
        io.to(info.roomId).emit('presence', { roomId: info.roomId, players: Array.from(set) })
      }
      if(roomVotes.has(info.roomId)){
        roomVotes.get(info.roomId).delete(info.name)
        io.to(info.roomId).emit('votes-sync', { roomId: info.roomId, votes: Object.fromEntries(roomVotes.get(info.roomId)) })
      }
    }
    socketMap.delete(socket.id)
    console.log('[socket] disconnected', socket.id)
  })

  // Voting events
  socket.on('vote', ({ roomId, name, card }) => {
    console.log('[socket] vote', roomId, name, card)
  if(!roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
  roomVotes.get(roomId).set(name, card)
  io.to(roomId).emit('votes-sync', { roomId, votes: Object.fromEntries(roomVotes.get(roomId)) })
  })
  socket.on('reveal', ({ roomId }) => {
    console.log('[socket] reveal', roomId)
    io.to(roomId).emit('reveal-update', { roomId })
  })
  socket.on('reset', ({ roomId }) => {
    console.log('[socket] reset', roomId)
  if(roomVotes.has(roomId)) roomVotes.set(roomId, new Map())
  io.to(roomId).emit('votes-sync', { roomId, votes: {} })
  io.to(roomId).emit('reset-update', { roomId })
  })
})

const PORT = process.env.SOCKET_PORT || 4000
server.listen(PORT, () => console.log(`Socket server listening on ${PORT}`))
