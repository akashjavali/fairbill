export type AuditStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type LineItemStatus = 'fair' | 'high' | 'overcharged'

export interface LineItemDTO {
  id: string
  auditId: string
  description: string
  chargedAmount: number
  fairAmount: number
  status: LineItemStatus
  reason: string
  position: number
}

export interface AuditDTO {
  id: string
  billId: string
  userId: string
  fairnessScore: number | null
  estimatedFairTotal: number | null
  potentialSavings: number | null
  explanation: string | null
  negotiationScript: string | null
  aiProvider: string | null
  aiModel: string | null
  status: AuditStatus
  isPublic: boolean
  publicToken: string | null
  pdfUrl: string | null
  lineItems: LineItemDTO[]
  createdAt: string
  updatedAt: string
}

export interface CreateAuditRequest {
  billId: string
  includeNegotiationScript?: boolean
}

export interface AuditSummaryDTO {
  id: string
  billId: string
  fairnessScore: number | null
  estimatedFairTotal: number | null
  potentialSavings: number | null
  status: AuditStatus
  billType: string | null
  originalFilename: string | null
  createdAt: string
}
