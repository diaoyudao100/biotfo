import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import { ok, err } from '../utils/response'
import { authMiddleware } from '../middleware/auth'
import {
  addCartSchema,
  updateCartSchema,
  ERROR_CODE,
} from '@biotfo/shared'

const cart = new Hono<HonoEnv>()

// 所有购物车路由都需要登录
cart.use('*', authMiddleware)

// ============================================================
// GET / - 获取购物车列表
// ============================================================
cart.get('/', async (c) => {
  const userId = c.get('userId')

  const result = await c.env.DB.prepare(
    `SELECT
       ci.id, ci.sku_id, ci.quantity, ci.selected,
       s.price, s.stock, s.spec_desc AS sku_desc, s.image AS sku_image,
       p.id AS product_id, p.name AS product_name, p.slug AS product_slug,
       p.main_image, p.status AS product_status
     FROM cart_items ci
     JOIN skus s ON ci.sku_id = s.id
     JOIN products p ON s.product_id = p.id
     WHERE ci.user_id = ?
     ORDER BY ci.updated_at DESC`
  )
    .bind(userId)
    .all()

  const items = (result.results || []).map((item: any) => ({
    id: item.id,
    sku_id: item.sku_id,
    quantity: item.quantity,
    selected: item.selected,
    price: item.price,
    stock: item.stock,
    sku_desc: item.sku_desc,
    image: item.sku_image || item.main_image,
    product_id: item.product_id,
    product_name: item.product_name,
    product_slug: item.product_slug,
    product_status: item.product_status,
  }))

  return ok(items)
})

// ============================================================
// POST / - 添加商品到购物车（已有则增加数量）
// ============================================================
cart.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = addCartSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const { sku_id, quantity } = parsed.data

  // 检查 SKU 是否存在且可用
  const sku = await c.env.DB.prepare(
    `SELECT s.id, s.stock, s.is_enabled, p.status AS product_status
     FROM skus s
     JOIN products p ON s.product_id = p.id
     WHERE s.id = ?`
  )
    .bind(sku_id)
    .first<{ id: number; stock: number; is_enabled: number; product_status: string }>()

  if (!sku) {
    return err('商品规格不存在', ERROR_CODE.SKU_NOT_FOUND, 404)
  }

  if (!sku.is_enabled || sku.product_status !== 'on_sale') {
    return err('商品已下架', ERROR_CODE.PRODUCT_OFF_SALE)
  }

  // 检查购物车是否已存在
  const existing = await c.env.DB.prepare(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND sku_id = ?'
  )
    .bind(userId, sku_id)
    .first<{ id: number; quantity: number }>()

  if (existing) {
    const newQty = existing.quantity + quantity
    if (newQty > sku.stock) {
      return err('库存不足', ERROR_CODE.STOCK_INSUFFICIENT)
    }

    await c.env.DB.prepare(
      "UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(newQty, existing.id)
      .run()

    return ok({ id: existing.id, quantity: newQty })
  }

  if (quantity > sku.stock) {
    return err('库存不足', ERROR_CODE.STOCK_INSUFFICIENT)
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO cart_items (user_id, sku_id, quantity) VALUES (?, ?, ?)'
  )
    .bind(userId, sku_id, quantity)
    .run()

  return ok({ id: result.meta.last_row_id, quantity })
})

// ============================================================
// PUT /:id - 修改数量/勾选状态
// ============================================================
cart.put('/:id', async (c) => {
  const userId = c.get('userId')
  const itemId = parseInt(c.req.param('id'))

  const body = await c.req.json()
  const parsed = updateCartSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  // 检查是否属于当前用户
  const item = await c.env.DB.prepare(
    'SELECT id, sku_id FROM cart_items WHERE id = ? AND user_id = ?'
  )
    .bind(itemId, userId)
    .first<{ id: number; sku_id: number }>()

  if (!item) {
    return err('购物车项不存在', ERROR_CODE.NOT_FOUND, 404)
  }

  const updates: string[] = []
  const values: any[] = []

  if (parsed.data.quantity !== undefined) {
    // 检查库存
    const sku = await c.env.DB.prepare('SELECT stock FROM skus WHERE id = ?')
      .bind(item.sku_id)
      .first<{ stock: number }>()

    if (sku && parsed.data.quantity > sku.stock) {
      return err('库存不足', ERROR_CODE.STOCK_INSUFFICIENT)
    }

    updates.push('quantity = ?')
    values.push(parsed.data.quantity)
  }

  if (parsed.data.selected !== undefined) {
    updates.push('selected = ?')
    values.push(parsed.data.selected)
  }

  if (updates.length === 0) {
    return err('没有需要更新的字段', ERROR_CODE.VALIDATION_ERROR)
  }

  updates.push("updated_at = datetime('now')")
  values.push(itemId)

  await c.env.DB.prepare(
    `UPDATE cart_items SET ${updates.join(', ')} WHERE id = ?`
  )
    .bind(...values)
    .run()

  return ok(null)
})

// ============================================================
// DELETE /:id - 删除单项
// ============================================================
cart.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const itemId = parseInt(c.req.param('id'))

  const result = await c.env.DB.prepare(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?'
  )
    .bind(itemId, userId)
    .run()

  if (!result.meta.changes) {
    return err('购物车项不存在', ERROR_CODE.NOT_FOUND, 404)
  }

  return ok(null)
})

export default cart
