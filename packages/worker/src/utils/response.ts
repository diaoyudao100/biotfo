import type { ApiResponse } from '@biotfo/shared'

/**
 * 成功响应
 */
export function ok<T>(data?: T, status: number = 200): Response {
  const body: ApiResponse<T> = { success: true }
  if (data !== undefined) {
    body.data = data
  }
  return Response.json(body, { status })
}

/**
 * 错误响应
 */
export function err(
  message: string,
  code?: string,
  status: number = 400
): Response {
  const body: ApiResponse = {
    success: false,
    message,
    code,
  }
  return Response.json(body, { status })
}
