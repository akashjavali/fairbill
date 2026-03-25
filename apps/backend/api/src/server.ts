import { app } from './app.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'
import { prisma } from './config/database.js'

async function start() {
  // Verify DB connection
  await prisma.$connect()
  logger.info('Database connected')

  const server = app.listen(env.PORT, () => {
    logger.info(`FairBill API running on port ${env.PORT} (${env.NODE_ENV})`)
  })

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down`)
    server.close(async () => {
      await prisma.$disconnect()
      logger.info('Server stopped')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start().catch(err => {
  logger.error(err, 'Failed to start server')
  process.exit(1)
})
