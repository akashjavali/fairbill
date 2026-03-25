import type { Audit, AuditStatus, Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export const auditRepository = {
  create: (data: {
    billId: string
    userId: string
    status: AuditStatus
  }): Promise<Audit> => prisma.audit.create({ data }),

  findById: (id: string) =>
    prisma.audit.findUnique({
      where: { id },
      include: { lineItems: { orderBy: { position: 'asc' } } },
    }),

  findByPublicToken: (token: string) =>
    prisma.audit.findUnique({
      where: { publicToken: token },
      include: { lineItems: { orderBy: { position: 'asc' } }, bill: true },
    }),

  findByUserId: (userId: string, page = 1, limit = 20) =>
    prisma.audit.findMany({
      where: { userId },
      include: { bill: { select: { originalFilename: true, billType: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),

  countByUserId: (userId: string): Promise<number> =>
    prisma.audit.count({ where: { userId } }),

  update: (id: string, data: Prisma.AuditUpdateInput): Promise<Audit> =>
    prisma.audit.update({ where: { id }, data }),

  delete: (id: string): Promise<Audit> =>
    prisma.audit.delete({ where: { id } }),
}
