<template>
  <div>
    <h3 class='text-xl mb-2'>Votes</h3>
    <ul>
      <li v-for='(vote, player) in votes' :key='player'>
        {{ player }}: <span v-if='revealed'>{{ vote }}</span><span v-else>Hidden</span>
      </li>
    </ul>
  </div>
</template>
<script setup>
const props = defineProps({ votes: Object, revealed: Boolean })
</script>