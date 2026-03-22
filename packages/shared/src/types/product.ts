// ============================================================
// 商品相关类型
// ============================================================

export interface Category {
  id: number
  parent_id: number | null
  name: string
  slug: string
  icon: string | null
  sort_order: number
  is_visible: number
  created_at: string
  children?: Category[]
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo: string | null
  description: string | null
  sort_order: number
  created_at: string
}

/** SPU - 标准产品单元 */
export interface Product {
  id: number
  category_id: number | null
  brand_id: number | null
  name: string
  slug: string
  subtitle: string | null
  description: string | null
  main_image: string
  status: ProductStatus
  is_featured: number
  sort_order: number
  price_min: number
  price_max: number
  sales_count: number
  created_at: string
  updated_at: string
  // 关联数据（接口返回时填充）
  category?: Category
  brand?: Brand
  images?: ProductImage[]
  skus?: SKU[]
  spec_names?: SpecName[]
}

export type ProductStatus = 'draft' | 'on_sale' | 'off_sale'

export interface ProductImage {
  id: number
  product_id: number
  image_key: string
  sort_order: number
}

export interface SpecName {
  id: number
  product_id: number
  name: string
  sort_order: number
  values?: SpecValue[]
}

export interface SpecValue {
  id: number
  spec_name_id: number
  value: string
  sort_order: number
}

/** SKU - 库存计量单位 */
export interface SKU {
  id: number
  product_id: number
  sku_code: string
  spec_desc: string // JSON: [{"name":"颜色","value":"红色"}]
  price: number // 分
  original_price: number | null // 分
  stock: number
  image: string | null
  weight: number // 克
  is_enabled: number
  created_at: string
}

export interface SpecDescItem {
  name: string
  value: string
}
