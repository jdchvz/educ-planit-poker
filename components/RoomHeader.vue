<template>
  <div class="panel-header mb-6 md:mb-10 px-4">
    <h1
      class="text-3xl md:text-4xl font-extrabold tracking-wide mb-1 transition-colors duration-300"
      :class="dark
        ? 'text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.6)]'
        : 'text-slate-900'"
    >
      Pick your cards!
    </h1>
    <div
      class="mt-4 text-xs tracking-wide opacity-70 transition-colors duration-300"
      :class="dark ? 'text-slate-300' : 'text-slate-600'"
    >
      Room: {{ roomId }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

defineProps<{ roomId: string | string[] }>()
const { dark } = useTheme()
</script>