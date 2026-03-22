<template>
  <div class="flex items-baseline gap-1.5">
    <span :class="priceClasses">
      <span class="text-xs">¥</span>{{ displayPrice }}
    </span>
    <span
      v-if="originalPrice && originalPrice > price"
      class="text-gray-400 line-through text-xs"
    >
      ¥{{ displayOriginalPrice }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    price: number
    originalPrice?: number | null
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  {
    originalPrice: null,
    size: 'md',
  },
)

const displayPrice = computed(() => (props.price / 100).toFixed(2))
const displayOriginalPrice = computed(() =>
  props.originalPrice ? (props.originalPrice / 100).toFixed(2) : '',
)

const priceClasses = computed(() => {
  const base = 'font-semibold text-primary-600'
  switch (props.size) {
    case 'xs':
      return `${base} text-xs`
    case 'sm':
      return `${base} text-sm`
    case 'md':
      return `${base} text-lg`
    case 'lg':
      return `${base} text-2xl`
    default:
      return `${base} text-lg`
  }
})
</script>
