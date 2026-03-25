import type { Request, Response, NextFunction } from 'express'
import { auditService } from '../services/audit.service.js'
import { successResponse } from '../utils/response.js'
import { UnauthorizedError } from '../utils/errors.js'
import { env } from '../config/env.js'

export const auditController = {
  async createAudit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const { billId, includeNegotiationScript } = req.body as {
        billId: string
        includeNegotiationScript?: boolean
      }
      const audit = await auditService.createAudit(billId, req.user.userId, includeNegotiationScript)
      return successResponse(res, audit, 202)
    } catch (e) { next(e) }
  },

  async listAudits(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const page = Number(req.query['page'] ?? 1)
      const limit = Number(req.query['limit'] ?? 20)
      const { audits, total } = await auditService.listAudits(req.user.userId, page, limit)
      return successResponse(res, audits, 200, {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (e) { next(e) }
  },

  async getAudit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const audit = await auditService.getAudit(req.params['id']!, req.user.userId)
      return successResponse(res, audit)
    } catch (e) { next(e) }
  },

  async getPublicAudit(req: Request, res: Response, next: NextFunction) {
    try {
      const audit = await auditService.getPublicAudit(req.params['token']!)
      return successResponse(res, audit)
    } catch (e) { next(e) }
  },

  async shareAudit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const token = await auditService.generateShareLink(req.params['id']!, req.user.userId)
      const shareUrl = `${env.WEB_URL}/share/${token}`
      return successResponse(res, { token, shareUrl })
    } catch (e) { next(e) }
  },

  async deleteAudit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      await auditService.deleteAudit(req.params['id']!, req.user.userId)
      return successResponse(res, null)
    } catch (e) { next(e) }
  },
}
