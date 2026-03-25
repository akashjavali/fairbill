import { Router } from 'express'
import { z } from 'zod'
import express from 'express'
import { paymentController } from '../controllers/payment.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = Router()

const createOrderSchema = z.object({
  plan: z.enum(['pro', 'audit_single']),
  auditId: z.string().uuid().optional(),
})

const verifySchema = z.object({
  providerOrderId: z.string().min(1),
  providerPaymentId: z.string().min(1),
  signature: z.string().min(1),
})

// Webhook — raw body needed for signature verification
router.post('/webhook/razorpay', express.raw({ type: '*/*' }), paymentController.webhook)
router.post('/webhook/stripe', express.raw({ type: '*/*' }), paymentController.webhook)

// Auth required
router.use(authMiddleware)
router.post('/create-order', validate(createOrderSchema), paymentController.createOrder)
router.post('/verify', validate(verifySchema), paymentController.verify)
router.get('/history', paymentController.history)

export { router as paymentRoutes }
