<template>
  <div>
    <h3 class='text-xl mb-2'>Players</h3>
    <ul>
      <li v-for='p in players' :key='p'>{{ p }}</li>
    </ul>
  </div>
</template>
<script setup>
const props = defineProps({ players: Array })
</script>