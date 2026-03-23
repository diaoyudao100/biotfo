import { Hono } from 'hono'
import type { HonoEnv } from './types'
import { corsMiddleware } from './middleware/cors'
import { closeExpiredOrders } from './services/order.service'

// 路由
import auth from './routes/auth'
import products from './routes/products'
import categories from './routes/categories'
import cart from './routes/cart'
import addresses from './routes/addresses'
import orders from './routes/orders'
import payments from './routes/payments'
import adminProducts from './routes/admin/products'
import adminOrders from './routes/admin/orders'
import adminImages from './routes/admin/images'
import adminCategories from './routes/admin/categories'
import adminSettings from './routes/admin/settings'
import settings from './routes/settings'

const app = new Hono<HonoEnv>()

// 全局 CORS 中间件
app.use('*', corsMiddleware())

// 根路径 & 健康检查
app.get('/', (c) => c.json({ name: 'Brand Store API', version: 'v1', docs: '/api/v1' }))
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// R2 静态资源访问 (图片等)
app.get('/images/*', async (c) => {
  const key = c.req.path.slice(1) // 去掉开头的 /
  const object = await c.env.ASSETS.get(key)
  if (!object) {
    return c.json({ success: false, message: 'Not Found' }, 404)
  }
  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
})
app.get('/api/v1', (c) => c.json({
  success: true,
  data: {
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      cart: '/api/v1/cart',
      addresses: '/api/v1/addresses',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments',
      admin: '/api/v1/admin/*',
    }
  }
}))

// ============================================================
// API v1 路由
// ============================================================
const v1 = new Hono<HonoEnv>()

// 公开路由
v1.route('/auth', auth)
v1.route('/products', products)
v1.route('/categories', categories)
v1.route('/settings', settings)

// 需要登录的路由
v1.route('/cart', cart)
v1.route('/addresses', addresses)
v1.route('/orders', orders)
v1.route('/payments', payments)

// 管理后台路由
v1.route('/admin/products', adminProducts)
v1.route('/admin/orders', adminOrders)
v1.route('/admin/images', adminImages)
v1.route('/admin/categories', adminCategories)
v1.route('/admin/settings', adminSettings)

// 挂载 v1 到 /api/v1
app.route('/api/v1', v1)

// 404
app.notFound((c) =>
  c.json({ success: false, message: 'Not Found', code: 'NOT_FOUND' }, 404)
)

// 全局错误处理
app.onError((e, c) => {
  console.error('[Server Error]', e)
  return c.json(
    { success: false, message: '服务器内部错误', code: 'INTERNAL_ERROR' },
    500
  )
})

// ============================================================
// 导出
// ============================================================
export default {
  fetch: app.fetch,

  // Cron Trigger - 关闭超时未支付订单
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        try {
          const count = await closeExpiredOrders(env.DB)
          if (count > 0) {
            console.log(`[Cron] 已关闭 ${count} 个超时订单`)
          }
        } catch (e) {
          console.error('[Cron Error]', e)
        }
      })()
    )
  },
}
