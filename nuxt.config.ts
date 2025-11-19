export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      socketUrl: process.env.SOCKET_URL || 'http://localhost:4000'
    }
  },
  postcss: {
    plugins: {
  tailwindcss: {},
      autoprefixer: {},
    },
  },
})