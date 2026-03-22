import { Hono } from 'hono'
import type { HonoEnv } from '../../types'
import { ok, err } from '../../utils/response'
import { authMiddleware, adminMiddleware } from '../../middleware/auth'
import {
  ERROR_CODE,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  ORDER_STATUS,
} from '@biotfo/shared'

const adminOrders = new Hono<HonoEnv>()

// 所有 admin 订单路由都需要 admin 权限
adminOrders.use('*', authMiddleware, adminMiddleware)

// ============================================================
// GET / - 全部订单列表
// ============================================================
adminOrders.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '') || DEFAULT_PAGE)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(c.req.query('limit') || '') || DEFAULT_LIMIT)
  )
  const offset = (page - 1) * limit
  const status = c.req.query('status')
  const keyword = c.req.query('keyword')

  let where = 'WHERE 1=1'
  const params: any[] = []

  if (status) {
    where += ' AND o.status = ?'
    params.push(status)
  }

  if (keyword) {
    where += ' AND (o.order_no LIKE ? OR o.receiver_name LIKE ? OR o.receiver_phone LIKE ?)'
    const kw = `%${keyword}%`
    params.push(kw, kw, kw)
  }

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM orders o ${where}`
  )
    .bind(...params)
    .first<{ total: number }>()

  const total = countResult?.total || 0

  const listResult = await c.env.DB.prepare(
    `SELECT o.*, u.phone AS user_phone, u.nickname AS user_nickname
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`
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
// PUT /:order_no/ship - 发货
// ============================================================
adminOrders.put('/:order_no/ship', async (c) => {
  const orderNo = c.req.param('order_no')
  const body = await c.req.json()

  const shipCompany = body.ship_company
  const shipTrackingNo = body.ship_tracking_no

  if (!shipCompany || !shipTrackingNo) {
    return err('请填写物流公司和运单号', ERROR_CODE.VALIDATION_ERROR)
  }

  const order = await c.env.DB.prepare(
    'SELECT id, status FROM orders WHERE order_no = ?'
  )
    .bind(orderNo)
    .first<{ id: number; status: string }>()

  if (!order) {
    return err('订单不存在', ERROR_CODE.ORDER_NOT_FOUND, 404)
  }

  if (order.status !== ORDER_STATUS.PAID) {
    return err('只有已付款订单可以发货', ERROR_CODE.ORDER_STATUS_INVALID)
  }

  await c.env.DB.prepare(
    `UPDATE orders SET
       status = 'shipped',
       ship_company = ?,
       ship_tracking_no = ?,
       shipped_at = datetime('now'),
       updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(shipCompany, shipTrackingNo, order.id)
    .run()

  return ok(null)
})

// ============================================================
// PUT /:order_no/remark - 商家备注
// ============================================================
adminOrders.put('/:order_no/remark', async (c) => {
  const orderNo = c.req.param('order_no')
  const body = await c.req.json()
  const remark = body.remark

  if (remark === undefined) {
    return err('请填写备注内容', ERROR_CODE.VALIDATION_ERROR)
  }

  const result = await c.env.DB.prepare(
    `UPDATE orders SET seller_remark = ?, updated_at = datetime('now') WHERE order_no = ?`
  )
    .bind(remark, orderNo)
    .run()

  if (!result.meta.changes) {
    return err('订单不存在', ERROR_CODE.ORDER_NOT_FOUND, 404)
  }

  return ok(null)
})

export default adminOrders
