<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Top Bar -->
    <header class="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-14">
      <div class="flex items-center justify-between h-full px-4">
        <div class="flex items-center space-x-3">
          <button class="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded" @click="sidebarOpen = !sidebarOpen">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <NuxtLink to="/admin" class="flex items-center space-x-2">
            <div v-if="siteStore.brandLogoUrl" class="w-7 h-7 rounded overflow-hidden flex-shrink-0">
              <img :src="siteStore.brandLogoUrl" alt="Logo" class="w-full h-full object-contain" />
            </div>
            <div v-else class="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center">
              <span class="text-white font-bold text-xs">{{ siteStore.brandLogoLetter }}</span>
            </div>
            <span class="font-bold text-gray-900">{{ siteStore.brandName }}</span>
            <span class="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">管理后台</span>
          </NuxtLink>
        </div>
        <div class="flex items-center space-x-3">
          <NuxtLink to="/" target="_blank" class="text-sm text-gray-500 hover:text-indigo-600">访问前台</NuxtLink>
          <button @click="handleLogout" class="text-sm text-gray-500 hover:text-red-600">退出</button>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-14 left-0 bottom-0 w-56 bg-white border-r border-gray-200 z-40 transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <nav class="p-3 space-y-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path)
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          @click="sidebarOpen = false"
        >
          <span v-html="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/30 z-30 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Main -->
    <main class="pt-14 lg:pl-56 min-h-screen">
      <div class="p-4 sm:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const siteStore = useSiteStore()

const sidebarOpen = ref(false)

const menuItems = [
  { path: '/admin', label: '数据概览', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>' },
  { path: '/admin/products', label: '商品管理', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>' },
  { path: '/admin/orders', label: '订单管理', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>' },
  { path: '/admin/categories', label: '分类管理', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>' },
  { path: '/admin/settings', label: '站点设置', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

function handleLogout() {
  authStore.logout()
  navigateTo('/auth/login')
}

definePageMeta({ layout: false })
</script>
