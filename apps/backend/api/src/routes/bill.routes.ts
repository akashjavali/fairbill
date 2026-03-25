import { Router } from 'express'
import { z } from 'zod'
import { billController } from '../controllers/bill.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { uploadMiddleware } from '../middleware/upload.middleware.js'

const router = Router()

const correctTextSchema = z.object({
  correctedText: z.string().min(1).max(50000),
})

router.use(authMiddleware)
router.post('/upload', uploadMiddleware.single('file'), billController.upload)
router.get('/:id', billController.getBill)
router.patch('/:id/text', validate(correctTextSchema), billController.correctText)
router.delete('/:id', billController.deleteBill)

export { router as billRoutes }
