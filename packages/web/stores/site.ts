import { defineStore } from 'pinia'

export const useSiteStore = defineStore('site', () => {
  const brandName = ref('BrandStore')
  const brandLogoLetter = ref('B')
  const brandLogoUrl = ref('')
  const loaded = ref(false)

  async function fetchSettings() {
    if (loaded.value) return
    const config = useRuntimeConfig()
    try {
      const res = await $fetch<{ success: boolean; data: Record<string, string> }>(
        '/settings',
        { baseURL: config.public.apiBase },
      )
      if (res.data) {
        if (res.data.brand_name) brandName.value = res.data.brand_name
        if (res.data.brand_logo_letter) brandLogoLetter.value = res.data.brand_logo_letter
        if (res.data.brand_logo_url) brandLogoUrl.value = res.data.brand_logo_url
      }
      loaded.value = true
    } catch {
      // 静默失败，使用默认值
    }
  }

  return {
    brandName,
    brandLogoLetter,
    brandLogoUrl,
    loaded,
    fetchSettings,
  }
})
