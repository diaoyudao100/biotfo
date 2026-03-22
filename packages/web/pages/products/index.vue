<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-64 flex-shrink-0">
        <div class="bg-white rounded-xl p-6 shadow-sm sticky top-24">
          <h3 class="font-semibold text-gray-900 mb-4">筛选</h3>

          <!-- Category Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">商品分类</h4>
            <div class="space-y-1">
              <button
                class="block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
                :class="!filters.category ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'"
                @click="setFilter('category', undefined)"
              >
                全部分类
              </button>
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
                :class="filters.category === cat.id ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'"
                @click="setFilter('category', cat.id)"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- Brand Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">品牌</h4>
            <div class="space-y-1">
              <button
                class="block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
                :class="!filters.brand ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'"
                @click="setFilter('brand', undefined)"
              >
                全部品牌
              </button>
              <button
                v-for="brand in brands"
                :key="brand.id"
                class="block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
                :class="filters.brand === brand.id ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'"
                @click="setFilter('brand', brand.id)"
              >
                {{ brand.name }}
              </button>
            </div>
          </div>

          <!-- Price Range -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">价格范围</h4>
            <div class="flex items-center gap-2">
              <input
                v-model.number="priceMin"
                type="number"
                placeholder="最低"
                class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
              />
              <span class="text-gray-400">-</span>
              <input
                v-model.number="priceMax"
                type="number"
                placeholder="最高"
                class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            <button
              class="mt-2 w-full py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              @click="applyPriceFilter"
            >
              确定
            </button>
          </div>
        </div>
      </aside>

      <!-- Product Grid -->
      <div class="flex-1 min-w-0">
        <!-- Sort Bar -->
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm text-gray-500">
            共 <span class="font-medium text-gray-900">{{ total }}</span> 件商品
          </p>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">排序：</span>
            <select
              v-model="filters.sort"
              class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
              @change="loadProducts"
            >
              <option value="newest">最新上架</option>
              <option value="price_asc">价格从低到高</option>
              <option value="price_desc">价格从高到低</option>
              <option value="sales">销量优先</option>
            </select>
          </div>
        </div>

        <!-- Products -->
        <div
          v-if="products?.length"
          class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
        <div v-else class="text-center py-20 text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>暂无商品</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
          <button
            class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            上一页
          </button>
          <template v-for="page in displayPages" :key="page">
            <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
            <button
              v-else
              class="w-10 h-10 text-sm rounded-lg border transition-colors"
              :class="page === currentPage
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-200 hover:border-primary-300 text-gray-600'"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </button>
          </template>
          <button
            class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()

const filters = reactive({
  category: route.query.category ? Number(route.query.category) : undefined,
  brand: undefined as number | undefined,
  price_min: undefined as number | undefined,
  price_max: undefined as number | undefined,
  sort: 'newest',
  q: (route.query.q as string) || '',
})

const priceMin = ref<number | undefined>()
const priceMax = ref<number | undefined>()
const currentPage = ref(1)
const total = ref(0)
const perPage = 20
const totalPages = computed(() => Math.ceil(total.value / perPage))

const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  const cp = currentPage.value

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    const start = Math.max(2, cp - 1)
    const end = Math.min(tp - 1, cp + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

const { data: products, refresh: loadProducts } = await useAsyncData(
  'products',
  () => {
    const params: Record<string, any> = {
      page: currentPage.value,
      per_page: perPage,
    }
    if (filters.category) params.category_id = filters.category
    if (filters.brand) params.brand_id = filters.brand
    if (filters.price_min) params.price_min = filters.price_min * 100
    if (filters.price_max) params.price_max = filters.price_max * 100
    if (filters.q) params.q = filters.q
    if (filters.sort) params.sort = filters.sort

    return $fetch<any>('/products', {
      baseURL: config.public.apiBase,
      params,
    }).then((res) => {
      total.value = res.total || res.meta?.total || 0
      return res.data || res.items || res
    })
  },
  { watch: [currentPage] },
)

const { data: categories } = await useAsyncData('product-categories', () =>
  $fetch<any>('/categories', { baseURL: config.public.apiBase })
    .then((res) => res.data || res.items || res),
)

const { data: brands } = await useAsyncData('product-brands', () =>
  $fetch<any>('/brands', { baseURL: config.public.apiBase })
    .then((res) => res.data || res.items || res)
    .catch(() => []),
)

function setFilter(key: string, value: any) {
  ;(filters as any)[key] = value
  currentPage.value = 1
  loadProducts()
}

function applyPriceFilter() {
  filters.price_min = priceMin.value
  filters.price_max = priceMax.value
  currentPage.value = 1
  loadProducts()
}

function goToPage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
