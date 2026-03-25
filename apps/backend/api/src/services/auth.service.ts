import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { userRepository } from '../repositories/user.repository.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { AppError, UnauthorizedError } from '../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'
import type { UserDTO } from '@fairbill/types'
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

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: UserDTO
}

export const authService = {
  async register(email: string, password: string, fullName?: string): Promise<AuthTokens> {
    const existing = await userRepository.findByEmail(email)
    if (existing) {
      throw new AppError(FairBillErrorCode.EMAIL_ALREADY_EXISTS, 'Email already registered', 409)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await userRepository.create({ email, passwordHash, fullName, isVerified: false })

    const payload = { userId: user.id, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    await userRepository.updateRefreshToken(user.id, refreshHash)

    return { accessToken, refreshToken, user: toUserDTO(user) }
  },

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await userRepository.findByEmail(email)
    if (!user || !user.passwordHash) {
      throw new AppError(FairBillErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', 401)
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError(FairBillErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', 401)
    }

    const payload = { userId: user.id, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    await userRepository.updateRefreshToken(user.id, refreshHash)

    return { accessToken, refreshToken, user: toUserDTO(user) }
  },

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null)
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: { userId: string; email: string }
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new UnauthorizedError('Invalid refresh token')
    }

    const user = await userRepository.findById(payload.userId)
    if (!user?.refreshTokenHash) throw new UnauthorizedError('Session expired')

    const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    if (incomingHash !== user.refreshTokenHash) {
      // Token reuse — invalidate all sessions
      await userRepository.updateRefreshToken(user.id, null)
      throw new UnauthorizedError('Token reuse detected')
    }

    const newPayload = { userId: user.id, email: user.email }
    const newAccessToken = signAccessToken(newPayload)
    const newRefreshToken = signRefreshToken(newPayload)
    const newRefreshHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')
    await userRepository.updateRefreshToken(user.id, newRefreshHash)

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: toUserDTO(user) }
  },

  async getMe(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId)
    if (!user) throw new UnauthorizedError()
    return toUserDTO(user)
  },
}
