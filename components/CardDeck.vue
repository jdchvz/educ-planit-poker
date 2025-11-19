<template>
  <div class='flex gap-2'>
    <button v-for='card in cards' :key='card' @click='$emit("vote", card)' class='border px-4 py-2'>{{ card }}</button>
  </div>
</template>
<script setup>
const cards = [0,1,2,3,5,8,13,21,'?']
</script>