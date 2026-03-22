<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="text-xl font-bold text-gray-900 mb-6">订单管理</h1>

      <!-- Status Tabs -->
      <div class="bg-white rounded-xl shadow-sm mb-4">
        <div class="flex overflow-x-auto border-b border-gray-100">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            @click="currentStatus = tab.value; page = 1; fetchOrders()"
            :class="currentStatus === tab.value
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'"
            class="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th class="px-5 py-3 font-medium">订单号</th>
                <th class="px-5 py-3 font-medium">商品</th>
                <th class="px-5 py-3 font-medium">收件人</th>
                <th class="px-5 py-3 font-medium">金额</th>
                <th class="px-5 py-3 font-medium">状态</th>
                <th class="px-5 py-3 font-medium">下单时间</th>
                <th class="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="loading">
                <td colspan="7" class="px-5 py-10 text-center text-gray-400">加载中...</td>
              </tr>
              <tr v-else-if="!orders.length">
                <td colspan="7" class="px-5 py-10 text-center text-gray-400">暂无订单</td>
              </tr>
              <tr v-for="order in orders" :key="order.order_no" class="hover:bg-gray-50">
                <td class="px-5 py-3 font-mono text-xs">{{ order.order_no }}</td>
                <td class="px-5 py-3 max-w-[200px]">
                  <p class="truncate text-gray-700">{{ orderItemsSummary(order) }}</p>
                </td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <p class="text-gray-900">{{ order.receiver_name }}</p>
                  <p class="text-xs text-gray-400">{{ order.receiver_phone }}</p>
                </td>
                <td class="px-5 py-3 font-medium text-red-600 whitespace-nowrap">¥{{ (order.pay_amount / 100).toFixed(2) }}</td>
                <td class="px-5 py-3">
                  <span :class="statusClass(order.status)" class="inline-block px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ statusLabel(order.status) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">{{ formatTime(order.created_at) }}</td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="order.status === 'paid'"
                      @click="showShipModal(order)"
                      class="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                    >发货</button>
                    <button @click="viewOrder(order)" class="text-gray-500 hover:text-gray-700 text-xs font-medium">详情</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="total > limit" class="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>共 {{ total }} 条</span>
          <div class="flex space-x-1">
            <button
              v-for="p in totalPages" :key="p"
              @click="page = p; fetchOrders()"
              :class="p === page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="w-8 h-8 rounded flex items-center justify-center text-xs font-medium"
            >{{ p }}</button>
          </div>
        </div>
      </div>

      <!-- Ship Modal -->
      <div v-if="shipModal.show" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="fixed inset-0 bg-black/40" @click="shipModal.show = false" />
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold mb-4">发货 - {{ shipModal.orderNo }}</h2>
          <form @submit.prevent="submitShip" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">快递公司 *</label>
              <input v-model="shipModal.company" required placeholder="顺丰/中通/圆通..." class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">运单号 *</label>
              <input v-model="shipModal.trackingNo" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" @click="shipModal.show = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button type="submit" class="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">确认发货</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Order Detail Modal -->
      <div v-if="detailModal.show" class="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
        <div class="fixed inset-0 bg-black/40" @click="detailModal.show = false" />
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[75vh] overflow-y-auto p-6">
          <h2 class="text-lg font-bold mb-4">订单详情</h2>
          <div v-if="detailModal.order" class="space-y-4 text-sm">
            <div class="grid grid-cols-2 gap-4">
              <div><span class="text-gray-500">订单号：</span>{{ detailModal.order.order_no }}</div>
              <div><span class="text-gray-500">状态：</span>{{ statusLabel(detailModal.order.status) }}</div>
              <div><span class="text-gray-500">收件人：</span>{{ detailModal.order.receiver_name }}</div>
              <div><span class="text-gray-500">电话：</span>{{ detailModal.order.receiver_phone }}</div>
              <div class="col-span-2"><span class="text-gray-500">地址：</span>{{ detailModal.order.receiver_address }}</div>
              <div><span class="text-gray-500">实付金额：</span><span class="text-red-600 font-medium">¥{{ (detailModal.order.pay_amount / 100).toFixed(2) }}</span></div>
              <div><span class="text-gray-500">下单时间：</span>{{ formatTime(detailModal.order.created_at) }}</div>
            </div>
            <div v-if="detailModal.order.items?.length" class="border-t pt-3">
              <h3 class="font-medium mb-2">商品列表</h3>
              <div v-for="item in detailModal.order.items" :key="item.id" class="flex items-center space-x-3 py-2">
                <div class="w-10 h-10 bg-gray-100 rounded flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="truncate">{{ item.product_name }}</p>
                  <p class="text-xs text-gray-400">{{ item.sku_desc }}</p>
                </div>
                <div class="text-right">
                  <p>¥{{ (item.price / 100).toFixed(2) }} x {{ item.quantity }}</p>
                </div>
              </div>
            </div>
            <div v-if="detailModal.order.ship_tracking_no" class="border-t pt-3">
              <h3 class="font-medium mb-2">物流信息</h3>
              <p>{{ detailModal.order.ship_company }} - {{ detailModal.order.ship_tracking_no }}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button @click="detailModal.show = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ORDER_STATUS_LABEL } from '@biotfo/shared'

definePageMeta({ layout: false })

const { api } = useApi()

const orders = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = 20
const totalPages = computed(() => Math.ceil(total.value / limit))
const currentStatus = ref('')

const statusTabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

const shipModal = reactive({ show: false, orderNo: '', company: '', trackingNo: '' })
const detailModal = reactive({ show: false, order: null as any })

onMounted(fetchOrders)

async function fetchOrders() {
  loading.value = true
  try {
    const params: any = { page: page.value, limit }
    if (currentStatus.value) params.status = currentStatus.value
    const res = await api<any>('/admin/orders', { params })
    orders.value = res.data?.list ?? []
    total.value = res.data?.total ?? 0
  } catch { }
  loading.value = false
}

function showShipModal(order: any) {
  shipModal.orderNo = order.order_no
  shipModal.company = ''
  shipModal.trackingNo = ''
  shipModal.show = true
}

async function submitShip() {
  try {
    await api(`/admin/orders/${shipModal.orderNo}/ship`, {
      method: 'PUT',
      body: { ship_company: shipModal.company, ship_tracking_no: shipModal.trackingNo },
    })
    shipModal.show = false
    await fetchOrders()
  } catch (e: any) {
    alert(e?.data?.message || '发货失败')
  }
}

async function viewOrder(order: any) {
  try {
    const res = await api<any>(`/orders/${order.order_no}`)
    detailModal.order = res.data
    detailModal.show = true
  } catch {
    detailModal.order = order
    detailModal.show = true
  }
}

function orderItemsSummary(order: any) {
  if (order.items?.length) return order.items.map((i: any) => i.product_name).join(', ')
  return '-'
}

function statusLabel(s: string) { return ORDER_STATUS_LABEL[s] || s }
function statusClass(s: string) {
  const map: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700', paid: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

function formatTime(t: string) { return t ? t.replace('T', ' ').slice(0, 16) : '' }
</script>
