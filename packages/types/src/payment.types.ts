export type PaymentProvider = 'razorpay' | 'stripe'

export type PaymentType = 'subscription' | 'one_time'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type PaymentPlan = 'pro' | 'audit_single'

export interface PaymentDTO {
  id: string
  userId: string
  auditId: string | null
  amount: number
  currency: string
  paymentType: PaymentType
  plan: PaymentPlan
  provider: PaymentProvider
  providerPaymentId: string
  providerOrderId: string
  status: PaymentStatus
  createdAt: string
}

export interface CreateOrderRequest {
  plan: PaymentPlan
  auditId?: string
}

export interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  provider: PaymentProvider
  providerOrderId: string
  keyId?: string
}

export interface VerifyPaymentRequest {
  orderId: string
  providerPaymentId: string
  signature: string
  provider: PaymentProvider
}
