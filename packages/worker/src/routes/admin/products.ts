import { Hono } from 'hono'
import type { HonoEnv } from '../../types'
import { ok, err } from '../../utils/response'
import { authMiddleware, adminMiddleware } from '../../middleware/auth'
import { generateSkuCode } from '../../utils/id-gen'
import {
  createProductSchema,
  createSKUSchema,
  ERROR_CODE,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '@biotfo/shared'

const adminProducts = new Hono<HonoEnv>()

// 所有 admin 商品路由都需要 admin 权限
adminProducts.use('*', authMiddleware, adminMiddleware)

// ============================================================
// GET / - 商品列表（含草稿/下架）
// ============================================================
adminProducts.get('/', async (c) => {
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
    where += ' AND p.status = ?'
    params.push(status)
  }

  if (keyword) {
    where += ' AND (p.name LIKE ? OR p.slug LIKE ?)'
    const kw = `%${keyword}%`
    params.push(kw, kw)
  }

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM products p ${where}`
  )
    .bind(...params)
    .first<{ total: number }>()

  const total = countResult?.total || 0

  const listResult = await c.env.DB.prepare(
    `SELECT p.*,
            c.name AS category_name,
            b.name AS brand_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     ${where}
     ORDER BY p.updated_at DESC
     LIMIT ? OFFSET ?`
  )
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
// POST / - 创建商品（含 SKU）
// ============================================================
adminProducts.post('/', async (c) => {
  const body = await c.req.json()

  // 校验商品基础信息
  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  // 检查 slug 是否重复
  const existing = await c.env.DB.prepare(
    'SELECT id FROM products WHERE slug = ?'
  )
    .bind(parsed.data.slug)
    .first()

  if (existing) {
    return err('slug 已存在', ERROR_CODE.VALIDATION_ERROR)
  }

  // 创建商品
  const productResult = await c.env.DB.prepare(
    `INSERT INTO products (category_id, brand_id, name, slug, subtitle, description, main_image, status, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      parsed.data.category_id || null,
      parsed.data.brand_id || null,
      parsed.data.name,
      parsed.data.slug,
      parsed.data.subtitle || null,
      parsed.data.description || null,
      parsed.data.main_image,
      parsed.data.status || 'draft',
      parsed.data.is_featured || 0
    )
    .run()

  const productId = productResult.meta.last_row_id as number

  // 创建 SKU
  const skus = body.skus || []
  const skuStatements = []
  let priceMin = Infinity
  let priceMax = 0

  for (const skuData of skus) {
    const skuParsed = createSKUSchema.safeParse(skuData)
    if (!skuParsed.success) {
      continue
    }

    const sku = skuParsed.data
    const skuCode = sku.sku_code || generateSkuCode(productId)

    if (sku.price < priceMin) priceMin = sku.price
    if (sku.price > priceMax) priceMax = sku.price

    skuStatements.push(
      c.env.DB.prepare(
        `INSERT INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, image, weight)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        productId,
        skuCode,
        sku.spec_desc,
        sku.price,
        sku.original_price || null,
        sku.stock,
        sku.image || null,
        sku.weight || 0
      )
    )
  }

  // 创建商品图片
  const images = body.images || []
  for (let i = 0; i < images.length; i++) {
    skuStatements.push(
      c.env.DB.prepare(
        'INSERT INTO product_images (product_id, image_key, sort_order) VALUES (?, ?, ?)'
      ).bind(productId, images[i], i)
    )
  }

  // 创建规格
  const specs = body.specs || []
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]
    skuStatements.push(
      c.env.DB.prepare(
        'INSERT INTO spec_names (product_id, name, sort_order) VALUES (?, ?, ?)'
      ).bind(productId, spec.name, i)
    )
    // spec values 需要在 spec_name 创建后单独处理
  }

  // 更新价格范围
  if (priceMin !== Infinity) {
    skuStatements.push(
      c.env.DB.prepare(
        'UPDATE products SET price_min = ?, price_max = ? WHERE id = ?'
      ).bind(priceMin, priceMax, productId)
    )
  }

  if (skuStatements.length > 0) {
    await c.env.DB.batch(skuStatements)
  }

  // 处理规格值（需要先查出 spec_name_id）
  if (specs.length > 0) {
    const specNamesResult = await c.env.DB.prepare(
      'SELECT id, name FROM spec_names WHERE product_id = ? ORDER BY sort_order ASC'
    )
      .bind(productId)
      .all()

    const specValueStatements = []
    for (const specName of specNamesResult.results || []) {
      const matchedSpec = specs.find((s: any) => s.name === specName.name)
      if (matchedSpec?.values) {
        for (let j = 0; j < matchedSpec.values.length; j++) {
          specValueStatements.push(
            c.env.DB.prepare(
              'INSERT INTO spec_values (spec_name_id, value, sort_order) VALUES (?, ?, ?)'
            ).bind(specName.id, matchedSpec.values[j], j)
          )
        }
      }
    }

    if (specValueStatements.length > 0) {
      await c.env.DB.batch(specValueStatements)
    }
  }

  return ok({ id: productId }, 201)
})

// ============================================================
// PUT /:id - 编辑商品
// ============================================================
adminProducts.put('/:id', async (c) => {
  const productId = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const existing = await c.env.DB.prepare(
    'SELECT id FROM products WHERE id = ?'
  )
    .bind(productId)
    .first()

  if (!existing) {
    return err('商品不存在', ERROR_CODE.PRODUCT_NOT_FOUND, 404)
  }

  const updates: string[] = []
  const values: any[] = []

  const fields = [
    'category_id', 'brand_id', 'name', 'slug', 'subtitle',
    'description', 'main_image', 'is_featured', 'sort_order',
  ]

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`)
      values.push(body[field])
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')")
    values.push(productId)

    await c.env.DB.prepare(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...values)
      .run()
  }

  // 更新 SKU（如果提供了）
  if (body.skus && Array.isArray(body.skus)) {
    // 删除旧 SKU，插入新 SKU
    const statements: D1PreparedStatement[] = [
      c.env.DB.prepare('DELETE FROM skus WHERE product_id = ?').bind(productId),
    ]

    let priceMin = Infinity
    let priceMax = 0

    for (const skuData of body.skus) {
      const skuParsed = createSKUSchema.safeParse(skuData)
      if (!skuParsed.success) continue

      const sku = skuParsed.data
      const skuCode = sku.sku_code || generateSkuCode(productId)

      if (sku.price < priceMin) priceMin = sku.price
      if (sku.price > priceMax) priceMax = sku.price

      statements.push(
        c.env.DB.prepare(
          `INSERT INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, image, weight)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          productId, skuCode, sku.spec_desc, sku.price,
          sku.original_price || null, sku.stock, sku.image || null, sku.weight || 0
        )
      )
    }

    if (priceMin !== Infinity) {
      statements.push(
        c.env.DB.prepare(
          'UPDATE products SET price_min = ?, price_max = ? WHERE id = ?'
        ).bind(priceMin, priceMax, productId)
      )
    }

    await c.env.DB.batch(statements)
  }

  return ok(null)
})

// ============================================================
// PUT /:id/status - 上下架
// ============================================================
adminProducts.put('/:id/status', async (c) => {
  const productId = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const status = body.status

  if (!['draft', 'on_sale', 'off_sale'].includes(status)) {
    return err('无效的状态', ERROR_CODE.VALIDATION_ERROR)
  }

  const result = await c.env.DB.prepare(
    `UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?`
  )
    .bind(status, productId)
    .run()

  if (!result.meta.changes) {
    return err('商品不存在', ERROR_CODE.PRODUCT_NOT_FOUND, 404)
  }

  return ok(null)
})

// ============================================================
// DELETE /:id - 删除商品
// ============================================================
adminProducts.delete('/:id', async (c) => {
  const productId = parseInt(c.req.param('id'))

  const result = await c.env.DB.prepare(
    'DELETE FROM products WHERE id = ?'
  )
    .bind(productId)
    .run()

  if (!result.meta.changes) {
    return err('商品不存在', ERROR_CODE.PRODUCT_NOT_FOUND, 404)
  }

  return ok(null)
})

export default adminProducts
