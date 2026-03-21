export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'], // make sure this exists
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    public: {
      socketUrl: ''
    }
  }
})