// ============================================================
// 订单状态
// ============================================================

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
} as const

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: '待付款',
  paid: '待发货',
  shipped: '已发货',
  delivered: '已签收',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
}

// ============================================================
// 支付渠道
// ============================================================

export const PAY_CHANNEL = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay',
} as const

export const PAY_CHANNEL_LABEL: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
}

// ============================================================
// 客户端类型
// ============================================================

export const CLIENT_TYPE = {
  WEB: 'web',
  APP: 'app',
  MINI: 'mini',
} as const

// ============================================================
// 会员等级
// ============================================================

export const MEMBER_LEVEL_LABEL: Record<number, string> = {
  0: '普通会员',
  1: '银卡会员',
  2: '金卡会员',
  3: '钻石会员',
}

// ============================================================
// 商品状态
// ============================================================

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ON_SALE: 'on_sale',
  OFF_SALE: 'off_sale',
} as const

export const PRODUCT_STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  on_sale: '在售',
  off_sale: '已下架',
}

// ============================================================
// 错误码
// ============================================================

export const ERROR_CODE = {
  // 通用
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',

  // 认证
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  PHONE_EXISTS: 'PHONE_EXISTS',
  EMAIL_EXISTS: 'EMAIL_EXISTS',

  // 商品
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_OFF_SALE: 'PRODUCT_OFF_SALE',
  SKU_NOT_FOUND: 'SKU_NOT_FOUND',

  // 库存
  STOCK_INSUFFICIENT: 'STOCK_INSUFFICIENT',

  // 订单
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_STATUS_INVALID: 'ORDER_STATUS_INVALID',
  ORDER_EXPIRED: 'ORDER_EXPIRED',

  // 支付
  PAY_CREATE_FAILED: 'PAY_CREATE_FAILED',
  PAY_VERIFY_FAILED: 'PAY_VERIFY_FAILED',
} as const

// ============================================================
// 分页默认值
// ============================================================

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

// 订单超时时间（毫秒）
export const ORDER_EXPIRE_MS = 30 * 60 * 1000 // 30 分钟
