import { userRepository } from '../repositories/user.repository.js'
import { NotFoundError } from '../utils/errors.js'
import { FREE_PLAN_AUDIT_LIMIT } from '../config/constants.js'
import type { UserDTO, UserUsageDTO } from '@fairbill/types'
import type { User } from '@prisma/client'

function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    plan: user.plan as 'free' | 'pro',
    auditsUsedThisMonth: user.auditsUsedThisMonth,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export const userService = {
  async getMe(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('User')
    return toUserDTO(user)
  },

  async update(userId: string, data: { fullName?: string; avatarUrl?: string }): Promise<UserDTO> {
    const user = await userRepository.update(userId, data)
    return toUserDTO(user)
  },

  async delete(userId: string): Promise<void> {
    await userRepository.delete(userId)
  },

  async getUsage(userId: string): Promise<UserUsageDTO> {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('User')
    return {
      plan: user.plan as 'free' | 'pro',
      auditsUsedThisMonth: user.auditsUsedThisMonth,
      auditsLimit: user.plan === 'pro' ? Infinity : FREE_PLAN_AUDIT_LIMIT,
      auditsResetAt: user.auditsResetAt?.toISOString() ?? null,
    }
  },
}
