<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative h-[60vh] min-h-[400px] bg-gray-900 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/40" />
      <div class="absolute inset-0 flex items-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div class="max-w-lg">
            <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              品质生活<br />从这里开始
            </h1>
            <p class="text-lg text-gray-200 mb-8">
              甄选全球优质好物，为您打造高品质的购物体验
            </p>
            <NuxtLink
              to="/products"
              class="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              立即选购
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">精选推荐</h2>
        <p class="text-gray-500">为您精心挑选的优质商品</p>
      </div>

      <div v-if="featuredProducts?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      <div v-else class="text-center py-20 text-gray-400">
        <p>暂无推荐商品</p>
      </div>
    </section>

    <!-- Categories -->
    <section class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">商品分类</h2>
          <p class="text-gray-500">按分类浏览，快速找到心仪好物</p>
        </div>

        <div v-if="categories?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/products?category=${category.id}`"
            class="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <img
              v-if="category.image_key"
              :src="`${assetsUrl}/${category.image_key}`"
              :alt="category.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-white font-semibold text-lg">{{ category.name }}</h3>
              <p v-if="category.description" class="text-gray-200 text-sm mt-1 line-clamp-1">
                {{ category.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="text-center py-20 text-gray-400">
          <p>暂无分类</p>
        </div>
      </div>
    </section>

    <!-- Brand Banner -->
    <section class="bg-primary-600 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl font-bold text-white mb-4">我们的品牌承诺</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
          <div class="text-white">
            <div class="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-semibold mb-1">正品保障</h3>
            <p class="text-sm text-primary-100">100% 正品，假一赔十</p>
          </div>
          <div class="text-white">
            <div class="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="font-semibold mb-1">极速发货</h3>
            <p class="text-sm text-primary-100">下单后 24 小时内发货</p>
          </div>
          <div class="text-white">
            <div class="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 class="font-semibold mb-1">7天无理由</h3>
            <p class="text-sm text-primary-100">不满意可随时退换</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const assetsUrl = config.public.assetsUrl

const { data: featuredProducts } = await useAsyncData('featured-products', () =>
  $fetch<any[]>('/products', {
    baseURL: config.public.apiBase,
    params: { is_featured: 1, per_page: 8 },
  }).then((res: any) => res.data || res.items || res),
)

const { data: categories } = await useAsyncData('categories', () =>
  $fetch<any[]>('/categories', {
    baseURL: config.public.apiBase,
  }).then((res: any) => res.data || res.items || res),
)
</script>
