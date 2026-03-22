import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import type { HonoEnv } from '../types'
import { verifyToken } from '../utils/jwt'
import { err } from '../utils/response'
import { ERROR_CODE } from '@biotfo/shared'

/**
 * 从请求中提取 token（Cookie 优先，其次 Bearer Header）
 */
function extractToken(c: Context<HonoEnv>): string | null {
  // 1. 从 Cookie 获取
  const cookieToken = getCookie(c, 'access_token')
  if (cookieToken) return cookieToken

  // 2. 从 Authorization Header 获取
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  return null
}

/**
 * 认证中间件 - 必须登录
 */
export async function authMiddleware(c: Context<HonoEnv>, next: Next) {
  const token = extractToken(c)
  if (!token) {
    return err('请先登录', ERROR_CODE.UNAUTHORIZED, 401)
  }

  const secret = c.env.JWT_SECRET || 'biotfo-jwt-secret-change-me'
  const payload = await verifyToken(token, secret)
  if (!payload) {
    return err('登录已过期，请重新登录', ERROR_CODE.TOKEN_EXPIRED, 401)
  }

  c.set('userId', payload.sub)
  c.set('userRole', payload.role)
  c.set('clientType', payload.ct || 'web')

  await next()
}

/**
 * 管理员中间件 - 必须是 admin 角色（需配合 authMiddleware 使用）
 */
export async function adminMiddleware(c: Context<HonoEnv>, next: Next) {
  const role = c.get('userRole')
  if (role !== 'admin') {
    return err('无权限访问', ERROR_CODE.FORBIDDEN, 403)
  }

  await next()
}

/**
 * 可选认证中间件 - 有 token 就解析，没有也放行
 */
export async function optionalAuth(c: Context<HonoEnv>, next: Next) {
  const token = extractToken(c)
  if (token) {
    const secret = c.env.JWT_SECRET || 'biotfo-jwt-secret-change-me'
    const payload = await verifyToken(token, secret)
    if (payload) {
      c.set('userId', payload.sub)
      c.set('userRole', payload.role)
      c.set('clientType', payload.ct || 'web')
    }
  }

  await next()
}
