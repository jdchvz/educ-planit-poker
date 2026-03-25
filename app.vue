<template>
  <NuxtPage />
</template>

<script setup>
const themeStore = useThemeStore()

onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored !== null) {
    themeStore.setDark(stored !== 'light')
  }
})
</script>