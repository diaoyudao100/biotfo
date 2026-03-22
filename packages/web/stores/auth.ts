import { defineStore } from 'pinia'

interface User {
  id: number
  phone: string
  nickname: string
  avatar_url: string | null
  role: string
  points: number
  level: number
}

interface LoginPayload {
  phone: string
  password: string
}

interface RegisterPayload {
  phone: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const tokenCookie = useCookie('access_token', { maxAge: 60 * 60 * 24 * 7 })
  const refreshCookie = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 30 })

  const token = computed(() => tokenCookie.value)
  const refreshTokenValue = computed(() => refreshCookie.value)
  const isLoggedIn = computed(() => !!tokenCookie.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setTokens(accessToken: string, refreshToken: string) {
    tokenCookie.value = accessToken
    refreshCookie.value = refreshToken
  }

  async function login(payload: LoginPayload) {
    const config = useRuntimeConfig()
    const data = await $fetch<{ user: User; token: string; refresh_token: string }>(
      '/auth/login',
      {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: payload,
      },
    )
    user.value = data.user
    setTokens(data.token, data.refresh_token)
    return data
  }

  async function register(payload: RegisterPayload) {
    const config = useRuntimeConfig()
    const data = await $fetch<{ user: User; token: string; refresh_token: string }>(
      '/auth/register',
      {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: payload,
      },
    )
    user.value = data.user
    setTokens(data.token, data.refresh_token)
    return data
  }

  async function fetchMe() {
    if (!tokenCookie.value) return
    const { api } = useApi()
    try {
      const data = await api<{ user: User }>('/auth/me')
      user.value = data.user
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    tokenCookie.value = null
    refreshCookie.value = null
  }

  return {
    user,
    token,
    refreshTokenValue,
    isLoggedIn,
    isAdmin,
    setTokens,
    login,
    register,
    fetchMe,
    logout,
  }
})
