import { generateOrderNo } from '../utils/id-gen'
import {
  ERROR_CODE,
  ORDER_STATUS,
  ORDER_EXPIRE_MS,
} from '@biotfo/shared'

interface CreateOrderInput {
  address_id: number
  cart_item_ids: number[]
  buyer_remark?: string
}

interface OrderResult {
  success: boolean
  data?: any
  message?: string
  code?: string
}

/**
 * 下单预览 - 校验库存和价格，返回预览数据（不创建订单）
 */
export async function previewOrder(
  db: D1Database,
  userId: number,
  input: CreateOrderInput
): Promise<OrderResult> {
  // 查询地址
  const address = await db
    .prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?')
    .bind(input.address_id, userId)
    .first()

  if (!address) {
    return { success: false, message: '收货地址不存在', code: ERROR_CODE.NOT_FOUND }
  }

  // 查询购物车项 + SKU + 商品信息
  const placeholders = input.cart_item_ids.map(() => '?').join(',')
  const cartResult = await db
    .prepare(
      `SELECT
         ci.id, ci.sku_id, ci.quantity,
         s.price, s.stock, s.spec_desc, s.image AS sku_image, s.is_enabled,
         p.id AS product_id, p.name AS product_name, p.main_image, p.status AS product_status
       FROM cart_items ci
       JOIN skus s ON ci.sku_id = s.id
       JOIN products p ON s.product_id = p.id
       WHERE ci.id IN (${placeholders}) AND ci.user_id = ?`
    )
    .bind(...input.cart_item_ids, userId)
    .all()

  const cartItems = cartResult.results || []

  if (cartItems.length === 0) {
    return { success: false, message: '购物车中没有选中的商品', code: ERROR_CODE.VALIDATION_ERROR }
  }

  if (cartItems.length !== input.cart_item_ids.length) {
    return { success: false, message: '部分购物车项不存在', code: ERROR_CODE.VALIDATION_ERROR }
  }

  // 检查库存和商品状态
  const items = []
  let totalAmount = 0

  for (const item of cartItems) {
    const ci = item as any

    if (ci.product_status !== 'on_sale') {
      return {
        success: false,
        message: `商品「${ci.product_name}」已下架`,
        code: ERROR_CODE.PRODUCT_OFF_SALE,
      }
    }

    if (!ci.is_enabled) {
      return {
        success: false,
        message: `商品「${ci.product_name}」规格已失效`,
        code: ERROR_CODE.SKU_NOT_FOUND,
      }
    }

    if (ci.quantity > ci.stock) {
      return {
        success: false,
        message: `商品「${ci.product_name}」库存不足（剩余 ${ci.stock} 件）`,
        code: ERROR_CODE.STOCK_INSUFFICIENT,
      }
    }

    const subtotal = ci.price * ci.quantity
    totalAmount += subtotal

    items.push({
      product_id: ci.product_id,
      sku_id: ci.sku_id,
      product_name: ci.product_name,
      sku_desc: ci.spec_desc,
      image: ci.sku_image || ci.main_image,
      price: ci.price,
      quantity: ci.quantity,
      subtotal,
    })
  }

  const freightAmount = 0 // 暂不计算运费
  const discountAmount = 0 // 暂不计算优惠
  const payAmount = totalAmount + freightAmount - discountAmount

  return {
    success: true,
    data: {
      items,
      address,
      total_amount: totalAmount,
      freight_amount: freightAmount,
      discount_amount: discountAmount,
      pay_amount: payAmount,
    },
  }
}

/**
 * 创建订单 - 使用 D1 batch 实现事务
 * 扣库存 + 建订单 + 建订单项 + 清购物车
 */
