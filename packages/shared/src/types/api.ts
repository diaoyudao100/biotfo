// ============================================================
// API 通用类型
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: string
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  limit: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface ProductListParams extends PaginationParams {
  category?: string
  brand?: string
  sort?: 'price_asc' | 'price_desc' | 'sales' | 'newest'
  price_min?: number
  price_max?: number
  keyword?: string
}

export interface OrderListParams extends PaginationParams {
  status?: string
}
