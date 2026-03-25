import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'
import { UnauthorizedError } from '../utils/errors.js'

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing authorization header')
  }

  const token = authHeader.slice(7)
  const payload = verifyAccessToken(token)
  req.user = { userId: payload.userId, email: payload.email }
  next()
}