export async function createOrder(
  db: D1Database,
  userId: number,
  clientType: string,
  input: CreateOrderInput
): Promise<OrderResult> {
  // 先做一次预览检验
  const preview = await previewOrder(db, userId, input)
  if (!preview.success) {
    return preview
  }

  const { items, address, total_amount, freight_amount, discount_amount, pay_amount } =
    preview.data

  const orderNo = generateOrderNo()
  const addr = address as any
  const receiverAddress = `${addr.province}${addr.city}${addr.district}${addr.detail}`

  // 构建所有 SQL 语句
  const statements: D1PreparedStatement[] = []

  // 1. 扣减库存（使用 WHERE stock >= quantity 防超卖）
  for (const item of items) {
    statements.push(
      db
        .prepare(
          'UPDATE skus SET stock = stock - ? WHERE id = ? AND stock >= ?'
        )
        .bind(item.quantity, item.sku_id, item.quantity)
    )
  }

  // 2. 创建订单
  statements.push(
    db
      .prepare(
        `INSERT INTO orders (
          order_no, user_id, receiver_name, receiver_phone, receiver_address,
          total_amount, freight_amount, discount_amount, pay_amount,
          buyer_remark, client_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        orderNo,
        userId,
        addr.receiver_name,
        addr.phone,
        receiverAddress,
        total_amount,
        freight_amount,
        discount_amount,
        pay_amount,
        input.buyer_remark || null,
        clientType
      )
  )

  // 执行前半部分获取 order id
  const batchResults = await db.batch(statements)

  // 检查库存扣减是否都成功
  for (let i = 0; i < items.length; i++) {
    const result = batchResults[i]
    if (!result.meta.changes) {
      // 库存扣减失败 - 需要回滚
      // D1 batch 是事务性的，如果后续有失败，前面的也会回滚
      // 但如果已经提交了，需要手动回滚
      // 这里 batch 保证原子性，所以不会出现部分成功
      return {
        success: false,
        message: `商品「${items[i].product_name}」库存不足`,
        code: ERROR_CODE.STOCK_INSUFFICIENT,
      }
    }
  }

  // 获取新建的订单 ID
  const orderResult = batchResults[items.length]
  const orderId = orderResult.meta.last_row_id as number

  // 3. 创建订单项 + 4. 清除购物车 + 5. 更新销量
  const statements2: D1PreparedStatement[] = []

  for (const item of items) {
    statements2.push(
      db
        .prepare(
          `INSERT INTO order_items (order_id, product_id, sku_id, product_name, sku_desc, image, price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          orderId,
          item.product_id,
          item.sku_id,
          item.product_name,
          item.sku_desc,
          item.image,
          item.price,
          item.quantity,
          item.subtotal
        )
    )

    // 更新销量
    statements2.push(
      db
        .prepare(
          'UPDATE products SET sales_count = sales_count + ? WHERE id = ?'
        )
        .bind(item.quantity, item.product_id)
    )
  }

  // 清除已下单的购物车项
  const cartPlaceholders = input.cart_item_ids.map(() => '?').join(',')
  statements2.push(
    db
      .prepare(
        `DELETE FROM cart_items WHERE id IN (${cartPlaceholders}) AND user_id = ?`
      )
      .bind(...input.cart_item_ids, userId)
  )

  await db.batch(statements2)

  return {
    success: true,
    data: {
      order_no: orderNo,
      pay_amount,
    },
  }
}

/**
 * 取消订单 - 释放库存
 */
export async function cancelOrder(
  db: D1Database,
  orderNo: string,
  userId: number | null,
  reason: string
): Promise<OrderResult> {
  // 查询订单
  let orderQuery = 'SELECT id, status, user_id FROM orders WHERE order_no = ?'
  const orderParams: any[] = [orderNo]

  if (userId !== null) {
    orderQuery += ' AND user_id = ?'
    orderParams.push(userId)
  }

  const order = await db
    .prepare(orderQuery)
    .bind(...orderParams)
    .first<{ id: number; status: string; user_id: number }>()

  if (!order) {
    return { success: false, message: '订单不存在', code: ERROR_CODE.ORDER_NOT_FOUND }
  }

  // 只有 pending_payment 或 paid 状态可以取消
  if (
    order.status !== ORDER_STATUS.PENDING_PAYMENT &&
    order.status !== ORDER_STATUS.PAID
  ) {
    return {
      success: false,
      message: '当前状态不可取消',
      code: ERROR_CODE.ORDER_STATUS_INVALID,
    }
  }

  // 查询订单项，释放库存
  const itemsResult = await db
    .prepare('SELECT sku_id, quantity, product_id FROM order_items WHERE order_id = ?')
    .bind(order.id)
    .all()

  const statements: D1PreparedStatement[] = []

  // 释放库存 + 减少销量
  for (const item of itemsResult.results || []) {
    const oi = item as any
    statements.push(
      db
        .prepare('UPDATE skus SET stock = stock + ? WHERE id = ?')
        .bind(oi.quantity, oi.sku_id)
    )
    statements.push(
      db
        .prepare(
          'UPDATE products SET sales_count = MAX(0, sales_count - ?) WHERE id = ?'
        )
        .bind(oi.quantity, oi.product_id)
    )
  }

  // 更新订单状态
  statements.push(
    db
      .prepare(
        `UPDATE orders SET status = 'cancelled', cancel_reason = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .bind(reason, order.id)
  )

  await db.batch(statements)

  return { success: true }
}

/**
 * 关闭超时未支付订单 - Cron Trigger 调用
 */
export async function closeExpiredOrders(db: D1Database): Promise<number> {
  const expireTime = new Date(Date.now() - ORDER_EXPIRE_MS).toISOString()

  // 查询所有超时的 pending_payment 订单
  const expiredResult = await db
    .prepare(
      "SELECT id, order_no FROM orders WHERE status = 'pending_payment' AND created_at < ?"
    )
    .bind(expireTime)
    .all()

  const expiredOrders = expiredResult.results || []
  let closedCount = 0

  for (const order of expiredOrders) {
    const result = await cancelOrder(
      db,
      order.order_no as string,
      null,
      '超时未支付，系统自动关闭'
    )
    if (result.success) {
      closedCount++
    }
  }

  return closedCount
}
