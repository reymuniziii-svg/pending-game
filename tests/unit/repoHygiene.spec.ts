import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// SPEC: the repo contains no dead backend/pipeline/telemetry code and no auth holes, and
// Spanish is cut (English-only). These are deletion gaps proven structurally.
const root = process.cwd()
const exists = (rel: string) => fs.existsSync(path.join(root, rel))

describe('repo hygiene (deletions)', () => {
  it('has removed the unused Fastify backend (and its committed build/log artifacts)', () => {
    expect(exists('server')).toBe(false)
  })

  it('has removed the stub content-ingest pipeline scripts', () => {
    expect(exists('scripts/ingest-uscis.ts')).toBe(false)
    expect(exists('scripts/ingest-visa-bulletin.ts')).toBe(false)
    expect(exists('scripts/sync-google-sheets.ts')).toBe(false)
  })

  it('declares no unused Google Cloud SDK dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    expect(deps['@google-cloud/firestore']).toBeUndefined()
    expect(deps['@google-cloud/storage']).toBeUndefined()
  })

  it('is English-only (Spanish locale scaffolding removed)', () => {
    expect(exists('src/i18n/locales/es')).toBe(false)
  })
})
