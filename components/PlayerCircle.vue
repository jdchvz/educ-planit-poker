<template>
  <div class="relative mx-auto" :style="containerStyle">
    <!-- Center Joker Card -->
    <div class="absolute joker-wrapper" :style="centerStyle">
      <img :src="jokerSrc" alt="Joker" class="joker-img" :style="jokerStyle" />
    </div>
    <!-- Player name circles -->
    <div
      v-for="(p,i) in players"
      :key="p"
      class="absolute name-circle"
      :style="positionStyle(i)"
    >
      <span class="label">{{ p }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoomStore } from '../stores/room'

interface Props {
  size?: number
  jokerSize?: number
  jokerSrc?: string
}
const props = defineProps<Props>()
const store = useRoomStore()
const players = computed(()=>store.players)

const size = computed(()=> props.size || 520)
const jokerSize = computed(()=> props.jokerSize || 120)
const jokerSrc = computed(()=> props.jokerSrc || 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Playing_card_joker_red.svg/240px-Playing_card_joker_red.svg.png')

const containerStyle = computed(()=>({ width: size.value+'px', height: size.value+'px' }))
const centerStyle = computed(()=>({ left: (size.value/2 - jokerSize.value/2)+'px', top: (size.value/2 - jokerSize.value/2)+'px' }))
const jokerStyle = computed(()=>({ width: jokerSize.value+'px', height: jokerSize.value+'px', objectFit: 'contain' }))

const positionStyle = (index:number) => {
  const total = players.value.length || 1
  const angle = (index / total) * Math.PI * 2 - Math.PI/2
  const radius = (size.value/2) - (jokerSize.value/2) - 50 // dynamic radius
  const badgeSize = 28 // approximate height center for circle
  const x = size.value/2 + radius * Math.cos(angle) - badgeSize/2
  const y = size.value/2 + radius * Math.sin(angle) - badgeSize/2
  return { left: x+'px', top: y+'px' }
}
</script>
<style scoped>
.relative { position: relative; }
.joker-wrapper { display:flex; align-items:center; justify-content:center; }
.joker-img { border-radius: 0.75rem; box-shadow: 0 6px 18px -2px rgba(0,0,0,.6); background: rgba(0,0,0,.3); }
.name-circle { width: 56px; height: 56px; display:flex; align-items:center; justify-content:center; border-radius:50%; }
.name-circle { backdrop-filter: blur(6px); background: rgba(15,30,51,0.55); box-shadow: 0 0 0 1px rgba(100,116,139,0.35), 0 4px 12px -3px rgba(0,0,0,.7); }
.label { color: #cbd5e1; font-size: 10px; line-height:1; padding:4px 8px; border-radius: 9999px; max-width:50px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
</style>
