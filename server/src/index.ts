import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import { registerRateLimit } from './middleware/rateLimit'
import { registerContentRoutes } from './routes/content'
import { registerLegalRoutes } from './routes/legal'
import { registerTelemetryRoutes } from './routes/telemetry'
import { registerAdminRoutes } from './routes/admin'

const port = Number(process.env.PORT || 8080)
const host = process.env.HOST || '0.0.0.0'

async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  })

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    methods: ['GET', 'POST', 'OPTIONS'],
  })

  await app.register(helmet, {
    contentSecurityPolicy: false,
  })

  await app.register(sensible)
  await registerRateLimit(app)

  app.get('/v1/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  await registerContentRoutes(app)
  await registerLegalRoutes(app)
  await registerTelemetryRoutes(app)
  await registerAdminRoutes(app)

  return app
}

buildServer()
  .then((app) => app.listen({ port, host }))
  .then((address) => {
    console.log(`Pending API listening on ${address}`)
  })
  .catch((error) => {
    console.error('Failed to start API server', error)
    process.exit(1)
  })
