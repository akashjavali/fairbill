import Razorpay from 'razorpay'
import crypto from 'crypto'
import type { PaymentProvider, CreateOrderParams, ProviderOrder, VerifyParams, WebhookEvent } from '../payment.interface.js'

export class RazorpayProvider implements PaymentProvider {
  readonly provider = 'razorpay' as const
  private client: Razorpay

  constructor(
    private readonly keyId: string,
    private readonly keySecret: string,
    private readonly webhookSecret?: string
  ) {
    this.client = new Razorpay({ key_id: keyId, key_secret: keySecret })
  }

  async createOrder(params: CreateOrderParams): Promise<ProviderOrder> {
    const order = await this.client.orders.create({
      amount: Math.round(params.amount * 100), // paise
      currency: params.currency,
      notes: params.metadata,
    })

    return {
      providerOrderId: order.id,
      amount: params.amount,
      currency: params.currency,
      keyId: this.keyId,
    }
  }

  async verifyPayment(params: VerifyParams): Promise<boolean> {
    const body = `${params.providerOrderId}|${params.providerPaymentId}`
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex')
    return expected === params.signature
  }

  async handleWebhook(body: Buffer, signature: string): Promise<WebhookEvent> {
    if (!this.webhookSecret) return { type: 'unknown' }

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex')

    if (expected !== signature) return { type: 'unknown' }

    const event = JSON.parse(body.toString()) as {
      event: string
      payload: { payment?: { entity: { id: string; order_id: string } } }
    }

    if (event.event === 'payment.captured') {
      return {
        type: 'payment.captured',
        providerPaymentId: event.payload.payment?.entity.id,
        providerOrderId: event.payload.payment?.entity.order_id,
      }
    }

    return { type: 'unknown' }
  }
}
