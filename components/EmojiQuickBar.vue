<template>
  <Transition name="quickbar">
    <div
      v-if="show"
      class="absolute -top-12 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-1 px-2 py-1.5 rounded-2xl shadow-xl border"
      :class="dark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'"
      @mouseenter="$emit('mouseenter')"
      @mouseleave="$emit('mouseleave')"
      @click.stop
    >
      <button
        v-for="emoji in quickEmojis"
        :key="emoji"
        class="text-xl w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100 hover:scale-125 cursor-pointer"
        :class="dark ? 'hover:bg-sky-500/20' : 'hover:bg-sky-100'"
        @click="$emit('throw', emoji)"
      >
        {{ emoji }}
      </button>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100 font-bold text-lg cursor-pointer"
        :class="dark ? 'text-slate-400 hover:text-sky-400 hover:bg-sky-500/20' : 'text-slate-500 hover:text-sky-500 hover:bg-sky-100'"
        @click.stop="$emit('openPicker')"
        title="More emojis"
      >
        +
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

defineProps<{
  show: boolean
}>()

defineEmits<{
  throw: [emoji: string]
  openPicker: []
  mouseenter: []
  mouseleave: []
}>()

const { dark } = useTheme()
const quickEmojis = ['🎯', '✈️', '🪨', '❤️', '🧻', '💩']
</script>

<style scoped>
.quickbar-enter-active,
.quickbar-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.quickbar-enter-from,
.quickbar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
