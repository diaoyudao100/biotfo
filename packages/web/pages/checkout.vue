<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">确认订单</h1>

    <div class="space-y-6">
      <!-- Address Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">收货地址</h2>
          <button
            class="text-sm text-primary-600 hover:text-primary-700 transition-colors"
            @click="showAddressForm = true"
          >
            + 新增地址
          </button>
        </div>

        <div v-if="addresses.length" class="space-y-3">
          <label
            v-for="addr in addresses"
            :key="addr.id"
            class="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
            :class="selectedAddressId === addr.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              v-model="selectedAddressId"
              type="radio"
              :value="addr.id"
              class="mt-1 accent-primary-600"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900">{{ addr.name }}</span>
                <span class="text-gray-500 text-sm">{{ addr.phone }}</span>
                <span v-if="addr.is_default" class="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                  默认
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </p>
            </div>
          </label>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          <p>暂无收货地址，请先添加</p>
        </div>

        <!-- Address Form Modal -->
        <div
          v-if="showAddressForm"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="showAddressForm = false"
        >
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">新增收货地址</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1">收货人</label>
                <input v-model="addressForm.name" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">手机号</label>
                <input v-model="addressForm.phone" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">省</label>
                  <input v-model="addressForm.province" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">市</label>
                  <input v-model="addressForm.city" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">区</label>
                  <input v-model="addressForm.district" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">详细地址</label>
                <input v-model="addressForm.detail" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none" />
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button
                class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                @click="showAddressForm = false"
              >
                取消
              </button>
              <button
                class="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                @click="saveAddress"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4">商品清单</h2>
        <div class="divide-y divide-gray-100">
          <div
            v-for="item in cartStore.selectedItems"
            :key="item.id"
            class="flex items-center gap-4 py-4"
          >
            <img
              :src="getImageUrl(item)"
              :alt="item.product.name"
              class="w-16 h-16 rounded-lg object-cover bg-gray-100"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ item.product.name }}</p>
              <p v-if="item.sku.attrs" class="text-xs text-gray-500 mt-0.5">
                {{ formatSkuAttrs(item.sku.attrs) }}
              </p>
            </div>
            <div class="text-right">
              <PriceDisplay :price="item.sku.price" size="sm" />
              <p class="text-xs text-gray-400">x{{ item.quantity }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Remark -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-3">订单备注</h2>
        <textarea
          v-model="remark"
          rows="2"
          placeholder="选填，如有特殊要求请备注"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
        />
      </div>

      <!-- Amount Summary -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4">金额明细</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">商品总价</span>
            <span class="text-gray-900">¥{{ (cartStore.totalAmount / 100).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">运费</span>
            <span class="text-gray-900">¥{{ (shippingFee / 100).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">优惠</span>
            <span class="text-green-600">-¥{{ (discount / 100).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between pt-3 border-t border-gray-100">
            <span class="font-medium text-gray-900">实付金额</span>
            <PriceDisplay :price="payableAmount" size="md" />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end">
        <button
          class="px-10 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="submitting || !selectedAddressId || cartStore.selectedItems.length === 0"
          @click="submitOrder"
        >
          {{ submitting ? '提交中...' : '提交订单' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig()
const cartStore = useCartStore()
const { api } = useApi()

const addresses = ref<any[]>([])
const selectedAddressId = ref<number | null>(null)
const showAddressForm = ref(false)
const remark = ref('')
const submitting = ref(false)

const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
})

const shippingFee = ref(0)
const discount = ref(0)

const payableAmount = computed(() =>
  cartStore.totalAmount + shippingFee.value - discount.value,
)

onMounted(async () => {
  await loadAddresses()
})

async function loadAddresses() {
  try {
    const data = await api<any>('/addresses')
    addresses.value = data.data || data.items || data
    const defaultAddr = addresses.value.find((a: any) => a.is_default)
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id
    } else if (addresses.value.length) {
      selectedAddressId.value = addresses.value[0].id
    }
  } catch {
    // ignore
  }
}

async function saveAddress() {
  try {
    await api('/addresses', {
      method: 'POST',
      body: addressForm,
    })
    showAddressForm.value = false
    Object.assign(addressForm, { name: '', phone: '', province: '', city: '', district: '', detail: '' })
    await loadAddresses()
  } catch {
    alert('保存地址失败')
  }
}

function getImageUrl(item: any) {
  const key = item.sku.image_key || item.product.image_key
  return key ? `${config.public.assetsUrl}/${key}` : '/placeholder.png'
}

function formatSkuAttrs(attrs: Record<string, string>) {
  return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join('，')
}

async function submitOrder() {
  if (!selectedAddressId.value) {
    alert('请选择收货地址')
    return
  }

  submitting.value = true
  try {
    const items = cartStore.selectedItems.map((item) => ({
      sku_id: item.sku_id,
      quantity: item.quantity,
    }))

    const data = await api<any>('/orders', {
      method: 'POST',
      body: {
        address_id: selectedAddressId.value,
        items,
        remark: remark.value,
      },
    })

    // Refresh cart
    await cartStore.fetchCart()

    // Navigate to order detail
    const orderNo = data.order_no || data.data?.order_no
    navigateTo(`/orders/${orderNo}`)
  } catch (err: any) {
    alert(err?.data?.message || '下单失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>
