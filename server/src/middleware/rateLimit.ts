import type { FastifyInstance } from 'fastify'

const publicRate = Number(process.env.RATE_LIMIT_PUBLIC_RPM || 120)
const adminRate = Number(process.env.RATE_LIMIT_ADMIN_RPM || 10)

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(import('@fastify/rate-limit'), {
    global: false,
    max: publicRate,
    timeWindow: '1 minute',
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
  })
}

export const rateLimitConfigs = {
  public: {
    config: {
      rateLimit: {
        max: publicRate,
        timeWindow: '1 minute',
      },
    },
  },
  telemetry: {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute',
      },
    },
  },
  admin: {
    config: {
      rateLimit: {
        max: adminRate,
        timeWindow: '1 minute',
      },
    },
  },
} as const
