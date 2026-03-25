import type { PaymentProvider } from './payment.interface.js'
import { RazorpayProvider } from './providers/razorpay.provider.js'
import { StripeProvider } from './providers/stripe.provider.js'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'

let instance: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance

  switch (env.PAYMENT_PROVIDER) {
    case 'stripe':
      if (!env.STRIPE_SECRET_KEY) throw new AppError(FairBillErrorCode.PAYMENT_FAILED, 'STRIPE_SECRET_KEY not configured', 500)
      instance = new StripeProvider(env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET)
      break
    case 'razorpay':
    default:
      if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new AppError(FairBillErrorCode.PAYMENT_FAILED, 'Razorpay credentials not configured', 500)
      }
      instance = new RazorpayProvider(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET, env.STRIPE_WEBHOOK_SECRET)
  }

  return instance
}
