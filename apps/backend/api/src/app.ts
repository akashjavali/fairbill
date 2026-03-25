import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { generalLimiter } from './middleware/rate-limit.middleware.js'
import { authRoutes } from './routes/auth.routes.js'
import { billRoutes } from './routes/bill.routes.js'
import { auditRoutes } from './routes/audit.routes.js'
import { paymentRoutes } from './routes/payment.routes.js'
import { userRoutes } from './routes/user.routes.js'

const app = express()

// Security
app.use(helmet())
app.use(cors({
  origin: [env.WEB_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Parsers
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use(generalLimiter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/bills', billRoutes)
app.use('/api/audits', auditRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Route not found' } })
})

// Error handler (must be last)
app.use(errorMiddleware)

export { app }
