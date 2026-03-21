<template>
  <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-500" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/60 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4 z-10 px-4 text-center">
        <div class="text-6xl animate-bounce">🎉</div>
        <div class="text-2xl md:text-3xl font-bold text-white drop-shadow-lg tracking-wide">
          Yay! Everyone agreed!
        </div>
        <div class="text-4xl md:text-5xl font-extrabold text-sky-400 drop-shadow-lg animate-pulse">
          {{ agreedValue }}
        </div>
      </div>
      <div v-for="i in 40" :key="i" class="confetti-particle" :style="confettiStyle(i)"></div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{ show: boolean, agreedValue: any }>()

const confettiStyle = (i: number) => {
  const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c']
  const color = colors[i % colors.length]
  const left = `${Math.random() * 100}%`
  const delay = `${(i * 0.1) % 2}s`
  const duration = `${1.5 + (i % 3) * 0.5}s`
  return {
    position: 'fixed',
    top: '-10px',
    left,
    width: '8px',
    height: '8px',
    backgroundColor: color,
    borderRadius: i % 2 === 0 ? '50%' : '0',
    animation: `confettiFall ${duration} ${delay} ease-in forwards`,
  }
}
</script>