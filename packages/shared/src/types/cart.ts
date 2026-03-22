// ============================================================
// 购物车类型
// ============================================================

export interface CartItem {
  id: number
  user_id: number
  sku_id: number
  quantity: number
  selected: number
  created_at: string
  updated_at: string
  // 关联数据（接口返回时填充）
  product_name?: string
  product_slug?: string
  sku_desc?: string
  price?: number
  stock?: number
  image?: string
}
