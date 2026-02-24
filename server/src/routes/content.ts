import type { FastifyInstance } from 'fastify'
import { getPublishedBundle } from '../services/contentStore'
import { rateLimitConfigs } from '../middleware/rateLimit'

export async function registerContentRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/content/bundle', rateLimitConfigs.public, async (request, reply) => {
    const query = request.query as { locale?: 'en' | 'es'; version?: string }
    const locale: 'en' | 'es' = query.locale === 'es' ? 'es' : 'en'
    const version = query.version || 'latest'

    const bundle = await getPublishedBundle(locale, version)
    if (!bundle) {
      return reply.code(404).send({ error: 'Content bundle not found' })
    }

    return reply.send(bundle)
  })
}
