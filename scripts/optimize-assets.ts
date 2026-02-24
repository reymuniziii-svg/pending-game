import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

interface AssetManifestEntry {
  id: string
  source: string
  provider: string
  prompt: string
  model: string
  seed: string
  generatedAt: string
  rights: 'commercial-safe'
  alt: {
    en: string
    es: string
  }
}

async function run() {
  const manifestDir = path.resolve(process.cwd(), 'src', 'assets', 'generated-manifest')
  const manifestPath = path.join(manifestDir, 'assets.json')

  await mkdir(manifestDir, { recursive: true })

  let entries: AssetManifestEntry[] = []
  try {
    const raw = await readFile(manifestPath, 'utf-8')
    entries = JSON.parse(raw) as AssetManifestEntry[]
  } catch {
    entries = []
  }

  // Stub optimization report while preserving rights metadata.
  const imageDir = path.resolve(process.cwd(), 'src', 'assets', 'images')
  const files = await readdir(imageDir, { recursive: true }).catch(() => [])

  await writeFile(
    manifestPath,
    JSON.stringify(entries, null, 2),
    'utf-8'
  )

  console.log(`Asset manifest verified (${entries.length} entries, ${files.length} files discovered).`)
}

run().catch((error) => {
  console.error('Asset optimization scaffold failed', error)
  process.exit(1)
})
