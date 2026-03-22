import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import { ok, err } from '../utils/response'
import {
  ERROR_CODE,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  PRODUCT_STATUS,
} from '@biotfo/shared'
import type { Product } from '@biotfo/shared'

const products = new Hono<HonoEnv>()

// ============================================================
// GET / - 商品列表（公开）
// 支持分页、分类筛选、品牌筛选、价格范围、排序
// ============================================================
products.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '') || DEFAULT_PAGE)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(c.req.query('limit') || '') || DEFAULT_LIMIT)
  )
  const offset = (page - 1) * limit

  const category = c.req.query('category')
  const brand = c.req.query('brand')
  const sort = c.req.query('sort')
  const priceMin = c.req.query('price_min')
  const priceMax = c.req.query('price_max')
  const keyword = c.req.query('keyword')

  let where = "WHERE p.status = 'on_sale'"
  const params: any[] = []

  if (category) {
    where += ' AND c.slug = ?'
    params.push(category)
  }

  if (brand) {
    where += ' AND b.slug = ?'
    params.push(brand)
  }

  if (priceMin) {
    where += ' AND p.price_min >= ?'
    params.push(parseInt(priceMin))
  }

  if (priceMax) {
    where += ' AND p.price_max <= ?'
    params.push(parseInt(priceMax))
  }

  if (keyword) {
    where += ' AND (p.name LIKE ? OR p.subtitle LIKE ?)'
    const kw = `%${keyword}%`
    params.push(kw, kw)
  }

  let orderBy = 'ORDER BY p.sort_order ASC, p.id DESC'
  switch (sort) {
    case 'price_asc':
      orderBy = 'ORDER BY p.price_min ASC'
      break
    case 'price_desc':
      orderBy = 'ORDER BY p.price_min DESC'
      break
    case 'sales':
      orderBy = 'ORDER BY p.sales_count DESC'
      break
    case 'newest':
      orderBy = 'ORDER BY p.created_at DESC'
      break
  }

  // 查询总数
  const countSql = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    ${where}
  `
  const countResult = await c.env.DB.prepare(countSql)
    .bind(...params)
    .first<{ total: number }>()
  const total = countResult?.total || 0

  // 查询列表
  const listSql = `
    SELECT p.*,
           c.name AS category_name, c.slug AS category_slug,
           b.name AS brand_name, b.slug AS brand_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    ${where}
    ${orderBy}
    LIMIT ? OFFSET ?
  `
  const listResult = await c.env.DB.prepare(listSql)
    .bind(...params, limit, offset)
    .all()

  return ok({
    list: listResult.results,
    total,
    page,
    limit,
  })
})

// ============================================================
// GET /:slug - 商品详情（公开）
// 含 SKU 列表、规格、图片
// ============================================================
products.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  // 查商品
  const product = await c.env.DB.prepare(
    `SELECT p.*,
            c.name AS category_name, c.slug AS category_slug,
            b.name AS brand_name, b.slug AS brand_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     WHERE p.slug = ? AND p.status = 'on_sale'`
  )
    .bind(slug)
    .first()

  if (!product) {
    return err('商品不存在', ERROR_CODE.PRODUCT_NOT_FOUND, 404)
  }

  // 并行查询关联数据
  const [skuResult, imageResult, specResult] = await Promise.all([
    c.env.DB.prepare(
      'SELECT * FROM skus WHERE product_id = ? AND is_enabled = 1 ORDER BY id ASC'
    )
      .bind(product.id)
      .all(),
    c.env.DB.prepare(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC'
    )
      .bind(product.id)
      .all(),
    c.env.DB.prepare(
      'SELECT * FROM spec_names WHERE product_id = ? ORDER BY sort_order ASC'
    )
      .bind(product.id)
      .all(),
  ])

  // 查询每个 spec_name 的 values
  let specNames = specResult.results || []
  if (specNames.length > 0) {
    const specIds = specNames.map((s: any) => s.id)
    const placeholders = specIds.map(() => '?').join(',')
    const valuesResult = await c.env.DB.prepare(
      `SELECT * FROM spec_values WHERE spec_name_id IN (${placeholders}) ORDER BY sort_order ASC`
    )
      .bind(...specIds)
      .all()

    const valuesMap = new Map<number, any[]>()
    for (const v of valuesResult.results || []) {
      const list = valuesMap.get(v.spec_name_id as number) || []
      list.push(v)
      valuesMap.set(v.spec_name_id as number, list)
    }

    specNames = specNames.map((s: any) => ({
      ...s,
      values: valuesMap.get(s.id) || [],
    }))
  }

  return ok({
    ...product,
    skus: skuResult.results,
    images: imageResult.results,
    spec_names: specNames,
  })
})

export default products
