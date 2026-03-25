import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)
router.get('/me', userController.me)
router.patch('/me', userController.update)
router.delete('/me', userController.deleteAccount)
router.get('/me/usage', userController.usage)

export { router as userRoutes }
