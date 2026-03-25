import crypto from 'crypto'
import type { AuditDTO, AuditSummaryDTO } from '@fairbill/types'
import { auditRepository } from '../repositories/audit.repository.js'
import { auditLineItemRepository } from '../repositories/audit-line-item.repository.js'
import { billRepository } from '../repositories/bill.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { getAIProvider } from '../integrations/ai/ai.factory.js'
import { ForbiddenError, NotFoundError, UsageLimitError, PlanUpgradeRequiredError, AppError } from '../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'
import { FREE_PLAN_AUDIT_LIMIT } from '../config/constants.js'
import { logger } from '../utils/logger.js'
import type { Audit, AuditLineItem } from '@prisma/client'

type AuditWithItems = Audit & { lineItems: AuditLineItem[] }

function toAuditDTO(audit: AuditWithItems): AuditDTO {
  return {
    id: audit.id,
    billId: audit.billId,
    userId: audit.userId,
    fairnessScore: audit.fairnessScore,
    estimatedFairTotal: audit.estimatedFairTotal ? Number(audit.estimatedFairTotal) : null,
    potentialSavings: audit.potentialSavings ? Number(audit.potentialSavings) : null,
    explanation: audit.explanation,
    negotiationScript: audit.negotiationScript,
    aiProvider: audit.aiProvider,
    aiModel: audit.aiModel,
    status: audit.status as AuditDTO['status'],
    isPublic: audit.isPublic,
    publicToken: audit.publicToken,
    pdfUrl: audit.pdfUrl,
    lineItems: audit.lineItems.map(li => ({
      id: li.id,
      auditId: li.auditId,
      description: li.description,
      chargedAmount: Number(li.chargedAmount),
      fairAmount: Number(li.fairAmount),
      status: li.status as 'fair' | 'high' | 'overcharged',
      reason: li.reason,
      position: li.position,
    })),
    createdAt: audit.createdAt.toISOString(),
    updatedAt: audit.updatedAt.toISOString(),
  }
}

export const auditService = {
  async createAudit(billId: string, userId: string, includeNegotiationScript = false): Promise<AuditDTO> {
    // Check usage limit
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('User')

    if (user.plan === 'free' && user.auditsUsedThisMonth >= FREE_PLAN_AUDIT_LIMIT) {
      throw new UsageLimitError()
    }

    // Check negotiation script gating
    if (includeNegotiationScript && user.plan === 'free') {
      throw new PlanUpgradeRequiredError('Negotiation scripts')
    }

    const bill = await billRepository.findById(billId)
    if (!bill) throw new NotFoundError('Bill')
    if (bill.userId !== userId) throw new ForbiddenError()

    const audit = await auditRepository.create({ billId, userId, status: 'pending' })
    await billRepository.update(billId, { status: 'auditing' })

    // Increment usage
    await userRepository.incrementAuditCount(userId)

    // Run audit in background
    auditService.runAudit(audit.id, includeNegotiationScript).catch(err => {
      logger.error({ err, auditId: audit.id }, 'Audit failed')
    })

    const created = await auditRepository.findById(audit.id)
    return toAuditDTO(created!)
  },

  async runAudit(auditId: string, includeNegotiationScript: boolean): Promise<void> {
    const audit = await auditRepository.findById(auditId)
    if (!audit) return

    await auditRepository.update(auditId, { status: 'processing' })

    const bill = await billRepository.findById(audit.billId)
    if (!bill) {
      await auditRepository.update(auditId, { status: 'failed' })
      return
    }

    const billText = bill.correctedText ?? bill.extractedText
    if (!billText) {
      await auditRepository.update(auditId, { status: 'failed' })
      return
    }

    try {
      const ai = getAIProvider()
      const result = await ai.analyze({
        billText,
        billType: bill.billType,
        currency: bill.currency,
        includeNegotiationScript,
      })

      await auditRepository.update(auditId, {
        fairnessScore: result.fairnessScore,
        estimatedFairTotal: result.estimatedFairTotal,
        potentialSavings: result.potentialSavings,
        explanation: result.explanation,
        negotiationScript: result.negotiationScript ?? null,
        aiProvider: ai.provider,
        aiModel: ai.model,
        aiRawResponse: result.rawResponse as any,
        status: 'completed',
      })

      await auditLineItemRepository.bulkCreate(
        result.lineItems.map((li, i) => ({
          auditId,
          description: li.description,
          chargedAmount: li.chargedAmount,
          fairAmount: li.fairAmount,
          status: li.status,
          reason: li.reason,
          position: i,
        }))
      )

      await billRepository.update(audit.billId, { status: 'audited' })
      logger.info({ auditId, score: result.fairnessScore }, 'Audit completed')
    } catch (err) {
      logger.error({ err, auditId }, 'AI analysis failed')
      await auditRepository.update(auditId, { status: 'failed' })
      await billRepository.update(audit.billId, { status: 'failed' })
    }
  },

  async getAudit(auditId: string, userId: string): Promise<AuditDTO> {
    const audit = await auditRepository.findById(auditId)
    if (!audit) throw new NotFoundError('Audit')
    if (audit.userId !== userId) throw new ForbiddenError()
    return toAuditDTO(audit)
  },

  async listAudits(userId: string, page: number, limit: number): Promise<{ audits: AuditSummaryDTO[]; total: number }> {
    const [audits, total] = await Promise.all([
      auditRepository.findByUserId(userId, page, limit),
      auditRepository.countByUserId(userId),
    ])

    const summaries: AuditSummaryDTO[] = audits.map((a: any) => ({
      id: a.id,
      billId: a.billId,
      fairnessScore: a.fairnessScore,
      estimatedFairTotal: a.estimatedFairTotal ? Number(a.estimatedFairTotal) : null,
      potentialSavings: a.potentialSavings ? Number(a.potentialSavings) : null,
      status: a.status,
      billType: a.bill?.billType ?? null,
      originalFilename: a.bill?.originalFilename ?? null,
      createdAt: a.createdAt.toISOString(),
    }))

    return { audits: summaries, total }
  },

  async generateShareLink(auditId: string, userId: string): Promise<string> {
    const audit = await auditRepository.findById(auditId)
    if (!audit) throw new NotFoundError('Audit')
    if (audit.userId !== userId) throw new ForbiddenError()

    const token = audit.publicToken ?? crypto.randomBytes(16).toString('hex')
    await auditRepository.update(auditId, { isPublic: true, publicToken: token })
    return token
  },

  async getPublicAudit(token: string): Promise<AuditDTO> {
    const audit = await auditRepository.findByPublicToken(token)
    if (!audit || !audit.isPublic) throw new NotFoundError('Audit')
    return toAuditDTO(audit)
  },

  async deleteAudit(auditId: string, userId: string): Promise<void> {
    const audit = await auditRepository.findById(auditId)
    if (!audit) throw new NotFoundError('Audit')
    if (audit.userId !== userId) throw new ForbiddenError()
    await auditRepository.delete(auditId)
  },
}
