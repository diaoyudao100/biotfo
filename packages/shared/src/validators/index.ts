import { z } from 'zod'

// ============================================================
// 用户校验
// ============================================================

export const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(6, '密码至少6位').max(32, '密码最多32位'),
  nickname: z.string().min(1, '昵称不能为空').max(20, '昵称最多20字').optional(),
})

export const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(1, '请输入密码'),
})

export const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(20).optional(),
  avatar: z.string().url().optional(),
  gender: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
})

// ============================================================
// 地址校验
// ============================================================

export const addressSchema = z.object({
  receiver_name: z.string().min(1, '请填写收件人').max(20),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  district: z.string().min(1, '请选择区县'),
  detail: z.string().min(1, '请填写详细地址').max(200),
  postal_code: z.string().optional(),
  is_default: z.number().optional(),
})

// ============================================================
// 购物车校验
// ============================================================

export const addCartSchema = z.object({
  sku_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
})

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1).max(99).optional(),
  selected: z.union([z.literal(0), z.literal(1)]).optional(),
})

// ============================================================
// 订单校验
// ============================================================

export const createOrderSchema = z.object({
  address_id: z.number().int().positive(),
  cart_item_ids: z.array(z.number().int().positive()).min(1, '请选择商品'),
  buyer_remark: z.string().max(200).optional(),
})

export const createPaymentSchema = z.object({
  order_no: z.string().min(1),
  channel: z.enum(['wechat', 'alipay']),
})

// ============================================================
// 商品管理校验（Admin）
// ============================================================

export const createProductSchema = z.object({
  category_id: z.number().int().positive().optional(),
  brand_id: z.number().int().positive().optional(),
  name: z.string().min(1, '商品名称不能为空').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符'),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  main_image: z.string().min(1, '请上传主图'),
  status: z.enum(['draft', 'on_sale', 'off_sale']).optional(),
  is_featured: z.union([z.literal(0), z.literal(1)]).optional(),
})

export const createSKUSchema = z.object({
  sku_code: z.string().min(1).max(50),
  spec_desc: z.string().min(1),
  price: z.number().int().positive('价格必须大于0'),
  original_price: z.number().int().positive().optional(),
  stock: z.number().int().min(0),
  image: z.string().optional(),
  weight: z.number().int().min(0).optional(),
})
