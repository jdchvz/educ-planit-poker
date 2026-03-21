<template>
  <div class="panel-header mb-6 md:mb-10 px-4">
    <h1 class="text-3xl md:text-4xl font-extrabold tracking-wide text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.6)] mb-1">
      Pick your cards!
    </h1>
    <div class="mt-4 text-xs tracking-wide opacity-70">Room: {{ roomId }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ roomId: string | string[] }>()
</script>