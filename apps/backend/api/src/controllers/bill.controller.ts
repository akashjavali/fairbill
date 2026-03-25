import type { Request, Response, NextFunction } from 'express'
import { billService } from '../services/bill.service.js'
import { successResponse } from '../utils/response.js'
import { UnauthorizedError, ValidationError } from '../utils/errors.js'

export const billController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      if (!req.file) throw new ValidationError('No file uploaded')
      const { billType, currency } = req.body as { billType: string; currency?: string }
      const bill = await billService.uploadBill(req.user.userId, req.file, billType, currency)
      return successResponse(res, bill, 201)
    } catch (e) { next(e) }
  },

  async getBill(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const bill = await billService.getBill(req.params['id']!, req.user.userId)
      return successResponse(res, bill)
    } catch (e) { next(e) }
  },

  async correctText(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const { correctedText } = req.body as { correctedText: string }
      const bill = await billService.correctText(req.params['id']!, req.user.userId, correctedText)
      return successResponse(res, bill)
    } catch (e) { next(e) }
  },

  async deleteBill(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      await billService.deleteBill(req.params['id']!, req.user.userId)
      return successResponse(res, null)
    } catch (e) { next(e) }
  },
}
