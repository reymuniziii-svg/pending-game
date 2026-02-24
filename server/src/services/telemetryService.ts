import { appendFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const telemetryDir = path.resolve(process.cwd(), 'server', 'logs')
const telemetryFile = path.join(telemetryDir, 'telemetry.ndjson')
const telemetrySalt = process.env.TELEMETRY_SALT || 'pending-dev-salt'

export interface SessionSummary {
  sessionId: string
  characterId: string
  locale: string
  monthsPlayed: number
  ending?: string
  version: string
  decisions: number
  trapsTriggered: number
  averageStress: number
}

function anonymizeSessionId(sessionId: string): string {
  return createHash('sha256').update(`${telemetrySalt}:${sessionId}`).digest('hex')
}

export async function writeSessionSummary(summary: SessionSummary): Promise<void> {
  await mkdir(telemetryDir, { recursive: true })
  const payload = {
    ...summary,
    sessionId: anonymizeSessionId(summary.sessionId),
    receivedAt: new Date().toISOString(),
  }

  await appendFile(telemetryFile, `${JSON.stringify(payload)}\n`, 'utf-8')
}
