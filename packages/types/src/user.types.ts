export type UserPlan = 'free' | 'pro'

export interface UserDTO {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  plan: UserPlan
  auditsUsedThisMonth: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserDTO {
  fullName?: string
  avatarUrl?: string
}

export interface UserUsageDTO {
  plan: UserPlan
  auditsUsedThisMonth: number
  auditsLimit: number
  auditsResetAt: string | null
}
