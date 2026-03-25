import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: true as boolean,
  }),
  actions: {
    toggleTheme() {
      this.dark = !this.dark
    },
    setDark(value: boolean) {
      this.dark = value
    },
  },
})