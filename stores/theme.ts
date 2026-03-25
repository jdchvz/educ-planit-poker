import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: true,
  }),
  actions: {
    toggleTheme() {
      this.dark = !this.dark
      if (import.meta.client) {
        localStorage.setItem('theme', this.dark ? 'dark' : 'light')
      }
    },
    initTheme() {
      if (import.meta.client) {
        const stored = localStorage.getItem('theme')
        this.dark = stored === null ? true : stored !== 'light'
      }
    },
  },
})