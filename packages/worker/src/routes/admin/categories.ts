import { Hono } from 'hono'
import type { HonoEnv } from '../../types'
import { adminMiddleware } from '../../middleware/auth'
import { ok, err } from '../../utils/response'

const adminCategories = new Hono<HonoEnv>()

adminCategories.use('*', adminMiddleware)

// POST / - 创建分类
adminCategories.post('/', async (c) => {
  const body = await c.req.json()
  const { name, slug, icon, sort_order, parent_id, is_visible } = body

  if (!name || !slug) return err('名称和 slug 不能为空', 'VALIDATION_ERROR', 400)

  try {
    await c.env.DB.prepare(
      'INSERT INTO categories (name, slug, icon, sort_order, parent_id, is_visible) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, slug, icon || null, sort_order || 0, parent_id || null, is_visible ?? 1).run()

    return ok({ message: '创建成功' })
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return err('slug 已存在', 'VALIDATION_ERROR', 400)
    }
    throw e
  }
})

// PUT /:id - 编辑分类
adminCategories.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const { name, slug, icon, sort_order, parent_id, is_visible } = body

  if (!name || !slug) return err('名称和 slug 不能为空', 'VALIDATION_ERROR', 400)

  const result = await c.env.DB.prepare(
    'UPDATE categories SET name = ?, slug = ?, icon = ?, sort_order = ?, parent_id = ?, is_visible = ? WHERE id = ?'
  ).bind(name, slug, icon || null, sort_order || 0, parent_id || null, is_visible ?? 1, id).run()

  if (!result.meta.changes) return err('分类不存在', 'NOT_FOUND', 404)

  return ok({ message: '更新成功' })
})

// DELETE /:id - 删除分类
adminCategories.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))

  // 将子分类的 parent_id 设为 null
  await c.env.DB.prepare('UPDATE categories SET parent_id = NULL WHERE parent_id = ?').bind(id).run()

  const result = await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
  if (!result.meta.changes) return err('分类不存在', 'NOT_FOUND', 404)

  return ok({ message: '删除成功' })
})

export default adminCategories
