import type { Context } from 'hono'

export type Env = {
  DB: D1Database
  ASSETS: R2Bucket
  CACHE: KVNamespace
  JWT_SECRET: string
  FRONTEND_URL: string
  ASSETS_URL: string
  WECHAT_MCH_ID?: string
  WECHAT_API_PRIVATE_KEY?: string
  WECHAT_CERT_SERIAL_NO?: string
  ALIPAY_APP_ID?: string
  ALIPAY_PRIVATE_KEY?: string
}

export type HonoEnv = {
  Bindings: Env
  Variables: {
    userId: number
    userRole: string
    clientType: string
  }
}
