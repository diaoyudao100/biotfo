import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import { ok, err } from '../utils/response'
import { authMiddleware } from '../middleware/auth'
import { addressSchema, ERROR_CODE } from '@biotfo/shared'

const addresses = new Hono<HonoEnv>()

// 所有地址路由都需要登录
addresses.use('*', authMiddleware)

// ============================================================
// GET / - 地址列表
// ============================================================
addresses.get('/', async (c) => {
  const userId = c.get('userId')

  const result = await c.env.DB.prepare(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC'
  )
    .bind(userId)
    .all()

  return ok(result.results)
})

// ============================================================
// POST / - 新增地址
// ============================================================
addresses.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const { receiver_name, phone, province, city, district, detail, postal_code, is_default } =
    parsed.data

  // 如果设为默认，先取消其他默认地址
  if (is_default) {
    await c.env.DB.prepare(
      'UPDATE addresses SET is_default = 0 WHERE user_id = ?'
    )
      .bind(userId)
      .run()
  }

  // 如果是第一个地址，自动设为默认
  const count = await c.env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM addresses WHERE user_id = ?'
  )
    .bind(userId)
    .first<{ cnt: number }>()

  const setDefault = is_default || (count?.cnt === 0 ? 1 : 0)

  const result = await c.env.DB.prepare(
    `INSERT INTO addresses (user_id, receiver_name, phone, province, city, district, detail, postal_code, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(userId, receiver_name, phone, province, city, district, detail, postal_code || null, setDefault)
    .run()

  return ok({ id: result.meta.last_row_id })
})

// ============================================================
// PUT /:id - 修改地址
// ============================================================
addresses.put('/:id', async (c) => {
  const userId = c.get('userId')
  const addressId = parseInt(c.req.param('id'))

  const body = await c.req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  // 检查地址是否属于当前用户
  const existing = await c.env.DB.prepare(
    'SELECT id FROM addresses WHERE id = ? AND user_id = ?'
  )
    .bind(addressId, userId)
    .first()

  if (!existing) {
    return err('地址不存在', ERROR_CODE.NOT_FOUND, 404)
  }

  const { receiver_name, phone, province, city, district, detail, postal_code } =
    parsed.data

  await c.env.DB.prepare(
    `UPDATE addresses SET
       receiver_name = ?, phone = ?, province = ?, city = ?, district = ?,
       detail = ?, postal_code = ?, updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(receiver_name, phone, province, city, district, detail, postal_code || null, addressId)
    .run()

  return ok(null)
})

// ============================================================
// DELETE /:id - 删除地址
// ============================================================
addresses.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const addressId = parseInt(c.req.param('id'))

  const result = await c.env.DB.prepare(
    'DELETE FROM addresses WHERE id = ? AND user_id = ?'
  )
    .bind(addressId, userId)
    .run()

  if (!result.meta.changes) {
    return err('地址不存在', ERROR_CODE.NOT_FOUND, 404)
  }

  return ok(null)
})

// ============================================================
// PUT /:id/default - 设为默认
// ============================================================
addresses.put('/:id/default', async (c) => {
  const userId = c.get('userId')
  const addressId = parseInt(c.req.param('id'))

  // 检查地址是否属于当前用户
  const existing = await c.env.DB.prepare(
    'SELECT id FROM addresses WHERE id = ? AND user_id = ?'
  )
    .bind(addressId, userId)
    .first()

  if (!existing) {
    return err('地址不存在', ERROR_CODE.NOT_FOUND, 404)
  }

  // 取消所有默认，设置当前为默认
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').bind(userId),
    c.env.DB.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').bind(addressId),
  ])

  return ok(null)
})

export default addresses
