<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="product" class="space-y-10">
      <!-- Breadcrumb -->
      <nav class="flex items-center text-sm text-gray-500">
        <NuxtLink to="/" class="hover:text-primary-600">首页</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink to="/products" class="hover:text-primary-600">全部商品</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ product.name }}</span>
      </nav>

      <!-- Product Main -->
      <div class="flex flex-col lg:flex-row gap-10">
        <!-- Image Gallery -->
        <div class="w-full lg:w-1/2">
          <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
            <img
              :src="currentImage"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-if="productImages.length > 1" class="grid grid-cols-5 gap-2">
            <button
              v-for="(img, idx) in productImages"
              :key="idx"
              class="aspect-square rounded-lg overflow-hidden border-2 transition-colors"
              :class="selectedImageIndex === idx ? 'border-primary-600' : 'border-transparent hover:border-gray-300'"
              @click="selectedImageIndex = idx"
            >
              <img :src="img" :alt="`${product.name} ${idx + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="w-full lg:w-1/2">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
          <p v-if="product.subtitle" class="text-gray-500 mb-4">{{ product.subtitle }}</p>

          <!-- Price -->
          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <PriceDisplay
              :price="currentPrice"
              :original-price="currentOriginalPrice"
              size="lg"
            />
          </div>

          <!-- SKU Selector -->
          <div v-if="skuAttrs.length" class="space-y-4 mb-6">
            <div v-for="attr in skuAttrs" :key="attr.name">
              <h4 class="text-sm font-medium text-gray-700 mb-2">{{ attr.name }}</h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="val in attr.values"
                  :key="val"
                  class="px-4 py-2 text-sm rounded-lg border transition-all"
                  :class="selectedAttrs[attr.name] === val
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                  @click="selectAttr(attr.name, val)"
                >
                  {{ val }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity -->
          <div class="flex items-center gap-4 mb-8">
            <span class="text-sm text-gray-600">数量</span>
            <QuantityInput v-model="quantity" :max="currentStock" />
            <span v-if="currentStock !== undefined" class="text-sm text-gray-400">
              库存 {{ currentStock }} 件
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              class="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!canAddToCart"
              @click="handleAddToCart"
            >
              加入购物车
            </button>
            <button
              class="flex-1 py-3 bg-primary-50 text-primary-600 font-semibold rounded-xl border border-primary-200 hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!canAddToCart"
              @click="handleBuyNow"
            >
              立即购买
            </button>
          </div>

          <p v-if="addedMessage" class="mt-3 text-sm text-green-600 text-center">
            {{ addedMessage }}
          </p>
        </div>
      </div>

      <!-- Product Description -->
      <div class="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <h2 class="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">商品详情</h2>
        <div
          v-if="product.description"
          class="prose max-w-none text-gray-600"
          v-html="product.description"
        />
        <p v-else class="text-gray-400 text-center py-10">暂无商品详情</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="text-center py-20 text-gray-400">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const cartStore = useCartStore()
const authStore = useAuthStore()

const slug = route.params.slug as string

const { data: product } = await useAsyncData(`product-${slug}`, () =>
  $fetch<any>(`/products/${slug}`, { baseURL: config.public.apiBase })
    .then((res) => res.data || res),
)

const selectedImageIndex = ref(0)
const selectedAttrs = reactive<Record<string, string>>({})
const quantity = ref(1)
const addedMessage = ref('')

const productImages = computed(() => {
  if (!product.value) return []
  const images: string[] = []
  if (product.value.image_key) {
    images.push(`${config.public.assetsUrl}/${product.value.image_key}`)
  }
  if (product.value.images) {
    for (const img of product.value.images) {
      const url = typeof img === 'string'
        ? `${config.public.assetsUrl}/${img}`
        : `${config.public.assetsUrl}/${img.image_key}`
      if (!images.includes(url)) images.push(url)
    }
  }
  return images.length ? images : ['/placeholder.png']
})

const currentImage = computed(() => productImages.value[selectedImageIndex.value] || '/placeholder.png')

const skuAttrs = computed(() => {
  if (!product.value?.skus?.length) return []
  const attrMap = new Map<string, Set<string>>()
  for (const sku of product.value.skus) {
    if (sku.attrs) {
      for (const [key, val] of Object.entries(sku.attrs)) {
        if (!attrMap.has(key)) attrMap.set(key, new Set())
        attrMap.get(key)!.add(val as string)
      }
    }
  }
  return Array.from(attrMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }))
})

const selectedSku = computed(() => {
  if (!product.value?.skus?.length) return product.value?.skus?.[0] || null
  return product.value.skus.find((sku: any) => {
    if (!sku.attrs) return false
    return Object.entries(selectedAttrs).every(([k, v]) => sku.attrs[k] === v)
  }) || null
})

const currentPrice = computed(() => selectedSku.value?.price || product.value?.price || 0)
const currentOriginalPrice = computed(() => selectedSku.value?.original_price || product.value?.original_price)
const currentStock = computed(() => selectedSku.value?.stock ?? 99)

const canAddToCart = computed(() => {
  if (skuAttrs.value.length === 0) return true
  return !!selectedSku.value
})

function selectAttr(name: string, value: string) {
  selectedAttrs[name] = value
}

async function handleAddToCart() {
  if (!authStore.isLoggedIn) {
    navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }
  const skuId = selectedSku.value?.id || product.value?.skus?.[0]?.id
  if (!skuId) return
  await cartStore.addItem(skuId, quantity.value)
  addedMessage.value = '已加入购物车'
  setTimeout(() => { addedMessage.value = '' }, 2000)
}

async function handleBuyNow() {
  if (!authStore.isLoggedIn) {
    navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }
  const skuId = selectedSku.value?.id || product.value?.skus?.[0]?.id
  if (!skuId) return
  await cartStore.addItem(skuId, quantity.value)
  navigateTo('/cart')
}

// Initialize first attr value
if (skuAttrs.value.length) {
  for (const attr of skuAttrs.value) {
    if (attr.values.length) {
      selectedAttrs[attr.name] = attr.values[0]
    }
  }
}
</script>
