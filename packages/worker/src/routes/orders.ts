import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import { ok, err } from '../utils/response'
import { authMiddleware } from '../middleware/auth'
import {
  createOrderSchema,
  ERROR_CODE,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  ORDER_STATUS,
} from '@biotfo/shared'
import { previewOrder, createOrder, cancelOrder } from '../services/order.service'

const orders = new Hono<HonoEnv>()

// 所有订单路由都需要登录
orders.use('*', authMiddleware)

// ============================================================
// POST /preview - 下单预览
// ============================================================
orders.post('/preview', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const result = await previewOrder(c.env.DB, userId, parsed.data)
  if (!result.success) {
    return err(result.message!, result.code, 400)
  }

  return ok(result.data)
})

// ============================================================
// POST / - 创建订单
// ============================================================
orders.post('/', async (c) => {
  const userId = c.get('userId')
  const clientType = c.get('clientType')
  const body = await c.req.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const result = await createOrder(c.env.DB, userId, clientType, parsed.data)
  if (!result.success) {
    return err(result.message!, result.code, 400)
  }

  return ok(result.data)
})

// ============================================================
// GET / - 订单列表
// ============================================================
orders.get('/', async (c) => {
  const userId = c.get('userId')
  const page = Math.max(1, parseInt(c.req.query('page') || '') || DEFAULT_PAGE)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(c.req.query('limit') || '') || DEFAULT_LIMIT)
  )
  const offset = (page - 1) * limit
  const status = c.req.query('status')

  let where = 'WHERE user_id = ?'
  const params: any[] = [userId]

  if (status) {
    where += ' AND status = ?'
    params.push(status)
  }

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM orders ${where}`
  )
    .bind(...params)
    .first<{ total: number }>()

  const total = countResult?.total || 0

  const listResult = await c.env.DB.prepare(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(...params, limit, offset)
    .all()

  // 查询每个订单的订单项
  const orderList = listResult.results || []
  const ordersWithItems = []

  for (const order of orderList) {
    const itemsResult = await c.env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    )
      .bind(order.id)
      .all()

    ordersWithItems.push({
      ...order,
      items: itemsResult.results || [],
    })
  }

  return ok({
    list: ordersWithItems,
    total,
    page,
    limit,
  })
})

// ============================================================
// GET /:order_no - 订单详情
// ============================================================
orders.get('/:order_no', async (c) => {
  const userId = c.get('userId')
  const orderNo = c.req.param('order_no')

  const order = await c.env.DB.prepare(
    'SELECT * FROM orders WHERE order_no = ? AND user_id = ?'
  )
    .bind(orderNo, userId)
    .first()

  if (!order) {
    return err('订单不存在', ERROR_CODE.ORDER_NOT_FOUND, 404)
  }

  const itemsResult = await c.env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all()

  return ok({
    ...order,
    items: itemsResult.results || [],
  })
})

// ============================================================
// PUT /:order_no/cancel - 取消订单
// ============================================================
orders.put('/:order_no/cancel', async (c) => {
  const userId = c.get('userId')
  const orderNo = c.req.param('order_no')
  const body = await c.req.json().catch(() => ({}))
  const reason = body.reason || '用户主动取消'

  const result = await cancelOrder(c.env.DB, orderNo, userId, reason)
  if (!result.success) {
    return err(result.message!, result.code, 400)
  }

  return ok(null)
})

// ============================================================
// PUT /:order_no/confirm - 确认收货
// ============================================================
orders.put('/:order_no/confirm', async (c) => {
  const userId = c.get('userId')
  const orderNo = c.req.param('order_no')

  const order = await c.env.DB.prepare(
    'SELECT id, status FROM orders WHERE order_no = ? AND user_id = ?'
  )
    .bind(orderNo, userId)
    .first<{ id: number; status: string }>()

  if (!order) {
    return err('订单不存在', ERROR_CODE.ORDER_NOT_FOUND, 404)
  }

  // 只有 shipped 或 delivered 状态可以确认收货
  if (order.status !== ORDER_STATUS.SHIPPED && order.status !== ORDER_STATUS.DELIVERED) {
    return err('当前状态不可确认收货', ERROR_CODE.ORDER_STATUS_INVALID)
  }

  await c.env.DB.prepare(
    `UPDATE orders SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
  )
    .bind(order.id)
    .run()

  return ok(null)
})

export default orders
