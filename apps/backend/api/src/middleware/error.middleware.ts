import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import { errorResponse } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import { FairBillErrorCode } from '@fairbill/types'

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, 'Application error')
    }
    return errorResponse(res, err.statusCode, err.code, err.message, err.details)
  }

  // JWT errors
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, FairBillErrorCode.TOKEN_INVALID, 'Invalid token')
  }
  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, FairBillErrorCode.TOKEN_EXPIRED, 'Token expired')
  }

  logger.error({ err }, 'Unhandled error')
  return errorResponse(res, 500, FairBillErrorCode.INTERNAL_ERROR, 'Internal server error')
}
