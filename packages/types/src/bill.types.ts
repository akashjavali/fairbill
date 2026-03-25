export type BillStatus =
  | 'uploading'
  | 'ocr_processing'
  | 'ready'
  | 'auditing'
  | 'audited'
  | 'failed'

export type BillType = 'medical' | 'legal' | 'home_repair' | 'utility' | 'other'

export interface BillDTO {
  id: string
  userId: string
  originalFilename: string
  fileUrl: string
  extractedText: string | null
  correctedText: string | null
  billType: BillType
  currency: string
  totalAmount: number | null
  status: BillStatus
  createdAt: string
  updatedAt: string
}

export interface UploadBillRequest {
  billType: BillType
  currency?: string
}

export interface CorrectBillTextRequest {
  correctedText: string
}
