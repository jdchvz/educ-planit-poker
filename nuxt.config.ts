export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    public: {
      socketUrl: ''  // empty = same host
    }
  }
})