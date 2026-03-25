import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
})

export const auditLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, data: null, error: { code: 'RATE_LIMITED', message: 'Too many audit requests, please slow down.' } },
  standardHeaders: true,
  legacyHeaders: false,
})

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
