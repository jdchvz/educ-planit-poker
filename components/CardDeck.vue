<template>
  <div class="text-center w-full">
    <h3 class="text-base md:text-lg mb-4 md:mb-5 font-medium tracking-wide">Choose your card 👇</h3>
    <div class="flex flex-wrap gap-3 md:gap-4 justify-center">
      <button v-for="card in cards" :key="card" @click="emit('vote', card)" class="fib-card"
        :disabled="revealed"
        :class="{ active: currentVote === card, 'opacity-40 cursor-not-allowed': revealed }">
        {{ card }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  cards: any[]
  revealed: boolean
  currentVote: any
}>()

const emit = defineEmits<{ (e: 'vote', card: any): void }>()
</script>