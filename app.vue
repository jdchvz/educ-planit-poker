<template>
  <NuxtPage />
</template>

<script setup>
const themeStore = useThemeStore()
onMounted(() => themeStore.initTheme())
</script>