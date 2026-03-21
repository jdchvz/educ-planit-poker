export default defineNuxtConfig({
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    public: {
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || ''
    }
  }
})