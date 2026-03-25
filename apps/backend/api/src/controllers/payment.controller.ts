import type { Request, Response, NextFunction } from 'express'
import { paymentService } from '../services/payment.service.js'
import { successResponse } from '../utils/response.js'
import { UnauthorizedError } from '../utils/errors.js'

export const paymentController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const { plan, auditId } = req.body as { plan: 'pro' | 'audit_single'; auditId?: string }
      const result = await paymentService.createOrder(req.user.userId, plan, auditId)
      return successResponse(res, result, 201)
    } catch (e) { next(e) }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const { providerOrderId, providerPaymentId, signature } = req.body as {
        providerOrderId: string
        providerPaymentId: string
        signature: string
      }
      const result = await paymentService.verifyAndFulfill(req.user.userId, providerOrderId, providerPaymentId, signature)
      return successResponse(res, result)
    } catch (e) { next(e) }
  },

  async history(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const payments = await paymentService.getHistory(req.user.userId)
      return successResponse(res, payments)
    } catch (e) { next(e) }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers['x-razorpay-signature'] ?? req.headers['stripe-signature'] ?? '') as string
      await paymentService.handleWebhook(req.body as Buffer, signature)
      return res.status(200).json({ received: true })
    } catch (e) { next(e) }
  },
}
