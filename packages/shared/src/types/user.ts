// ============================================================
// 用户相关类型
// ============================================================

export interface User {
  id: number
  phone: string | null
  email: string | null
  nickname: string
  avatar: string | null
  gender: Gender
  role: UserRole
  status: UserStatus
  member_level: MemberLevel
  points: number
  total_spent: number
  created_at: string
  updated_at: string
}

export type UserRole = 'customer' | 'admin'
export type UserStatus = 'active' | 'disabled'
export type Gender = 0 | 1 | 2 // 0=未知 1=男 2=女
export type MemberLevel = 0 | 1 | 2 | 3 // 0=普通 1=银卡 2=金卡 3=钻石

export interface UserOAuth {
  id: number
  user_id: number
  provider: OAuthProvider
  open_id: string
  union_id: string | null
  created_at: string
}

export type OAuthProvider = 'wechat_mp' | 'wechat_app' | 'wechat_mini' | 'alipay'

export interface Address {
  id: number
  user_id: number
  receiver_name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  postal_code: string | null
  is_default: number
  created_at: string
  updated_at: string
}
