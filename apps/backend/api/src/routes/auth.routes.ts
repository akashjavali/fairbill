import { Router } from 'express'
import { z } from 'zod'
import { authController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { authLimiter } from '../middleware/rate-limit.middleware.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(100).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.post('/logout', authMiddleware, authController.logout)
router.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh)
router.get('/me', authMiddleware, authController.me)

export { router as authRoutes }
