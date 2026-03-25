import type { Payment, PaymentStatus, Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export const paymentRepository = {
  create: (data: {
    userId: string
    auditId?: string
    amount: number
    currency: string
    paymentType: 'subscription' | 'one_time'
    plan: 'pro' | 'audit_single'
    provider: 'razorpay' | 'stripe'
    providerOrderId: string
  }): Promise<Payment> => prisma.payment.create({ data: data as any }),

  findById: (id: string): Promise<Payment | null> =>
    prisma.payment.findUnique({ where: { id } }),

  findByProviderOrderId: (id: string): Promise<Payment | null> =>
    prisma.payment.findFirst({ where: { providerOrderId: id } }),

  update: (id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> =>
    prisma.payment.update({ where: { id }, data }),

  findByUserId: (userId: string): Promise<Payment[]> =>
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
}
