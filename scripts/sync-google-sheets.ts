import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

async function run() {
  const outputDir = path.resolve(process.cwd(), 'content', 'draft')
  await mkdir(outputDir, { recursive: true })

  const sheetId = process.env.SHEETS_DOC_ID || 'unset'
  const payload = {
    note: 'Google Sheets sync scaffold. Replace this with production read-only Sheets ingestion logic.',
    sheetId,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    syncedAt: new Date().toISOString(),
  }

  await writeFile(path.join(outputDir, 'sheets-sync.json'), JSON.stringify(payload, null, 2), 'utf-8')
  console.log('Google Sheets sync scaffold completed')
}

run().catch((error) => {
  console.error('Google Sheets sync failed', error)
  process.exit(1)
})
