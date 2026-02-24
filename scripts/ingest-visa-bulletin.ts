import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const visaBulletinUrl =
  'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html'

async function run() {
  const outputDir = path.resolve(process.cwd(), 'content', 'draft')
  await mkdir(outputDir, { recursive: true })

  const response = await fetch(visaBulletinUrl)
  const body = await response.text()

  const output = {
    sourceUrl: visaBulletinUrl,
    status: response.status,
    retrievedAt: new Date().toISOString(),
    sample: body.slice(0, 600),
  }

  await writeFile(path.join(outputDir, 'visa-bulletin-snapshot.json'), JSON.stringify(output, null, 2), 'utf-8')
  console.log('Visa bulletin ingest completed')
}

run().catch((error) => {
  console.error('Visa bulletin ingest failed', error)
  process.exit(1)
})
