import type { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service.js'
import { successResponse } from '../utils/response.js'
import { UnauthorizedError } from '../utils/errors.js'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName } = req.body as { email: string; password: string; fullName?: string }
      const result = await authService.register(email, password, fullName)
      return successResponse(res, result, 201)
    } catch (e) { next(e) }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email: string; password: string }
      const result = await authService.login(email, password)
      return successResponse(res, result)
    } catch (e) { next(e) }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      await authService.logout(req.user.userId)
      return successResponse(res, null)
    } catch (e) { next(e) }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as { refreshToken: string }
      if (!refreshToken) throw new UnauthorizedError('Missing refresh token')
      const result = await authService.refreshTokens(refreshToken)
      return successResponse(res, result)
    } catch (e) { next(e) }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const user = await authService.getMe(req.user.userId)
      return successResponse(res, user)
    } catch (e) { next(e) }
  },
}
