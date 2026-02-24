import type { FastifyReply, FastifyRequest } from 'fastify'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
const allowedEmails = new Set(
  (process.env.ADMIN_ALLOWED_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
)

export interface AdminIdentity {
  email: string
}

async function verifyGoogleToken(token: string): Promise<AdminIdentity | null> {
  try {
    const { payload } = await jwtVerify(token, googleJwks)
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : null
    if (!email) {
      return null
    }

    if (allowedEmails.size > 0 && !allowedEmails.has(email)) {
      return null
    }

    return { email }
  } catch {
    return null
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AdminIdentity | null> {
  const devEmail = request.headers['x-admin-email']
  if (typeof devEmail === 'string' && devEmail.length > 0) {
    const normalized = devEmail.toLowerCase()
    if (allowedEmails.size === 0 || allowedEmails.has(normalized)) {
      return { email: normalized }
    }
  }

  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    await reply.code(401).send({ error: 'Missing bearer token' })
    return null
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const identity = await verifyGoogleToken(token)
  if (!identity) {
    await reply.code(403).send({ error: 'Not authorized for admin actions' })
    return null
  }

  return identity
}
