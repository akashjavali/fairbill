import type { AuditLineItem, LineItemStatus, Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export const auditLineItemRepository = {
  bulkCreate: (items: Array<{
    auditId: string
    description: string
    chargedAmount: number
    fairAmount: number
    status: LineItemStatus
    reason: string
    position: number
  }>): Promise<Prisma.BatchPayload> =>
    prisma.auditLineItem.createMany({ data: items }),

  findByAuditId: (auditId: string): Promise<AuditLineItem[]> =>
    prisma.auditLineItem.findMany({
      where: { auditId },
      orderBy: { position: 'asc' },
    }),

  deleteByAuditId: (auditId: string): Promise<Prisma.BatchPayload> =>
    prisma.auditLineItem.deleteMany({ where: { auditId } }),
}
