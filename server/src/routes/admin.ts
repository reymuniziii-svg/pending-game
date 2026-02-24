import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAdmin } from '../auth/adminAuth'
import { writeAuditLog } from '../middleware/auditLog'
import { rateLimitConfigs } from '../middleware/rateLimit'
import { writeDraftFile } from '../services/contentStore'
import { publishDraftContent } from '../services/publishService'

const ImportSchema = z.object({
  fileName: z
    .string()
    .regex(/^[a-z0-9_.-]+$/i)
    .refine((value) => value.endsWith('.json'), 'Only JSON files are supported'),
  data: z.unknown(),
})

const PublishSchema = z.object({
  version: z.string().regex(/^v[0-9]+(\.[0-9]+)?$/),
})

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v1/admin/content/import', rateLimitConfigs.admin, async (request, reply) => {
    const identity = await requireAdmin(request, reply)
    if (!identity) {
      return
    }

    const parsed = ImportSchema.safeParse(request.body)
    if (!parsed.success) {
      await writeAuditLog({
        action: 'content.import',
        actor: identity.email,
        success: false,
        metadata: { error: parsed.error.flatten() },
      })
      return reply.code(400).send({ error: 'Invalid import payload' })
    }

    await writeDraftFile(parsed.data.fileName, parsed.data.data)

    await writeAuditLog({
      action: 'content.import',
      actor: identity.email,
      success: true,
      metadata: { fileName: parsed.data.fileName },
    })

    return reply.send({ imported: true, fileName: parsed.data.fileName })
  })

  app.post('/v1/admin/content/publish', rateLimitConfigs.admin, async (request, reply) => {
    const identity = await requireAdmin(request, reply)
    if (!identity) {
      return
    }

    const parsed = PublishSchema.safeParse(request.body)
    if (!parsed.success) {
      await writeAuditLog({
        action: 'content.publish',
        actor: identity.email,
        success: false,
        metadata: { error: parsed.error.flatten() },
      })
      return reply.code(400).send({ error: 'Invalid publish payload' })
    }

    try {
      const result = await publishDraftContent(parsed.data.version)
      await writeAuditLog({
        action: 'content.publish',
        actor: identity.email,
        success: true,
        metadata: {
          version: result.version,
          files: result.files,
        },
      })

      return reply.send({ published: true, ...result })
    } catch (error) {
      await writeAuditLog({
        action: 'content.publish',
        actor: identity.email,
        success: false,
        metadata: {
          version: parsed.data.version,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      return reply.code(500).send({
        error: error instanceof Error ? error.message : 'Failed to publish content',
      })
    }
  })
}
