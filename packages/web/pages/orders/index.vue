<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>

    <!-- Status Tabs -->
    <div class="flex border-b border-gray-200 mb-6 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0"
        :class="activeTab === tab.value
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Orders -->
    <div v-if="orders?.length" class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <!-- Order Header -->
        <div class="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-500">订单号：<span class="text-gray-900">{{ order.order_no }}</span></span>
            <span class="text-gray-400">{{ formatDate(order.created_at) }}</span>
          </div>
          <span :class="statusColor(order.status)" class="text-sm font-medium">
            {{ statusText(order.status) }}
          </span>
        </div>

        <!-- Order Items -->
        <NuxtLink :to="`/orders/${order.order_no}`" class="block px-6 py-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="flex -space-x-2">
              <img
                v-for="(item, idx) in order.items?.slice(0, 4)"
                :key="idx"
                :src="getImageUrl(item)"
                class="w-14 h-14 rounded-lg object-cover border-2 border-white bg-gray-100"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-600">
                共 {{ order.items?.length || 0 }} 件商品
              </p>
            </div>
            <div class="text-right">
              <PriceDisplay :price="order.total_amount" size="sm" />
            </div>
          </div>
        </NuxtLink>

        <!-- Order Actions -->
        <div class="flex items-center justify-end gap-3 px-6 py-3 border-t border-gray-100">
          <button
            v-if="order.status === 'pending'"
            class="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="handlePay(order)"
          >
            去付款
          </button>
          <button
            v-if="order.status === 'pending'"
            class="px-4 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            @click="handleCancel(order)"
          >
            取消订单
          </button>
          <button
            v-if="order.status === 'shipped'"
            class="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="handleConfirm(order)"
          >
            确认收货
          </button>
          <NuxtLink
            :to="`/orders/${order.order_no}`"
            class="px-4 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            查看详情
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-20">
      <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-400 mb-4">暂无订单</p>
      <NuxtLink
        to="/products"
        class="inline-block px-6 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition-colors"
      >
        去逛逛
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig()
const { api } = useApi()

const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'pending' },
  { label: '待发货', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
]

const activeTab = ref('')
const orders = ref<any[]>([])

onMounted(() => {
  loadOrders()
})

async function loadOrders() {
  try {
    const params: Record<string, any> = {}
    if (activeTab.value) params.status = activeTab.value

    const data = await api<any>('/orders', { params })
    orders.value = data.data || data.items || data
  } catch {
    orders.value = []
  }
}

function switchTab(value: string) {
  activeTab.value = value
  loadOrders()
}

function getImageUrl(item: any) {
  const key = item.image_key || item.product?.image_key
  return key ? `${config.public.assetsUrl}/${key}` : '/placeholder.png'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  }
  return map[status] || status
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'text-orange-500',
    paid: 'text-blue-500',
    shipped: 'text-primary-600',
    completed: 'text-green-500',
    cancelled: 'text-gray-400',
    refunded: 'text-red-500',
  }
  return map[status] || 'text-gray-500'
}

async function handlePay(order: any) {
  // Navigate to payment (placeholder)
  alert(`跳转到支付页面，订单号: ${order.order_no}`)
}

async function handleCancel(order: any) {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    await api(`/orders/${order.order_no}/cancel`, { method: 'POST' })
    await loadOrders()
  } catch {
    alert('取消失败')
  }
}

async function handleConfirm(order: any) {
  if (!confirm('确定已收到商品吗？')) return
  try {
    await api(`/orders/${order.order_no}/confirm`, { method: 'POST' })
    await loadOrders()
  } catch {
    alert('操作失败')
  }
}
</script>
