import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { HonoEnv } from '../types'

/**
 * 创建 CORS 中间件
 * 允许来自 FRONTEND_URL 和 localhost:3000 的请求
 */
export function corsMiddleware() {
  return cors({
    origin: (origin, c) => {
      const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:3000'
      const allowedOrigins = [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:5173',
      ]
      if (allowedOrigins.includes(origin)) {
        return origin
      }
      return ''
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
}
