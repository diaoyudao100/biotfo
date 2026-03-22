import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import type { HonoEnv } from '../types'
import { ok, err } from '../utils/response'
import { signToken, verifyToken } from '../utils/jwt'
import { hashPassword, verifyPassword } from '../utils/password'
import { authMiddleware } from '../middleware/auth'
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  ERROR_CODE,
} from '@biotfo/shared'

const auth = new Hono<HonoEnv>()

// Cookie 设置
function setTokenCookie(c: any, name: string, token: string, maxAge: number) {
  setCookie(c, name, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    maxAge,
  })
}

// ============================================================
// POST /register - 手机号注册
// ============================================================
auth.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const { phone, password, nickname } = parsed.data

  // 检查手机号是否已注册
  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE phone = ?'
  )
    .bind(phone)
    .first()

  if (existing) {
    return err('该手机号已注册', ERROR_CODE.PHONE_EXISTS)
  }

  const passwordHash = await hashPassword(password)
  const userNickname = nickname || `用户${phone.slice(-4)}`

  const result = await c.env.DB.prepare(
    'INSERT INTO users (phone, password_hash, nickname) VALUES (?, ?, ?)'
  )
    .bind(phone, passwordHash, userNickname)
    .run()

  const userId = result.meta.last_row_id as number
  const secret = c.env.JWT_SECRET || 'biotfo-jwt-secret-change-me'

  // 签发 access token (2小时)
  const accessToken = await signToken(
    { sub: userId, role: 'customer', ct: 'web' },
    secret,
    7200
  )

  // 签发 refresh token (7天)
  const refreshToken = await signToken(
    { sub: userId, role: 'customer', ct: 'web' },
    secret,
    7 * 24 * 3600
  )

  // 存储 refresh token hash
  const refreshHash = await hashRefreshToken(refreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  await c.env.DB.prepare(
    'INSERT INTO refresh_tokens (user_id, token_hash, client_type, expires_at) VALUES (?, ?, ?, ?)'
  )
    .bind(userId, refreshHash, 'web', expiresAt)
    .run()

  setTokenCookie(c, 'access_token', accessToken, 7200)
  setTokenCookie(c, 'refresh_token', refreshToken, 7 * 24 * 3600)

  return ok({
    user: { id: userId, phone, nickname: userNickname, role: 'customer' },
    access_token: accessToken,
  })
})

// ============================================================
// POST /login - 手机号密码登录
// ============================================================
auth.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const { phone, password } = parsed.data

  const user = await c.env.DB.prepare(
    'SELECT id, phone, password_hash, nickname, avatar, gender, role, status FROM users WHERE phone = ?'
  )
    .bind(phone)
    .first<{
      id: number
      phone: string
      password_hash: string
      nickname: string
      avatar: string | null
      gender: number
      role: string
      status: string
    }>()

  if (!user) {
    return err('手机号或密码错误', ERROR_CODE.INVALID_CREDENTIALS, 401)
  }

  if (user.status === 'disabled') {
    return err('账号已被禁用', ERROR_CODE.ACCOUNT_DISABLED, 403)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return err('手机号或密码错误', ERROR_CODE.INVALID_CREDENTIALS, 401)
  }

  const secret = c.env.JWT_SECRET || 'biotfo-jwt-secret-change-me'

  const accessToken = await signToken(
    { sub: user.id, role: user.role, ct: 'web' },
    secret,
    7200
  )

  const refreshToken = await signToken(
    { sub: user.id, role: user.role, ct: 'web' },
    secret,
    7 * 24 * 3600
  )

  const refreshHash = await hashRefreshToken(refreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  await c.env.DB.prepare(
    'INSERT INTO refresh_tokens (user_id, token_hash, client_type, expires_at) VALUES (?, ?, ?, ?)'
  )
    .bind(user.id, refreshHash, 'web', expiresAt)
    .run()

  setTokenCookie(c, 'access_token', accessToken, 7200)
  setTokenCookie(c, 'refresh_token', refreshToken, 7 * 24 * 3600)

  return ok({
    user: {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      role: user.role,
    },
    access_token: accessToken,
  })
})

