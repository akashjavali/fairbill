import type { Request, Response, NextFunction } from 'express'
import { userService } from '../services/user.service.js'
import { successResponse } from '../utils/response.js'
import { UnauthorizedError } from '../utils/errors.js'

export const userController = {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      return successResponse(res, await userService.getMe(req.user.userId))
    } catch (e) { next(e) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const { fullName, avatarUrl } = req.body as { fullName?: string; avatarUrl?: string }
      return successResponse(res, await userService.update(req.user.userId, { fullName, avatarUrl }))
    } catch (e) { next(e) }
  },

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      await userService.delete(req.user.userId)
      return successResponse(res, null)
    } catch (e) { next(e) }
  },

  async usage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      return successResponse(res, await userService.getUsage(req.user.userId))
    } catch (e) { next(e) }
  },
}
