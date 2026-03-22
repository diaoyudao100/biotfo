import { Hono } from 'hono'
import type { HonoEnv } from '../../types'
import { adminMiddleware } from '../../middleware/auth'
import { ok, err } from '../../utils/response'

const adminSettings = new Hono<HonoEnv>()

adminSettings.use('*', adminMiddleware)

// GET / - 获取所有设置
adminSettings.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT key, value FROM site_settings'
  ).all()

  const settings: Record<string, string> = {}
  for (const row of results) {
    settings[row.key as string] = row.value as string
  }

  return ok(settings)
})

// PUT / - 批量更新设置
adminSettings.put('/', async (c) => {
  const body = await c.req.json<Record<string, string>>()

  if (!body || typeof body !== 'object') {
    return err('请求格式错误', 'VALIDATION_ERROR', 400)
  }

  const stmts = Object.entries(body).map(([key, value]) =>
    c.env.DB.prepare(
      `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).bind(key, String(value))
  )

  if (stmts.length > 0) {
    await c.env.DB.batch(stmts)
  }

  return ok({ message: '保存成功' })
})

export default adminSettings
