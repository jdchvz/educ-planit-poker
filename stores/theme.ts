import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: true as boolean,
  }),
  actions: {
    toggleTheme() {
      this.dark = !this.dark
      if (import.meta.client) {
        localStorage.setItem('theme', this.dark ? 'dark' : 'light')
      }
    },
    setDark(value: boolean) {
      this.dark = value
      if (import.meta.client) {
        localStorage.setItem('theme', value ? 'dark' : 'light')
      }
    },
  },
})