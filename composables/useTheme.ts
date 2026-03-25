import { useThemeStore } from '@/stores/theme'
import { computed } from 'vue'

export const useTheme = () => {
  const store = useThemeStore()

  return {
    dark: computed(() => store.dark),
    toggleTheme: store.toggleTheme,
  }
}