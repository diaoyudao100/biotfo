<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
  >
    <!-- Image -->
    <div class="aspect-square overflow-hidden bg-gray-100">
      <img
        :src="imageUrl"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
        {{ product.name }}
      </h3>
      <p v-if="product.subtitle" class="text-xs text-gray-500 mb-2 line-clamp-1">
        {{ product.subtitle }}
      </p>
      <PriceDisplay
        :price="product.price"
        :original-price="product.original_price"
        size="sm"
      />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Product {
  id: number
  name: string
  subtitle?: string
  slug: string
  price: number
  original_price?: number | null
  image_key: string
}

const props = defineProps<{
  product: Product
}>()

const config = useRuntimeConfig()

const imageUrl = computed(() =>
  props.product.image_key
    ? `${config.public.assetsUrl}/${props.product.image_key}`
    : '/placeholder.png',
)
</script>
