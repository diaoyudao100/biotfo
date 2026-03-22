import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import { ok } from '../utils/response'
import type { Category } from '@biotfo/shared'

const categories = new Hono<HonoEnv>()

// ============================================================
// GET / - 获取分类树
// ============================================================
categories.get('/', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM categories WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC'
  ).all()

  const allCategories = (result.results || []) as unknown as Category[]
  const tree = buildCategoryTree(allCategories)

  return ok(tree)
})

/**
 * 递归构建分类树
 */
function buildCategoryTree(
  items: Category[],
  parentId: number | null = null
): Category[] {
  return items
    .filter((item) => item.parent_id === parentId)
    .map((item) => ({
      ...item,
      children: buildCategoryTree(items, item.id),
    }))
}

export default categories
