export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  routeRules: {
    '/': { swr: 60 },
    '/products/**': { swr: 30 },
    '/categories/**': { swr: 30 },
    '/cart': { ssr: false },
    '/checkout': { ssr: false },
    '/orders/**': { ssr: false },
    '/account/**': { ssr: false },
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8788/api/v1',
      assetsUrl: 'http://localhost:8788',
    },
  },
  nitro: {
    preset: 'cloudflare-pages',
  },
  compatibilityDate: '2025-01-01',
})
