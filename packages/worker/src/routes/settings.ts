import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import { ok } from '../utils/response'

const settings = new Hono<HonoEnv>()

// GET / - 公开获取站点设置
settings.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT key, value FROM site_settings'
  ).all()

  const data: Record<string, string> = {}
  for (const row of results) {
    data[row.key as string] = row.value as string
  }

  return ok(data)
})

export default settings
