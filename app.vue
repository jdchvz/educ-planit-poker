<template>
  <NuxtPage />
</template>

<script setup>
const themeStore = useThemeStore()

// runs once on every page load/navigation — syncs localStorage → Pinia
onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored === null) {
    // first visit — set dark as default
    themeStore.setDark(true)
  } else {
    themeStore.setDark(stored === 'dark')
  }
})
</script>