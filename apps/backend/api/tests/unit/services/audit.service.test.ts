import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuditService } from '../../../src/services/audit.service'
import { UsageLimitError, PlanUpgradeRequiredError, NotFoundError } from '../../../src/utils/errors'

const mockUserRepo = {
  findById: vi.fn(),
  incrementAuditCount: vi.fn(),
}
const mockBillRepo = {
  findById: vi.fn(),
  update: vi.fn(),
}
const mockAuditRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  findByPublicToken: vi.fn(),
  delete: vi.fn(),
}
const mockLineItemRepo = {
  createMany: vi.fn(),
}
const mockAIProvider = {
  analyzeAudit: vi.fn(),
}

vi.mock('../../../src/config/database', () => ({ prisma: {} }))
vi.mock('../../../src/repositories/user.repository', () => ({
  UserRepository: vi.fn().mockImplementation(() => mockUserRepo),
}))
vi.mock('../../../src/repositories/bill.repository', () => ({
  BillRepository: vi.fn().mockImplementation(() => mockBillRepo),
}))
vi.mock('../../../src/repositories/audit.repository', () => ({
  AuditRepository: vi.fn().mockImplementation(() => mockAuditRepo),
}))
vi.mock('../../../src/repositories/audit-line-item.repository', () => ({
  AuditLineItemRepository: vi.fn().mockImplementation(() => mockLineItemRepo),
}))
vi.mock('../../../src/integrations/ai/ai.factory', () => ({
  getAIProvider: vi.fn().mockReturnValue(mockAIProvider),
}))
vi.mock('../../../src/config/constants', () => ({
  FREE_PLAN_AUDIT_LIMIT: 2,
}))

const auditService = new AuditService()

const baseUser = {
  id: 'user_1',
  plan: 'free',
  monthlyAuditCount: 0,
  createdAt: new Date(),
}
const baseBill = {
  id: 'bill_1',
  userId: 'user_1',
  status: 'ready',
  extractedText: 'Consultation: ₹500\nMRI: ₹4000',
  billType: 'medical',
  currency: 'INR',
  originalFilename: 'test-bill.pdf',
  filePath: '/uploads/test.pdf',
  fileSize: 1024,
  mimeType: 'application/pdf',
  createdAt: new Date(),
  updatedAt: new Date(),
}
const baseAudit = {
  id: 'audit_1',
  userId: 'user_1',
  billId: 'bill_1',
  status: 'pending',
  fairnessScore: null,
  explanation: null,
  estimatedFairTotal: null,
  potentialSavings: null,
  publicToken: null,
  negotiationScript: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lineItems: [],
}

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAudit', () => {
    it('enforces free plan usage limit', async () => {
      mockUserRepo.findById.mockResolvedValue({ ...baseUser, monthlyAuditCount: 2 })
      mockBillRepo.findById.mockResolvedValue(baseBill)

      await expect(
        auditService.createAudit({ billId: 'bill_1', userId: 'user_1' })
      ).rejects.toThrow(UsageLimitError)
    })

    it('allows creation when under limit', async () => {
      mockUserRepo.findById.mockResolvedValue({ ...baseUser, monthlyAuditCount: 1 })
      mockBillRepo.findById.mockResolvedValue(baseBill)
      mockAuditRepo.create.mockResolvedValue(baseAudit)

      const result = await auditService.createAudit({ billId: 'bill_1', userId: 'user_1' })
      expect(result.id).toBe('audit_1')
    })

    it('throws if bill does not belong to user', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser)
      mockBillRepo.findById.mockResolvedValue({ ...baseBill, userId: 'other_user' })

      await expect(
        auditService.createAudit({ billId: 'bill_1', userId: 'user_1' })
      ).rejects.toThrow()
    })
  })

  describe('runAudit (AI failure handling)', () => {
    it('marks audit as failed when AI throws', async () => {
      mockAIProvider.analyzeAudit.mockRejectedValue(new Error('AI unavailable'))
      mockBillRepo.findById.mockResolvedValue(baseBill)
      mockAuditRepo.update.mockResolvedValue({ ...baseAudit, status: 'failed' })

      await auditService['runAudit']('audit_1', baseBill as any)

      expect(mockAuditRepo.update).toHaveBeenCalledWith(
        'audit_1',
        expect.objectContaining({ status: 'failed' })
      )
    })
  })

  describe('getAudit', () => {
    it('throws if audit not found', async () => {
      mockAuditRepo.findById.mockResolvedValue(null)
      await expect(auditService.getAudit('audit_1', 'user_1')).rejects.toThrow(NotFoundError)
    })

    it('throws if audit belongs to different user', async () => {
      mockAuditRepo.findById.mockResolvedValue({ ...baseAudit, userId: 'other_user' })
      await expect(auditService.getAudit('audit_1', 'user_1')).rejects.toThrow()
    })

    it('returns audit for correct user', async () => {
      mockAuditRepo.findById.mockResolvedValue({ ...baseAudit, lineItems: [] })
      const result = await auditService.getAudit('audit_1', 'user_1')
      expect(result.id).toBe('audit_1')
    })
  })

  describe('pro plan gate', () => {
    it('does not include negotiationScript for free users', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser)
      mockBillRepo.findById.mockResolvedValue(baseBill)
      mockAuditRepo.create.mockResolvedValue(baseAudit)

      const result = await auditService.createAudit({ billId: 'bill_1', userId: 'user_1' })
      // negotiationScript is only populated post-AI for pro users; free users get null
      expect(result.negotiationScript).toBeNull()
    })
  })
})
