import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../../src/services/auth.service'
import { AppError, UnauthorizedError } from '../../../src/utils/errors'

const mockUserRepo = {
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  updateRefreshToken: vi.fn(),
  update: vi.fn(),
}

vi.mock('../../../src/config/database', () => ({ prisma: {} }))
vi.mock('../../../src/repositories/user.repository', () => ({
  UserRepository: vi.fn().mockImplementation(() => mockUserRepo),
}))
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}))
vi.mock('../../../src/utils/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('access_token'),
  signRefreshToken: vi.fn().mockReturnValue('refresh_token'),
  verifyRefreshToken: vi.fn(),
}))

import bcrypt from 'bcryptjs'
import * as jwt from '../../../src/utils/jwt'

const authService = new AuthService()

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('throws if email already taken', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' })
      await expect(
        authService.register({ email: 'test@example.com', password: 'Pass1234!', name: 'Test' })
      ).rejects.toThrow(AppError)
    })

    it('creates user and returns tokens', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockUserRepo.create.mockResolvedValue({
        id: 'user_1',
        email: 'new@example.com',
        name: 'New User',
        plan: 'free',
        monthlyAuditCount: 0,
        createdAt: new Date(),
      })
      mockUserRepo.updateRefreshToken.mockResolvedValue(undefined)

      const result = await authService.register({
        email: 'new@example.com',
        password: 'Pass1234!',
        name: 'New User',
      })

      expect(result.accessToken).toBe('access_token')
      expect(result.refreshToken).toBe('refresh_token')
      expect(mockUserRepo.create).toHaveBeenCalledOnce()
    })
  })

  describe('login', () => {
    it('throws if user not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)
      await expect(
        authService.login({ email: 'ghost@example.com', password: 'Pass1234!' })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('throws if password invalid', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        plan: 'free',
        monthlyAuditCount: 0,
        createdAt: new Date(),
      })
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPass' })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('returns tokens on valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        plan: 'free',
        monthlyAuditCount: 0,
        createdAt: new Date(),
      }
      mockUserRepo.findByEmail.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      mockUserRepo.updateRefreshToken.mockResolvedValue(undefined)

      const result = await authService.login({ email: 'test@example.com', password: 'Pass1234!' })
      expect(result.accessToken).toBe('access_token')
      expect(result.refreshToken).toBe('refresh_token')
    })
  })

  describe('refreshTokens', () => {
    it('throws if refresh token is invalid', async () => {
      vi.mocked(jwt.verifyRefreshToken).mockImplementation(() => {
        throw new Error('invalid token')
      })
      await expect(authService.refreshTokens('bad_token')).rejects.toThrow(UnauthorizedError)
    })

    it('throws if user not found', async () => {
      vi.mocked(jwt.verifyRefreshToken).mockReturnValue({ userId: 'ghost', plan: 'free' } as any)
      mockUserRepo.findById.mockResolvedValue(null)
      await expect(authService.refreshTokens('token')).rejects.toThrow(UnauthorizedError)
    })

    it('throws if stored hash does not match (reuse detection)', async () => {
      vi.mocked(jwt.verifyRefreshToken).mockReturnValue({ userId: '1', plan: 'free' } as any)
      mockUserRepo.findById.mockResolvedValue({
        id: '1',
        refreshTokenHash: 'different_hash',
        plan: 'free',
        monthlyAuditCount: 0,
        createdAt: new Date(),
      })
      await expect(authService.refreshTokens('some_token')).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('logout', () => {
    it('clears refresh token hash', async () => {
      mockUserRepo.updateRefreshToken.mockResolvedValue(undefined)
      await authService.logout('user_1')
      expect(mockUserRepo.updateRefreshToken).toHaveBeenCalledWith('user_1', null)
    })
  })
})
