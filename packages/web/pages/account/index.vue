<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>

    <!-- User Info Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
          {{ userInitial }}
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ authStore.user?.nickname || '用户' }}
          </h2>
          <p class="text-sm text-gray-500">{{ authStore.user?.phone }}</p>
          <div class="flex items-center gap-4 mt-2 text-sm">
            <span class="text-primary-600">
              会员等级 Lv.{{ authStore.user?.level || 1 }}
            </span>
            <span class="text-gray-400">|</span>
            <span class="text-gray-600">
              积分 {{ authStore.user?.points || 0 }}
            </span>
          </div>
        </div>
        <button
          class="text-sm text-gray-500 hover:text-red-500 transition-colors"
          @click="handleLogout"
        >
          退出登录
        </button>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <NuxtLink
        to="/orders?status=pending"
        class="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
      >
        <div class="w-10 h-10 mx-auto mb-2 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="text-xs text-gray-600">待付款</span>
      </NuxtLink>
      <NuxtLink
        to="/orders?status=paid"
        class="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
      >
        <div class="w-10 h-10 mx-auto mb-2 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <span class="text-xs text-gray-600">待发货</span>
      </NuxtLink>
      <NuxtLink
        to="/orders?status=shipped"
        class="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
      >
        <div class="w-10 h-10 mx-auto mb-2 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </div>
        <span class="text-xs text-gray-600">待收货</span>
      </NuxtLink>
      <NuxtLink
        to="/orders"
        class="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
      >
        <div class="w-10 h-10 mx-auto mb-2 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span class="text-xs text-gray-600">全部订单</span>
      </NuxtLink>
    </div>

    <!-- Management Menu -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <NuxtLink
        to="/account/addresses"
        class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-gray-900">地址管理</span>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
      <button
        class="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left"
        @click="showPasswordModal = true"
      >
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span class="text-gray-900">修改密码</span>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Password Modal -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showPasswordModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">修改密码</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">当前密码</label>
            <input v-model="passwordForm.old_password" type="password" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">新密码</label>
            <input v-model="passwordForm.new_password" type="password" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">确认新密码</label>
            <input v-model="passwordForm.confirm_password" type="password" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            @click="showPasswordModal = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="changePassword"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { api } = useApi()

const showPasswordModal = ref(false)
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const userInitial = computed(() => {
  const name = authStore.user?.nickname || authStore.user?.phone || ''
  return name.charAt(0).toUpperCase() || 'U'
})

onMounted(() => {
  authStore.fetchMe()
})

function handleLogout() {
  if (confirm('确定退出登录吗？')) {
    authStore.logout()
    navigateTo('/')
  }
}

async function changePassword() {
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    alert('两次输入的密码不一致')
    return
  }
  if (passwordForm.new_password.length < 6) {
    alert('密码不能少于 6 位')
    return
  }
  try {
    await api('/auth/password', {
      method: 'PUT',
      body: {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      },
    })
    alert('密码修改成功')
    showPasswordModal.value = false
    Object.assign(passwordForm, { old_password: '', new_password: '', confirm_password: '' })
  } catch {
    alert('密码修改失败')
  }
}
</script>
