/**
 * JWT 工具 - 使用 Web Crypto API 实现 HMAC-SHA256
 */

const DEFAULT_SECRET = 'biotfo-jwt-secret-change-me'

export interface JwtPayload {
  sub: number    // userId
  role: string   // 用户角色
  ct: string     // clientType
  exp: number    // 过期时间 (秒级时间戳)
  iat: number    // 签发时间
}

function base64UrlEncode(data: Uint8Array): string {
  const str = btoa(String.fromCharCode(...data))
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlEncodeStr(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str))
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (padded.length % 4)) % 4)
  const binary = atob(padded + padding)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * 签发 JWT
 * @param payload 载荷（不含 iat，会自动加上）
 * @param secret  密钥
 * @param expiresIn 过期时间（秒），默认 2 小时
 */
export async function signToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret?: string,
  expiresIn: number = 7200
): Promise<string> {
  const key = await getKey(secret || DEFAULT_SECRET)
  const now = Math.floor(Date.now() / 1000)

  const header = base64UrlEncodeStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncodeStr(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresIn })
  )

  const data = new TextEncoder().encode(`${header}.${body}`)
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, data))

  return `${header}.${body}.${base64UrlEncode(signature)}`
}

/**
 * 验证并解析 JWT
 * @returns 解析后的 payload，验证失败返回 null
 */
export async function verifyToken(
  token: string,
  secret?: string
): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const key = await getKey(secret || DEFAULT_SECRET)
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    const signature = base64UrlDecode(parts[2])

    const valid = await crypto.subtle.verify('HMAC', key, signature as BufferSource, data)
    if (!valid) return null

    const payload: JwtPayload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(parts[1]))
    )

    // 检查是否过期
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
