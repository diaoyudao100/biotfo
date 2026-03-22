import { Hono } from 'hono'
import type { HonoEnv } from '../../types'
import { ok, err } from '../../utils/response'
import { authMiddleware, adminMiddleware } from '../../middleware/auth'
import { ERROR_CODE } from '@biotfo/shared'

const adminImages = new Hono<HonoEnv>()

// 所有图片管理路由需要 admin 权限
adminImages.use('*', authMiddleware, adminMiddleware)

// ============================================================
// PUT /upload - 上传图片到 R2
// ============================================================
adminImages.put('/upload', async (c) => {
  const contentType = c.req.header('Content-Type') || 'image/jpeg'

  // 生成唯一 key
  const ext = contentType.split('/')[1] || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const key = `images/${timestamp}-${random}.${ext}`

  // 从请求体直接流式写入 R2
  const body = await c.req.arrayBuffer()

  if (!body || body.byteLength === 0) {
    return err('请上传图片', ERROR_CODE.VALIDATION_ERROR)
  }

  // 限制文件大小 10MB
  if (body.byteLength > 10 * 1024 * 1024) {
    return err('图片大小不能超过 10MB', ERROR_CODE.VALIDATION_ERROR)
  }

  await c.env.ASSETS.put(key, body, {
    httpMetadata: {
      contentType,
    },
  })

  const assetsUrl = c.env.ASSETS_URL || ''
  const url = assetsUrl ? `${assetsUrl}/${key}` : key

  return ok({ key, url })
})

// ============================================================
// GET / - 图片列表
// ============================================================
adminImages.get('/', async (c) => {
  const prefix = c.req.query('prefix') || 'images/'
  const cursor = c.req.query('cursor') || undefined
  const limit = Math.min(100, parseInt(c.req.query('limit') || '') || 50)

  const listed = await c.env.ASSETS.list({
    prefix,
    cursor,
    limit,
  })

  const items = listed.objects.map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded.toISOString(),
    url: c.env.ASSETS_URL ? `${c.env.ASSETS_URL}/${obj.key}` : obj.key,
  }))

  return ok({
    items,
    cursor: listed.truncated ? listed.cursor : null,
    truncated: listed.truncated,
  })
})

// ============================================================
// DELETE /:key - 删除图片
// ============================================================
adminImages.delete('/:key{.+}', async (c) => {
  const key = c.req.param('key')

  // 检查是否存在
  const obj = await c.env.ASSETS.head(key)
  if (!obj) {
    return err('图片不存在', ERROR_CODE.NOT_FOUND, 404)
  }

  await c.env.ASSETS.delete(key)

  return ok(null)
})

export default adminImages
