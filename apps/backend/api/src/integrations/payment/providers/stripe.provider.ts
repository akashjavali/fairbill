import Stripe from 'stripe'
import type { PaymentProvider, CreateOrderParams, ProviderOrder, VerifyParams, WebhookEvent } from '../payment.interface.js'

export class StripeProvider implements PaymentProvider {
  readonly provider = 'stripe' as const
  private client: Stripe

  constructor(
    private readonly secretKey: string,
    private readonly webhookSecret?: string
  ) {
    this.client = new Stripe(secretKey)
  }

  async createOrder(params: CreateOrderParams): Promise<ProviderOrder> {
    const paymentIntent = await this.client.paymentIntents.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency.toLowerCase(),
      metadata: params.metadata,
    })

    return {
      providerOrderId: paymentIntent.id,
      amount: params.amount,
      currency: params.currency,
    }
  }

  async verifyPayment(params: VerifyParams): Promise<boolean> {
    try {
      const intent = await this.client.paymentIntents.retrieve(params.providerOrderId)
      return intent.status === 'succeeded'
    } catch {
      return false
    }
  }

  async handleWebhook(body: Buffer, signature: string): Promise<WebhookEvent> {
    if (!this.webhookSecret) return { type: 'unknown' }
    try {
      const event = this.client.webhooks.constructEvent(body, signature, this.webhookSecret)
      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent
        return {
          type: 'payment.captured',
          providerPaymentId: intent.id,
          providerOrderId: intent.id,
        }
      }
      return { type: 'unknown' }
    } catch {
      return { type: 'unknown' }
    }
  }
}
