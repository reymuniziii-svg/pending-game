import type { FastifyInstance } from 'fastify'
import { getPublishedBundle } from '../services/contentStore'
import { rateLimitConfigs } from '../middleware/rateLimit'

export async function registerLegalRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/content/legal-snapshot', rateLimitConfigs.public, async (request, reply) => {
    const query = request.query as { version?: string }
    const version = query.version || 'latest'

    const bundle = await getPublishedBundle('en', version)
    if (!bundle) {
      return reply.code(404).send({ error: 'Legal snapshot unavailable' })
    }

    return reply.send({
      version: bundle.version,
      effectiveDate: bundle.effectiveDate,
      rules: bundle.rules || [],
      citations: bundle.citations || [],
    })
  })
}
