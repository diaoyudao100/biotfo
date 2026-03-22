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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://biotfo-worker.diaoyudao110.workers.dev/api/v1',
      assetsUrl: process.env.NUXT_PUBLIC_ASSETS_URL || 'https://biotfo-worker.diaoyudao110.workers.dev',
    },
  },
  nitro: {
    preset: 'cloudflare-pages',
  },
  compatibilityDate: '2025-01-01',
})
