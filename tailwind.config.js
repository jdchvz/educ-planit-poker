export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './stores/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0f1e33',
          800: '#132a49',
          700: '#1E3557'
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}