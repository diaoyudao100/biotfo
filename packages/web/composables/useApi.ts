export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  async function api<T>(
    url: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBase,
        ...options,
        headers,
      })
    } catch (error: any) {
      // 401 Unauthorized - try refresh token
      if (error?.response?.status === 401 && authStore.refreshTokenValue) {
        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = attemptRefresh()
        }

        const refreshed = await refreshPromise
        isRefreshing = false
        refreshPromise = null

        if (refreshed) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${authStore.token}`
          return await $fetch<T>(url, {
            baseURL: config.public.apiBase,
            ...options,
            headers,
          })
        } else {
          authStore.logout()
          navigateTo('/auth/login')
          throw error
        }
      }

      throw error
    }
  }

  async function attemptRefresh(): Promise<boolean> {
    try {
      const res = await $fetch<{
        success: boolean
        data: { access_token: string; refresh_token: string }
      }>('/auth/refresh', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: { refresh_token: authStore.refreshTokenValue },
      })
      authStore.setTokens(res.data.access_token, res.data.refresh_token)
      return true
    } catch {
      return false
    }
  }

  return { api }
}
