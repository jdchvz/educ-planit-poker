<template>
  <div
    v-for="impact in impacts"
    :key="impact.id"
    class="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
  >
    <div class="impact-ring" />
    <span class="impact-emoji text-4xl">{{ impact.emoji }}</span>
  </div>
</template>

<script setup lang="ts">
import type { EmojiImpact } from '../composables/useEmojiAnimation'

defineProps<{
  impacts: EmojiImpact[]
}>()
</script>

<style scoped>
.impact-emoji {
  position: absolute;
  animation: impact-pop 0.7s linear forwards;
  z-index: 51;
}

.impact-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid currentColor;
  animation: ring-expand 0.7s linear forwards;
  opacity: 0.6;
}

@keyframes impact-pop {
  0%   { transform: scale(0.2); opacity: 1; }
  40%  { transform: scale(1.8); opacity: 1; }
  70%  { transform: scale(1.3); opacity: 0.8; }
  100% { transform: scale(1.0); opacity: 0; }
}

@keyframes ring-expand {
  0%   { transform: scale(0.2); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}
</style>
