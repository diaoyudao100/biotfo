<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">购物车</h1>

    <div v-if="cartStore.items.length">
      <!-- Select All -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          :checked="allSelected"
          class="w-4 h-4 accent-primary-600"
          @change="toggleAll"
        />
        <span class="text-sm text-gray-600">全选</span>
      </div>

      <!-- Cart Items -->
      <div class="space-y-3 mb-6">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="bg-white rounded-xl shadow-sm p-4"
        >
          <div class="flex items-start gap-4">
            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="item.selected"
              class="mt-6 w-4 h-4 accent-primary-600 flex-shrink-0"
              @change="cartStore.updateItem(item.id, { selected: !item.selected })"
            />

            <!-- Image -->
            <NuxtLink
              :to="`/products/${item.product.slug}`"
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
            >
              <img
                :src="getImageUrl(item)"
                :alt="item.product.name"
                class="w-full h-full object-cover"
              />
            </NuxtLink>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <NuxtLink
                :to="`/products/${item.product.slug}`"
                class="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors"
              >
                {{ item.product.name }}
              </NuxtLink>
              <p v-if="item.sku.attrs" class="text-xs text-gray-500 mt-1">
                {{ formatSkuAttrs(item.sku.attrs) }}
              </p>

              <div class="flex items-center justify-between mt-3">
                <PriceDisplay :price="item.sku.price" size="sm" />

                <div class="flex items-center gap-4">
                  <QuantityInput
                    :model-value="item.quantity"
                    @update:model-value="(val) => cartStore.updateItem(item.id, { quantity: val })"
                  />

                  <button
                    class="text-gray-400 hover:text-red-500 transition-colors"
                    @click="handleRemove(item.id)"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between sticky bottom-0">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            已选 <span class="font-semibold text-primary-600">{{ cartStore.selectedItems.length }}</span> 件
          </span>
          <div class="flex items-baseline gap-1">
            <span class="text-sm text-gray-600">合计：</span>
            <PriceDisplay :price="cartStore.totalAmount" size="md" />
          </div>
        </div>
        <button
          class="px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="cartStore.selectedItems.length === 0"
          @click="goCheckout"
        >
          去结算
        </button>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-20">
      <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <p class="text-gray-400 mb-4">购物车还是空的</p>
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
const cartStore = useCartStore()

onMounted(() => {
  cartStore.fetchCart()
})

const allSelected = computed(() =>
  cartStore.items.length > 0 && cartStore.items.every((i) => i.selected),
)

function toggleAll() {
  const newVal = !allSelected.value
  cartStore.items.forEach((item) => {
    cartStore.updateItem(item.id, { selected: newVal })
  })
}

function getImageUrl(item: any) {
  const key = item.sku.image_key || item.product.image_key
  return key ? `${config.public.assetsUrl}/${key}` : '/placeholder.png'
}

function formatSkuAttrs(attrs: Record<string, string>) {
  return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join('，')
}

function handleRemove(itemId: number) {
  if (confirm('确定要移除该商品吗？')) {
    cartStore.removeItem(itemId)
  }
}

function goCheckout() {
  if (cartStore.selectedItems.length === 0) return
  navigateTo('/checkout')
}
</script>
