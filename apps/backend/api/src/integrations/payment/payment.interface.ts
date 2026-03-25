export interface CreateOrderParams {
  amount: number
  currency: string
  userId: string
  planType: 'pro' | 'audit_single'
  metadata?: Record<string, string>
}

export interface ProviderOrder {
  providerOrderId: string
  amount: number
  currency: string
  keyId?: string
}

export interface VerifyParams {
  providerOrderId: string
  providerPaymentId: string
  signature: string
}

export interface WebhookEvent {
  type: 'payment.captured' | 'payment.failed' | 'order.paid' | 'unknown'
  providerPaymentId?: string
  providerOrderId?: string
  metadata?: Record<string, unknown>
}

export interface PaymentProvider {
  readonly provider: 'razorpay' | 'stripe'
  createOrder(params: CreateOrderParams): Promise<ProviderOrder>
  verifyPayment(params: VerifyParams): Promise<boolean>
  handleWebhook(body: Buffer, signature: string): Promise<WebhookEvent>
}
