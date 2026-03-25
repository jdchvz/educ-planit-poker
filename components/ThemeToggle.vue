<template>
  <button
    @click="toggleTheme"
    class="fixed top-4 right-4 p-2 rounded-full border transition-colors duration-300"
    :class="dark
      ? 'border-slate-600 bg-[#132a49] hover:bg-[#1d3554] text-yellow-300'
      : 'border-slate-300 bg-white hover:bg-slate-200 text-slate-700'"
  >
    <span v-if="dark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>

<script setup>
const { dark, toggleTheme } = useTheme()
</script>