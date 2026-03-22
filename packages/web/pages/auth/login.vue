<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center space-x-2 mb-4">
          <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold">B</span>
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">欢迎回来</h1>
        <p class="text-gray-500 mt-1">登录您的账号</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="请输入手机号"
            maxlength="11"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
        </div>

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <button
          type="submit"
          class="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="text-center mt-6 text-sm text-gray-500">
        没有账号？
        <NuxtLink to="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
          去注册
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()

const form = reactive({
  phone: '',
  password: '',
})
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''

  if (!form.phone || !form.password) {
    errorMsg.value = '请填写手机号和密码'
    return
  }

  loading.value = true
  try {
    await authStore.login(form)
    const redirect = (route.query.redirect as string) || '/'
    navigateTo(redirect)
  } catch (err: any) {
    errorMsg.value = err?.data?.message || '登录失败，请检查手机号和密码'
  } finally {
    loading.value = false
  }
}
</script>
