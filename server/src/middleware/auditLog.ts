import { appendFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const logDir = path.resolve(process.cwd(), 'server', 'logs')
const logFile = path.join(logDir, 'admin-audit.log')

export interface AuditRecord {
  action: string
  actor: string
  success: boolean
  metadata?: Record<string, unknown>
}

export async function writeAuditLog(record: AuditRecord): Promise<void> {
  await mkdir(logDir, { recursive: true })
  await appendFile(
    logFile,
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      ...record,
    })}\n`,
    'utf-8'
  )
}
