<template>
  <div class="panel-header mb-14 w-[760px] max-w-full">
    <h1
      class="text-4xl font-extrabold tracking-wide mb-1 transition-colors duration-300"
      :class="dark ? 'text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.6)]' : 'text-slate-900'"
    >
      Education Poker Planning
    </h1>
    <div
      class="mt-4 text-sm opacity-75 tracking-wide"
      :class="dark ? 'text-slate-300' : 'text-slate-600'"
    >
      Create or join an estimation room
    </div>
    <div
      class="mt-2 text-sm opacity-75 tracking-wide"
      :class="dark ? 'text-slate-300' : 'text-slate-600'"
    >
      Let the war begin!
    </div>
  </div>
</template>

<script setup>
const { dark } = useTheme()
</script>