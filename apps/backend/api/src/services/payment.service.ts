import { paymentRepository } from '../repositories/payment.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { getPaymentProvider } from '../integrations/payment/payment.factory.js'
import { AppError, NotFoundError } from '../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'
import { logger } from '../utils/logger.js'

const PLAN_PRICES: Record<string, { amount: number; currency: string }> = {
  pro: { amount: 499, currency: 'INR' },
  audit_single: { amount: 99, currency: 'INR' },
}

export const paymentService = {
  async createOrder(userId: string, plan: 'pro' | 'audit_single', auditId?: string) {
    const pricing = PLAN_PRICES[plan]
    if (!pricing) throw new AppError(FairBillErrorCode.PAYMENT_FAILED, 'Invalid plan', 400)

    const provider = getPaymentProvider()
    const order = await provider.createOrder({
      amount: pricing.amount,
      currency: pricing.currency,
      userId,
      planType: plan,
      metadata: { userId, plan, auditId: auditId ?? '' },
    })

    const payment = await paymentRepository.create({
      userId,
      auditId,
      amount: pricing.amount,
      currency: pricing.currency,
      paymentType: plan === 'pro' ? 'subscription' : 'one_time',
      plan,
      provider: provider.provider,
      providerOrderId: order.providerOrderId,
    })

    return {
      paymentId: payment.id,
      orderId: payment.id,
      amount: pricing.amount,
      currency: pricing.currency,
      provider: provider.provider,
      providerOrderId: order.providerOrderId,
      keyId: order.keyId,
    }
  },

  async verifyAndFulfill(userId: string, providerOrderId: string, providerPaymentId: string, signature: string) {
    const payment = await paymentRepository.findByProviderOrderId(providerOrderId)
    if (!payment) throw new NotFoundError('Payment')
    if (payment.userId !== userId) throw new AppError(FairBillErrorCode.FORBIDDEN, 'Forbidden', 403)
    if (payment.status === 'completed') return { alreadyFulfilled: true }

    const provider = getPaymentProvider()
    const valid = await provider.verifyPayment({ providerOrderId, providerPaymentId, signature })
    if (!valid) throw new AppError(FairBillErrorCode.PAYMENT_VERIFICATION_FAILED, 'Payment verification failed', 400)

    await paymentRepository.update(payment.id, {
      providerPaymentId,
      status: 'completed',
    })

    // Upgrade user plan
    if (payment.plan === 'pro') {
      await userRepository.update(userId, { plan: 'pro' })
    }

    logger.info({ userId, plan: payment.plan, paymentId: payment.id }, 'Payment fulfilled')
    return { alreadyFulfilled: false }
  },

  async getHistory(userId: string) {
    return paymentRepository.findByUserId(userId)
  },

  async handleWebhook(body: Buffer, signature: string) {
    const provider = getPaymentProvider()
    const event = await provider.handleWebhook(body, signature)

    if (event.type === 'payment.captured' && event.providerOrderId) {
      const payment = await paymentRepository.findByProviderOrderId(event.providerOrderId)
      if (payment && payment.status === 'pending') {
        await paymentRepository.update(payment.id, {
          providerPaymentId: event.providerPaymentId,
          status: 'completed',
        })
        if (payment.plan === 'pro') {
          await userRepository.update(payment.userId, { plan: 'pro' })
        }
        logger.info({ paymentId: payment.id }, 'Webhook: payment fulfilled')
      }
    }
  },
}
