import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { writeSessionSummary } from '../services/telemetryService'
import { rateLimitConfigs } from '../middleware/rateLimit'

const SessionSummarySchema = z.object({
  sessionId: z.string().min(1).max(200),
  characterId: z.string().min(1).max(100),
  locale: z.string().min(2).max(10),
  monthsPlayed: z.number().min(0).max(2000),
  ending: z.string().max(100).optional(),
  version: z.string().min(1).max(100),
  decisions: z.number().min(0).max(5000),
  trapsTriggered: z.number().min(0).max(1000),
  averageStress: z.number().min(0).max(100),
})

export async function registerTelemetryRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v1/telemetry/session-summary', rateLimitConfigs.telemetry, async (request, reply) => {
    const parsed = SessionSummarySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid telemetry payload', details: parsed.error.flatten() })
    }

    await writeSessionSummary(parsed.data)
    return reply.code(202).send({ accepted: true })
  })
}
