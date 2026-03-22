/**
 * ID / 编号生成工具
 */

/**
 * 生成订单号
 * 格式: yyyyMMddHHmmss + 6位随机数
 * 例: 20260321143052123456
 */
export function generateOrderNo(): string {
  const now = new Date()
  const date =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')

  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')

  return `${date}${random}`
}

/**
 * 生成 SKU 编码
 * 格式: SKU-{productId}-{时间戳后6位}-{4位随机}
 */
export function generateSkuCode(productId: number): string {
  const ts = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `SKU-${productId}-${ts}-${random}`
}
