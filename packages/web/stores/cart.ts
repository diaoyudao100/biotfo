import { defineStore } from 'pinia'

interface CartItemSku {
  id: number
  name: string
  attrs: Record<string, string>
  price: number
  original_price: number | null
  image_key: string | null
}

interface CartItemProduct {
  id: number
  name: string
  slug: string
  image_key: string
}

interface CartItem {
  id: number
  sku_id: number
  quantity: number
  selected: boolean
  sku: CartItemSku
  product: CartItemProduct
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const selectedItems = computed(() =>
    items.value.filter((item) => item.selected),
  )

  const totalAmount = computed(() =>
    selectedItems.value.reduce(
      (sum, item) => sum + item.sku.price * item.quantity,
      0,
    ),
  )

  async function fetchCart() {
    const { api } = useApi()
    loading.value = true
    try {
      const data = await api<{ items: CartItem[] }>('/cart')
      items.value = data.items
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  }

  async function addItem(skuId: number, quantity: number = 1) {
    const { api } = useApi()
    loading.value = true
    try {
      await api('/cart/items', {
        method: 'POST',
        body: { sku_id: skuId, quantity },
      })
      await fetchCart()
    } finally {
      loading.value = false
    }
  }

  async function updateItem(itemId: number, data: { quantity?: number; selected?: boolean }) {
    const { api } = useApi()
    try {
      await api(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: data,
      })
      const item = items.value.find((i) => i.id === itemId)
      if (item) {
        if (data.quantity !== undefined) item.quantity = data.quantity
        if (data.selected !== undefined) item.selected = data.selected
      }
    } catch {
      await fetchCart()
    }
  }

  async function removeItem(itemId: number) {
    const { api } = useApi()
    try {
      await api(`/cart/items/${itemId}`, { method: 'DELETE' })
      items.value = items.value.filter((i) => i.id !== itemId)
    } catch {
      await fetchCart()
    }
  }

  return {
    items,
    loading,
    totalCount,
    selectedItems,
    totalAmount,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
  }
})
