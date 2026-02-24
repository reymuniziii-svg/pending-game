import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getDraftFile, setActiveVersion } from './contentStore'

const publishedDir = path.resolve(process.cwd(), 'content', 'published')

interface PublishResult {
  version: string
  files: string[]
}

function computeChecksum(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

export async function publishDraftContent(version: string): Promise<PublishResult> {
  const eventsEn = await getDraftFile('events.en.json')
  const eventsEs = await getDraftFile('events.es.json')
  const forms = await getDraftFile('forms.json')
  const glossary = await getDraftFile('glossary.json')
  const rules = await getDraftFile('legal-rules.json')

  if (!eventsEn || !eventsEs || !forms || !glossary || !rules) {
    throw new Error('Draft content is incomplete. Required draft files missing.')
  }

  const citations = Array.isArray(rules.citations) ? rules.citations : []
  const generatedAt = new Date().toISOString()
  const effectiveDate = new Date().toISOString().slice(0, 10)

  const bundles = [
    {
      locale: 'en',
      events: eventsEn.events || [],
      glossary: glossary.en || glossary,
    },
    {
      locale: 'es',
      events: eventsEs.events || [],
      glossary: glossary.es || glossary,
    },
  ] as const

  const files: string[] = []

  for (const bundle of bundles) {
    const basePayload = {
      version,
      locale: bundle.locale,
      effectiveDate,
      generatedAt,
      events: bundle.events,
      forms,
      traps: rules.traps || [],
      glossary: bundle.glossary,
      rules: rules.rules || [],
      citations,
    }

    const payload = {
      ...basePayload,
      checksum: computeChecksum(basePayload),
    }

    const fileName = `bundle-${version}.${bundle.locale}.json`
    await writeFile(path.join(publishedDir, fileName), JSON.stringify(payload, null, 2), 'utf-8')
    files.push(fileName)
  }

  await setActiveVersion(version)
  return { version, files }
}
