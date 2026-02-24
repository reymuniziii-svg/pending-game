import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sources = [
  'https://www.uscis.gov/forms/all-forms',
  'https://www.uscis.gov/g-1055',
  'https://www.uscis.gov/policy-manual',
  'https://www.uscis.gov/DACA',
  'https://www.uscis.gov/addresschange',
]

async function run() {
  const outputDir = path.resolve(process.cwd(), 'content', 'draft')
  await mkdir(outputDir, { recursive: true })

  const snapshots: Array<Record<string, unknown>> = []

  for (const url of sources) {
    try {
      const response = await fetch(url)
      snapshots.push({
        url,
        status: response.status,
        retrievedAt: new Date().toISOString(),
      })
    } catch (error) {
      snapshots.push({
        url,
        status: 'failed',
        retrievedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  await writeFile(
    path.join(outputDir, 'uscis-snapshot.json'),
    JSON.stringify({ snapshots }, null, 2),
    'utf-8'
  )

  console.log(`USCIS ingest completed (${snapshots.length} sources)`)
}

run().catch((error) => {
  console.error('USCIS ingest failed', error)
  process.exit(1)
})
