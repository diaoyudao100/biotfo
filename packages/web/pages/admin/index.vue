<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="text-xl font-bold text-gray-900 mb-6">数据概览</h1>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl p-4 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs mt-1" :class="stat.trend > 0 ? 'text-green-600' : 'text-gray-400'">
            <template v-if="stat.trend > 0">+{{ stat.trend }}%</template>
            <template v-else>较昨日持平</template>
          </p>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">最近订单</h2>
          <NuxtLink to="/admin/orders" class="text-sm text-indigo-600 hover:text-indigo-700">查看全部</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th class="px-5 py-3 font-medium">订单号</th>
                <th class="px-5 py-3 font-medium">金额</th>
                <th class="px-5 py-3 font-medium">状态</th>
                <th class="px-5 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="!recentOrders.length">
                <td colspan="4" class="px-5 py-10 text-center text-gray-400">暂无订单</td>
              </tr>
              <tr v-for="order in recentOrders" :key="order.order_no" class="hover:bg-gray-50">
                <td class="px-5 py-3 font-mono text-xs">{{ order.order_no }}</td>
                <td class="px-5 py-3 font-medium">¥{{ (order.pay_amount / 100).toFixed(2) }}</td>
                <td class="px-5 py-3">
                  <span :class="statusClass(order.status)" class="inline-block px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ statusLabel(order.status) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-gray-500">{{ formatTime(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ORDER_STATUS_LABEL } from '@biotfo/shared'

definePageMeta({ layout: false })

const { api } = useApi()

const stats = ref([
  { label: '今日订单', value: '0', trend: 0 },
  { label: '今日销售额', value: '¥0', trend: 0 },
  { label: '商品总数', value: '0', trend: 0 },
  { label: '用户总数', value: '0', trend: 0 },
])

const recentOrders = ref<any[]>([])

onMounted(async () => {
  try {
    // 商品数量
    const prodRes = await api<any>('/admin/products?limit=1')
    stats.value[2].value = String(prodRes.data?.total ?? 0)
  } catch {}

  try {
    // 最近订单
    const orderRes = await api<any>('/admin/orders?limit=10')
    recentOrders.value = orderRes.data?.list ?? []
    stats.value[0].value = String(orderRes.data?.total ?? 0)
  } catch {}
})

function statusLabel(s: string) {
  return ORDER_STATUS_LABEL[s] || s
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-cyan-100 text-cyan-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
    refunding: 'bg-orange-100 text-orange-700',
    refunded: 'bg-red-100 text-red-700',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

function formatTime(t: string) {
  if (!t) return ''
  return t.replace('T', ' ').slice(0, 16)
}
</script>
