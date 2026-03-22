<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-2 flex-shrink-0">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">{{ siteStore.brandLogoLetter }}</span>
            </div>
            <span class="text-xl font-bold text-gray-900">{{ siteStore.brandName }}</span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-8">
            <NuxtLink
              to="/"
              class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
              active-class="text-primary-600"
            >
              首页
            </NuxtLink>
            <NuxtLink
              to="/products"
              class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
              active-class="text-primary-600"
            >
              全部商品
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="text-gray-600 hover:text-primary-600 transition-colors font-medium"
              active-class="text-primary-600"
            >
              品牌故事
            </NuxtLink>
          </nav>

          <!-- Search + Cart + User -->
          <div class="flex items-center space-x-4">
            <!-- Search -->
            <div class="hidden sm:block relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索商品..."
                class="w-48 lg:w-64 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                @keyup.enter="handleSearch"
              />
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <!-- Cart -->
            <NuxtLink to="/cart" class="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <span
                v-if="cartStore.totalCount > 0"
                class="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium"
              >
                {{ cartStore.totalCount > 99 ? '99+' : cartStore.totalCount }}
              </span>
            </NuxtLink>

            <!-- User -->
            <template v-if="authStore.isLoggedIn">
              <NuxtLink to="/account" class="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
                <div class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium">{{ userInitial }}</span>
                </div>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink
                to="/auth/login"
                class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                登录
              </NuxtLink>
            </template>

            <!-- Mobile Menu Toggle -->
            <button
              class="md:hidden p-2 text-gray-600"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  v-if="!mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="mobileMenuOpen" class="md:hidden pb-4 border-t border-gray-100 pt-3">
          <div class="mb-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索商品..."
              class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              @keyup.enter="handleSearch"
            />
          </div>
          <nav class="flex flex-col space-y-2">
            <NuxtLink
              to="/"
              class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
              @click="mobileMenuOpen = false"
            >
              首页
            </NuxtLink>
            <NuxtLink
              to="/products"
              class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
              @click="mobileMenuOpen = false"
            >
              全部商品
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
              @click="mobileMenuOpen = false"
            >
              品牌故事
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="md:col-span-1">
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">{{ siteStore.brandLogoLetter }}</span>
              </div>
              <span class="text-xl font-bold text-white">{{ siteStore.brandName }}</span>
            </div>
            <p class="text-sm text-gray-400 leading-relaxed">
              精选品质好物，打造美好生活。我们致力于为您提供最优质的购物体验。
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-white font-semibold mb-4">快速链接</h3>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/products" class="hover:text-white transition-colors">全部商品</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white transition-colors">品牌故事</NuxtLink></li>
              <li><NuxtLink to="/orders" class="hover:text-white transition-colors">我的订单</NuxtLink></li>
              <li><NuxtLink to="/account" class="hover:text-white transition-colors">个人中心</NuxtLink></li>
            </ul>
          </div>

          <!-- Customer Service -->
          <div>
            <h3 class="text-white font-semibold mb-4">客户服务</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">帮助中心</a></li>
              <li><a href="#" class="hover:text-white transition-colors">退换货政策</a></li>
              <li><a href="#" class="hover:text-white transition-colors">配送说明</a></li>
              <li><a href="#" class="hover:text-white transition-colors">隐私政策</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-white font-semibold mb-4">联系我们</h3>
            <ul class="space-y-2 text-sm">
              <li>客服热线：400-888-8888</li>
              <li>服务时间：9:00 - 21:00</li>
              <li>邮箱：support@brandstore.com</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {{ new Date().getFullYear() }} {{ siteStore.brandName }}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const cartStore = useCartStore()
const siteStore = useSiteStore()

const searchQuery = ref('')
const mobileMenuOpen = ref(false)

const userInitial = computed(() => {
  const name = authStore.user?.nickname || authStore.user?.phone || ''
  return name.charAt(0).toUpperCase() || 'U'
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo({ path: '/products', query: { q: searchQuery.value.trim() } })
    mobileMenuOpen.value = false
    searchQuery.value = ''
  }
}
</script>
