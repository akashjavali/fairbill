import fs from 'fs'
import path from 'path'
import type { BillDTO } from '@fairbill/types'
import type { Bill } from '@prisma/client'
import { billRepository } from '../repositories/bill.repository.js'
import { getOCRProvider } from '../integrations/ocr/ocr.factory.js'
import { ForbiddenError, NotFoundError, AppError } from '../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'
import { logger } from '../utils/logger.js'

function toBillDTO(bill: Bill): BillDTO {
  return {
    id: bill.id,
    userId: bill.userId,
    originalFilename: bill.originalFilename,
    fileUrl: bill.fileUrl,
    extractedText: bill.extractedText,
    correctedText: bill.correctedText,
    billType: bill.billType as BillDTO['billType'],
    currency: bill.currency,
    totalAmount: bill.totalAmount ? Number(bill.totalAmount) : null,
    status: bill.status as BillDTO['status'],
    createdAt: bill.createdAt.toISOString(),
    updatedAt: bill.updatedAt.toISOString(),
  }
}

export const billService = {
  async uploadBill(userId: string, file: Express.Multer.File, billType: string, currency = 'INR'): Promise<BillDTO> {
    const bill = await billRepository.create({
      userId,
      originalFilename: file.originalname,
      fileUrl: file.path,
      billType: billType as any,
      currency,
      status: 'ocr_processing',
    })

    // Run OCR in the background
    billService.runOCR(bill.id, file).catch(err => {
      logger.error({ err, billId: bill.id }, 'OCR failed')
    })

    return toBillDTO(bill)
  },

  async runOCR(billId: string, file: Express.Multer.File): Promise<void> {
    const ocr = getOCRProvider()
    try {
      const buffer = fs.readFileSync(file.path)
      const result = await ocr.extractText(buffer, file.mimetype)
      await billRepository.update(billId, {
        extractedText: result.text,
        status: 'ready',
      })
      logger.info({ billId, confidence: result.confidence }, 'OCR completed')
    } catch (err) {
      await billRepository.update(billId, { status: 'failed' })
      throw new AppError(FairBillErrorCode.OCR_FAILED, 'OCR extraction failed', 500)
    }
  },

  async getBill(billId: string, userId: string): Promise<BillDTO> {
    const bill = await billRepository.findById(billId)
    if (!bill) throw new NotFoundError('Bill')
    if (bill.userId !== userId) throw new ForbiddenError()
    return toBillDTO(bill)
  },

  async correctText(billId: string, userId: string, correctedText: string): Promise<BillDTO> {
    const bill = await billRepository.findById(billId)
    if (!bill) throw new NotFoundError('Bill')
    if (bill.userId !== userId) throw new ForbiddenError()
    const updated = await billRepository.update(billId, { correctedText })
    return toBillDTO(updated)
  },

  async deleteBill(billId: string, userId: string): Promise<void> {
    const bill = await billRepository.findById(billId)
    if (!bill) throw new NotFoundError('Bill')
    if (bill.userId !== userId) throw new ForbiddenError()

    // Remove file from disk
    try {
      if (fs.existsSync(bill.fileUrl)) fs.unlinkSync(bill.fileUrl)
    } catch (err) {
      logger.warn({ err, billId }, 'Could not delete file from disk')
    }

    await billRepository.delete(billId)
  },
}
