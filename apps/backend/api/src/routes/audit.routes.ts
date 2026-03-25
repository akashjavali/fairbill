import { Router } from 'express'
import { z } from 'zod'
import { auditController } from '../controllers/audit.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { auditLimiter } from '../middleware/rate-limit.middleware.js'

const router = Router()

const createAuditSchema = z.object({
  billId: z.string().uuid(),
  includeNegotiationScript: z.boolean().optional(),
})

// Public route (no auth)
router.get('/public/:token', auditController.getPublicAudit)

// Auth required routes
router.use(authMiddleware)
router.post('/', auditLimiter, validate(createAuditSchema), auditController.createAudit)
router.get('/', auditController.listAudits)
router.get('/:id', auditController.getAudit)
router.post('/:id/share', auditController.shareAudit)
router.delete('/:id', auditController.deleteAudit)

export { router as auditRoutes }
