<template>
  <div class="min-h-screen flex flex-col items-center pt-16 pb-24 bg-[#0f1e33] text-slate-200 font-sans">
    <div class="panel-header mb-14 w-[760px] max-w-full">
      GO Poker Planning
      <div class="mt-4 text-sm opacity-75 tracking-wide">Create or join an estimation room</div>
      <div class="mt-4 text-sm opacity-75 tracking-wide">Let the war begin!</div>
    </div>

    <div class="w-full max-w-xl space-y-8">
      <div class="bg-[#132a49] rounded-2xl border border-[#1d3554] px-8 py-8 shadow-lg shadow-black/40">
        <h2 class="text-lg font-semibold mb-6 tracking-wide">Your details</h2>
        <div class="space-y-5">
          <div>
            <label class="block text-xs uppercase font-semibold mb-2 tracking-wider text-slate-400">Name</label>
            <input v-model="playerName" placeholder="Enter your name" class="form-input" />
          </div>
          <div>
            <label class="block text-xs uppercase font-semibold mb-2 tracking-wider text-slate-400">Room ID (optional)</label>
            <input v-model="roomId" placeholder="Existing room id" class="form-input" />
          </div>
          <div class="flex gap-4 pt-2">
            <button @click="joinRoom" class='px-5 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-500 shadow-md btn-primary' :disabled="!playerName || !roomId">Join Room</button>
            <button @click="createRoom" class='px-5 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-500 shadow-md btn-accent' :disabled="!playerName">Create Room</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { useRoomStore } from '~/stores/room'
const router = useRouter()
const roomId = ref('')
const playerName = ref('')
const store = useRoomStore()
const joinRoom = () => {
  if(playerName.value){
    store.addPlayer(playerName.value)
    router.push(`/room/${roomId.value}`)
  }
}
const createRoom = () => {
  if(playerName.value){
    const newId = Math.random().toString(36).substring(2,8)
    store.startNewRoom(playerName.value)
    router.push(`/room/${newId}`)
    console.log('Room Created', newId)
  }
}
</script>
<style scoped>
.form-input{width:100%;background:#0f1e33;border:1px solid #2e4f70;border-radius:10px;padding:12px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border-color .15s,background .15s;}
.form-input:focus{border-color:#3b82f6;background:#173256;}
.btn-base{font-weight:600;font-size:14px;padding:12px 22px;border:none;border-radius:10px;cursor:pointer;letter-spacing:.4px;transition:background .15s,transform .15s,box-shadow .15s;display:inline-flex;align-items:center;gap:6px;}
.btn-primary{background:#0ea5e9;color:#fff;box-shadow:0 6px 20px -6px rgba(14,165,233,.55);}
.btn-primary:hover:not(:disabled){background:#0284c7;}
.btn-accent{background:#10b981;color:#fff;box-shadow:0 6px 20px -6px rgba(16,185,129,.55);}
.btn-accent:hover:not(:disabled){background:#059669;}
.btn-primary:active:not(:disabled),.btn-accent:active:not(:disabled){transform:translateY(1px);}
.btn-primary:disabled,.btn-accent:disabled{opacity:.4;cursor:not-allowed;}
</style>