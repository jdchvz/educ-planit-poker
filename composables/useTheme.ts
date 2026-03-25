import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

export const useTheme = () => {
  const store = useThemeStore()
  const { dark } = storeToRefs(store)

  return {
    dark,
    toggleTheme: store.toggleTheme,
  }
}