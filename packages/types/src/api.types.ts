export interface APIResponse<T> {
  success: boolean
  data: T | null
  error: APIError | null
  meta?: APIMeta
}

export interface APIError {
  code: string
  message: string
  details?: unknown
}

export interface APIMeta {
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PaginatedResponse<T> = APIResponse<T[]>

export enum FairBillErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  UNAUTHORIZED = 'UNAUTHORIZED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',
  PLAN_UPGRADE_REQUIRED = 'PLAN_UPGRADE_REQUIRED',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  OCR_FAILED = 'OCR_FAILED',
  AI_FAILED = 'AI_FAILED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
