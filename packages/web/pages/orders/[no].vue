<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="order">
      <!-- Back -->
      <NuxtLink to="/orders" class="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回订单列表
      </NuxtLink>

      <!-- Order Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">订单详情</h1>
          <p class="text-sm text-gray-500 mt-1">订单号：{{ order.order_no }}</p>
        </div>
        <span :class="statusColor(order.status)" class="text-lg font-semibold">
          {{ statusText(order.status) }}
        </span>
      </div>

      <!-- Status Progress -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between relative">
          <!-- Progress Line -->
          <div class="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
          <div
            class="absolute top-4 left-0 h-0.5 bg-primary-600 transition-all"
            :style="{ width: progressWidth }"
          />

          <div
            v-for="(step, idx) in progressSteps"
            :key="idx"
            class="relative flex flex-col items-center z-10"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="idx <= currentStepIndex
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-400'"
            >
              {{ idx + 1 }}
            </div>
            <span class="text-xs mt-2 text-gray-500 whitespace-nowrap">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-3">收货信息</h2>
        <div v-if="order.address" class="text-sm text-gray-600 space-y-1">
          <p>
            <span class="font-medium text-gray-900">{{ order.address.name }}</span>
            <span class="ml-3">{{ order.address.phone }}</span>
          </p>
          <p>{{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}</p>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4">商品列表</h2>
        <div class="divide-y divide-gray-100">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-4 py-4"
          >
            <img
              :src="getImageUrl(item)"
              :alt="item.product_name || item.name"
              class="w-16 h-16 rounded-lg object-cover bg-gray-100"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ item.product_name || item.name }}</p>
              <p v-if="item.sku_attrs" class="text-xs text-gray-500 mt-0.5">
                {{ formatSkuAttrs(item.sku_attrs) }}
              </p>
            </div>
            <div class="text-right">
              <PriceDisplay :price="item.price" size="sm" />
              <p class="text-xs text-gray-400">x{{ item.quantity }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Amount -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4">金额明细</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">商品总价</span>
            <span class="text-gray-900">¥{{ (order.items_amount / 100).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">运费</span>
            <span class="text-gray-900">¥{{ ((order.shipping_fee || 0) / 100).toFixed(2) }}</span>
          </div>
          <div v-if="order.discount_amount" class="flex justify-between">
            <span class="text-gray-500">优惠</span>
            <span class="text-green-600">-¥{{ (order.discount_amount / 100).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between pt-3 border-t border-gray-100">
            <span class="font-medium text-gray-900">实付金额</span>
            <PriceDisplay :price="order.total_amount" size="md" />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button
          v-if="order.status === 'pending'"
          class="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          @click="handlePay"
        >
          去付款
        </button>
        <button
          v-if="order.status === 'pending'"
          class="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          @click="handleCancel"
        >
          取消订单
        </button>
        <button
          v-if="order.status === 'shipped'"
          class="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          @click="handleConfirm"
        >
          确认收货
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="text-center py-20 text-gray-400">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const config = useRuntimeConfig()
const { api } = useApi()

const orderNo = route.params.no as string
const order = ref<any>(null)

const progressSteps = [
  { label: '提交订单', status: 'pending' },
  { label: '付款成功', status: 'paid' },
  { label: '商家发货', status: 'shipped' },
  { label: '确认收货', status: 'completed' },
]

const currentStepIndex = computed(() => {
  if (!order.value) return 0
  const statusOrder = ['pending', 'paid', 'shipped', 'completed']
  const idx = statusOrder.indexOf(order.value.status)
  return idx >= 0 ? idx : 0
})

const progressWidth = computed(() => {
  return `${(currentStepIndex.value / (progressSteps.length - 1)) * 100}%`
})

onMounted(async () => {
  try {
    const data = await api<any>(`/orders/${orderNo}`)
    order.value = data.data || data
  } catch {
    alert('加载订单失败')
  }
})

function getImageUrl(item: any) {
  const key = item.image_key || item.product?.image_key
  return key ? `${config.public.assetsUrl}/${key}` : '/placeholder.png'
}

function formatSkuAttrs(attrs: any) {
  if (typeof attrs === 'string') return attrs
  if (typeof attrs === 'object') {
    return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join('，')
  }
  return ''
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

function handlePay() {
  alert(`跳转到支付页面，订单号: ${orderNo}`)
}

async function handleCancel() {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    await api(`/orders/${orderNo}/cancel`, { method: 'POST' })
    order.value.status = 'cancelled'
  } catch {
    alert('取消失败')
  }
}

async function handleConfirm() {
  if (!confirm('确定已收到商品吗？')) return
  try {
    await api(`/orders/${orderNo}/confirm`, { method: 'POST' })
    order.value.status = 'completed'
  } catch {
    alert('操作失败')
  }
}
</script>
