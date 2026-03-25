import type { Response } from 'express'
import type { APIResponse, PaginationMeta } from '@fairbill/types'

export function successResponse<T>(res: Response, data: T, statusCode = 200, meta?: { pagination?: PaginationMeta }) {
  const body: APIResponse<T> = { success: true, data, error: null, meta }
  return res.status(statusCode).json(body)
}

export function errorResponse(res: Response, statusCode: number, code: string, message: string, details?: unknown) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message, details },
  }
  return res.status(statusCode).json(body)
}