// ============================================================
// POST /refresh - 刷新 token
// ============================================================
auth.post('/refresh', async (c) => {
  const refreshToken =
    (await c.req.json().then((b) => b.refresh_token).catch(() => null)) ||
    (await import('hono/cookie').then(({ getCookie }) => getCookie(c, 'refresh_token')))

  if (!refreshToken) {
    return err('缺少 refresh token', ERROR_CODE.UNAUTHORIZED, 401)
  }

  const secret = c.env.JWT_SECRET || 'biotfo-jwt-secret-change-me'
  const payload = await verifyToken(refreshToken, secret)
  if (!payload) {
    return err('refresh token 已过期', ERROR_CODE.TOKEN_EXPIRED, 401)
  }

  // 校验 refresh token 是否在数据库中
  const refreshHash = await hashRefreshToken(refreshToken)
  const stored = await c.env.DB.prepare(
    'SELECT id FROM refresh_tokens WHERE user_id = ? AND token_hash = ?'
  )
    .bind(payload.sub, refreshHash)
    .first()

  if (!stored) {
    return err('refresh token 无效', ERROR_CODE.UNAUTHORIZED, 401)
  }

  // 删除旧 refresh token
  await c.env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?')
    .bind(stored.id)
    .run()

  // 签发新 token
  const accessToken = await signToken(
    { sub: payload.sub, role: payload.role, ct: payload.ct },
    secret,
    7200
  )

  const newRefreshToken = await signToken(
    { sub: payload.sub, role: payload.role, ct: payload.ct },
    secret,
    7 * 24 * 3600
  )

  const newRefreshHash = await hashRefreshToken(newRefreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  await c.env.DB.prepare(
    'INSERT INTO refresh_tokens (user_id, token_hash, client_type, expires_at) VALUES (?, ?, ?, ?)'
  )
    .bind(payload.sub, newRefreshHash, payload.ct, expiresAt)
    .run()

  setTokenCookie(c, 'access_token', accessToken, 7200)
  setTokenCookie(c, 'refresh_token', newRefreshToken, 7 * 24 * 3600)

  return ok({ access_token: accessToken })
})

// ============================================================
// POST /logout - 注销
// ============================================================
auth.post('/logout', authMiddleware, async (c) => {
  const userId = c.get('userId')

  // 删除该用户所有 refresh token
  await c.env.DB.prepare('DELETE FROM refresh_tokens WHERE user_id = ?')
    .bind(userId)
    .run()

  deleteCookie(c, 'access_token', { path: '/' })
  deleteCookie(c, 'refresh_token', { path: '/' })

  return ok(null)
})

// ============================================================
// GET /me - 获取当前用户信息
// ============================================================
auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const user = await c.env.DB.prepare(
    'SELECT id, phone, email, nickname, avatar, gender, role, status, member_level, points, total_spent, created_at FROM users WHERE id = ?'
  )
    .bind(userId)
    .first()

  if (!user) {
    return err('用户不存在', ERROR_CODE.NOT_FOUND, 404)
  }

  return ok(user)
})

// ============================================================
// PUT /me - 更新个人信息
// ============================================================
auth.put('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const updates: string[] = []
  const values: any[] = []

  if (parsed.data.nickname !== undefined) {
    updates.push('nickname = ?')
    values.push(parsed.data.nickname)
  }
  if (parsed.data.avatar !== undefined) {
    updates.push('avatar = ?')
    values.push(parsed.data.avatar)
  }
  if (parsed.data.gender !== undefined) {
    updates.push('gender = ?')
    values.push(parsed.data.gender)
  }

  if (updates.length === 0) {
    return err('没有需要更新的字段', ERROR_CODE.VALIDATION_ERROR)
  }

  updates.push("updated_at = datetime('now')")
  values.push(userId)

  await c.env.DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
  )
    .bind(...values)
    .run()

  const user = await c.env.DB.prepare(
    'SELECT id, phone, email, nickname, avatar, gender, role, status, member_level, points, total_spent, created_at FROM users WHERE id = ?'
  )
    .bind(userId)
    .first()

  return ok(user)
})

// ============================================================
// 辅助函数 - 哈希 refresh token
// ============================================================
async function hashRefreshToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default auth
