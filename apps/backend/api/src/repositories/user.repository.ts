import type { User, Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export type CreateUserData = {
  email: string
  passwordHash?: string
  fullName?: string
  googleId?: string
  isVerified?: boolean
}

export type UpdateUserData = Partial<{
  passwordHash: string
  fullName: string
  avatarUrl: string
  plan: 'free' | 'pro'
  auditsUsedThisMonth: number
  auditsResetAt: Date
  isVerified: boolean
  refreshTokenHash: string | null
}>

export const userRepository = {
  findById: (id: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { id } }),

  findByEmail: (email: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { email } }),

  findByGoogleId: (googleId: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { googleId } }),

  create: (data: CreateUserData): Promise<User> =>
    prisma.user.create({ data }),

  update: (id: string, data: UpdateUserData): Promise<User> =>
    prisma.user.update({ where: { id }, data }),

  delete: (id: string): Promise<User> =>
    prisma.user.delete({ where: { id } }),

  updateRefreshToken: (id: string, hash: string | null): Promise<User> =>
    prisma.user.update({ where: { id }, data: { refreshTokenHash: hash } }),

  incrementAuditCount: (id: string): Promise<User> =>
    prisma.user.update({ where: { id }, data: { auditsUsedThisMonth: { increment: 1 } } }),

  resetMonthlyAuditCount: (id: string): Promise<User> =>
    prisma.user.update({
      where: { id },
      data: { auditsUsedThisMonth: 0, auditsResetAt: new Date() },
    }),
}
