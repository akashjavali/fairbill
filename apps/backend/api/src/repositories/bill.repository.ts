import type { Bill, BillStatus, BillType, Prisma } from '@prisma/client'
import { prisma } from '../config/database.js'

export const billRepository = {
  create: (data: {
    userId: string
    originalFilename: string
    fileUrl: string
    billType: BillType
    currency: string
    status: BillStatus
  }): Promise<Bill> => prisma.bill.create({ data }),

  findById: (id: string): Promise<Bill | null> =>
    prisma.bill.findUnique({ where: { id } }),

  findByUserId: (userId: string, page = 1, limit = 20): Promise<Bill[]> =>
    prisma.bill.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),

  update: (id: string, data: Prisma.BillUpdateInput): Promise<Bill> =>
    prisma.bill.update({ where: { id }, data }),

  delete: (id: string): Promise<Bill> =>
    prisma.bill.delete({ where: { id } }),

  countByUserId: (userId: string): Promise<number> =>
    prisma.bill.count({ where: { userId } }),
}
