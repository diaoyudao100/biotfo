// ============================================================
// 订单相关类型
// ============================================================

export interface Order {
  id: number
  order_no: string
  user_id: number
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  total_amount: number // 分
  freight_amount: number
  discount_amount: number
  pay_amount: number
  status: OrderStatus
  cancel_reason: string | null
  pay_channel: PayChannel | null
  pay_trade_no: string | null
  paid_at: string | null
  ship_company: string | null
  ship_tracking_no: string | null
  shipped_at: string | null
  delivered_at: string | null
  completed_at: string | null
  buyer_remark: string | null
  seller_remark: string | null
  client_type: ClientType
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunding'
  | 'refunded'

export type PayChannel = 'wechat' | 'alipay'
export type ClientType = 'web' | 'app' | 'mini'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  sku_id: number
  product_name: string
  sku_desc: string
  image: string
  price: number // 分
  quantity: number
  subtotal: number
  created_at: string
}

export interface PaymentRecord {
  id: number
  order_id: number
  order_no: string
  pay_channel: PayChannel
  pay_type: 'pay' | 'refund'
  amount: number
  trade_no: string | null
  status: 'pending' | 'success' | 'failed'
  raw_notify: string | null
  created_at: string
  updated_at: string
}
