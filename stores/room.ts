import { defineStore } from 'pinia'
export const useRoomStore = defineStore('room', {
  state: () => ({ players: [] as string[], votes: {} as Record<string, any>, revealed: false, currentPlayer: '', currentRoomId: '', _socketConnected: false, error: '', isCreator: false, needNameModal: false, errorRedirect: false }),
  actions: {
    init() {
      const savedPlayers = JSON.parse(localStorage.getItem('players') || '[]')
      const savedVotes = JSON.parse(localStorage.getItem('votes') || '{}')
      const savedRevealed = JSON.parse(localStorage.getItem('revealed') || 'false')
      const savedCurrent = localStorage.getItem('currentPlayer') || ''
      this.players = savedPlayers
      this.votes = savedVotes
      this.revealed = savedRevealed
      this.currentPlayer = savedCurrent
    },
    vote(card) {
      if(this.revealed) return // prevent changing vote after reveal
      const name = this.currentPlayer || 'You'
      if((this as any).emitVote){ (this as any).emitVote(card) }
    },
    reveal() {
      this.revealed = true
      localStorage.setItem('revealed', JSON.stringify(this.revealed))
      if((this as any).emitReveal){ (this as any).emitReveal() }
    },
    reset() {
      this.votes = {}
      this.revealed = false
      localStorage.setItem('votes', JSON.stringify(this.votes))
      localStorage.setItem('revealed', JSON.stringify(this.revealed))
      if((this as any).emitReset){ (this as any).emitReset() }
    },
    addPlayer(name) {
      if(!name) return
      this.currentPlayer = name
      localStorage.setItem('currentPlayer', name)
      if(!this.players.includes(name)){
        this.players.push(name)
        localStorage.setItem('players', JSON.stringify(this.players))
      }
    },
    removePlayer(name){
      const idx = this.players.indexOf(name)
      if(idx !== -1){
        this.players.splice(idx,1)
        localStorage.setItem('players', JSON.stringify(this.players))
      }
      if(this.currentPlayer === name){
        this.currentPlayer = ''
        localStorage.removeItem('currentPlayer')
      }
    },
    startNewRoom(creatorName:string){
      this.players = []
      this.votes = {}
      this.revealed = false
      this.currentPlayer = ''
      this.isCreator = true
      localStorage.setItem('players', JSON.stringify(this.players))
      localStorage.setItem('votes', JSON.stringify(this.votes))
      localStorage.setItem('revealed', JSON.stringify(this.revealed))
      localStorage.removeItem('currentPlayer')
      this.addPlayer(creatorName)
    },
    setRoom(roomId:string){
      this.currentRoomId = roomId
    }
    ,setError(message:string){
      this.error = message
    }
    ,setNeedNameModal(v:boolean){
      this.needNameModal = v
    }
    ,setErrorRedirect(v:boolean){
      this.errorRedirect = v
    }
  }
})

declare module 'pinia' {
  export interface PiniaCustomProperties {
    connectSocket?: (roomId: string, name: string) => void
    disconnectSocket?: (roomId: string) => void
    emitVote?: (card: any) => void
    emitReveal?: () => void
    emitReset?: () => void
  }
}