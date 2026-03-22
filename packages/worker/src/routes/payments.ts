import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import { ok, err } from '../utils/response'
import { authMiddleware } from '../middleware/auth'
import { createPaymentSchema, ERROR_CODE, ORDER_STATUS } from '@biotfo/shared'

const payments = new Hono<HonoEnv>()

// ============================================================
// POST /create - 发起支付
// ============================================================
payments.post('/create', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = createPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, ERROR_CODE.VALIDATION_ERROR)
  }

  const { order_no, channel } = parsed.data

  // 查询订单
  const order = await c.env.DB.prepare(
    'SELECT id, order_no, pay_amount, status FROM orders WHERE order_no = ? AND user_id = ?'
  )
    .bind(order_no, userId)
    .first<{ id: number; order_no: string; pay_amount: number; status: string }>()

  if (!order) {
    return err('订单不存在', ERROR_CODE.ORDER_NOT_FOUND, 404)
  }

  if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
    return err('订单状态不正确', ERROR_CODE.ORDER_STATUS_INVALID)
  }

  // 创建支付记录
  await c.env.DB.prepare(
    `INSERT INTO payment_records (order_id, order_no, pay_channel, pay_type, amount, status)
     VALUES (?, ?, ?, 'pay', ?, 'pending')`
  )
    .bind(order.id, order.order_no, channel, order.pay_amount)
    .run()

  // 模拟支付参数（预留微信/支付宝接口）
  // 在实际开发中，这里会调用微信/支付宝的下单 API
  if (channel === 'wechat') {
    return ok({
      channel: 'wechat',
      order_no: order.order_no,
      pay_amount: order.pay_amount,
      // 模拟微信支付参数
      pay_params: {
        appId: 'mock_app_id',
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: crypto.randomUUID().replace(/-/g, ''),
        package: `prepay_id=mock_prepay_${order.order_no}`,
        signType: 'RSA',
        paySign: 'mock_sign',
      },
    })
  }

  // 支付宝
  return ok({
    channel: 'alipay',
    order_no: order.order_no,
    pay_amount: order.pay_amount,
    pay_params: {
      trade_no: `mock_alipay_${order.order_no}`,
      pay_url: `https://mock.alipay.com/pay?order=${order.order_no}`,
    },
  })
})

// ============================================================
// POST /notify/wechat - 微信支付回调（骨架）
// ============================================================
payments.post('/notify/wechat', async (c) => {
  // TODO: 实现微信支付回调验签及处理
  // 1. 验证签名（使用 WECHAT_API_PRIVATE_KEY 和 WECHAT_CERT_SERIAL_NO）
  // 2. 解密通知数据
  // 3. 更新订单状态
  // 4. 更新支付记录

  try {
    const body = await c.req.text()

    // 骨架：实际需要验签
    // const signature = c.req.header('Wechatpay-Signature')
    // const timestamp = c.req.header('Wechatpay-Timestamp')
    // const nonce = c.req.header('Wechatpay-Nonce')

    console.log('[WechatPay Notify]', body)

    // 模拟处理：根据通知更新订单
    // 正式环境需要完整实现

    return c.json({ code: 'SUCCESS', message: '成功' })
  } catch (e) {
    console.error('[WechatPay Notify Error]', e)
    return c.json({ code: 'FAIL', message: '处理失败' }, 500)
  }
})

// ============================================================
// POST /notify/alipay - 支付宝回调（骨架）
// ============================================================
payments.post('/notify/alipay', async (c) => {
  // TODO: 实现支付宝回调验签及处理
  // 1. 验证签名（使用 ALIPAY_PRIVATE_KEY）
  // 2. 校验 app_id、金额等
  // 3. 更新订单状态
  // 4. 更新支付记录

  try {
    const body = await c.req.parseBody()

    console.log('[Alipay Notify]', body)

    // 骨架：实际需要验签和更新订单
    // 正式环境需要完整实现

    return c.text('success')
  } catch (e) {
    console.error('[Alipay Notify Error]', e)
    return c.text('fail', 500)
  }
})

// ============================================================
// GET /status/:order_no - 查询支付状态
// ============================================================
payments.get('/status/:order_no', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const orderNo = c.req.param('order_no')

  const order = await c.env.DB.prepare(
    'SELECT id, order_no, status, pay_channel, pay_trade_no, paid_at, pay_amount FROM orders WHERE order_no = ? AND user_id = ?'
  )
    .bind(orderNo, userId)
    .first()

  if (!order) {
    return err('订单不存在', ERROR_CODE.ORDER_NOT_FOUND, 404)
  }

  // 查询最新的支付记录
  const payRecord = await c.env.DB.prepare(
    "SELECT * FROM payment_records WHERE order_no = ? AND pay_type = 'pay' ORDER BY created_at DESC LIMIT 1"
  )
    .bind(orderNo)
    .first()

  return ok({
    order_no: order.order_no,
    order_status: order.status,
    pay_amount: order.pay_amount,
    pay_channel: order.pay_channel,
    pay_trade_no: order.pay_trade_no,
    paid_at: order.paid_at,
    payment_record: payRecord || null,
  })
})

export default payments
