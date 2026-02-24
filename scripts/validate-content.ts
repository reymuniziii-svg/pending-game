import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

const BundleSchema = z.object({
  version: z.string(),
  locale: z.enum(['en', 'es']),
  checksum: z.string(),
  effectiveDate: z.string(),
  generatedAt: z.string(),
  events: z.array(z.unknown()),
  forms: z.record(z.string(), z.unknown()),
  traps: z.array(z.unknown()),
  glossary: z.object({ terms: z.array(z.unknown()) }),
  rules: z.array(z.unknown()),
  citations: z.array(z.unknown()),
})

async function validateFile(filePath: string) {
  const content = await readFile(filePath, 'utf-8')
  const data = JSON.parse(content)
  BundleSchema.parse(data)
  console.log(`Validated: ${filePath}`)
}

async function run() {
  const root = path.resolve(process.cwd(), 'content', 'published')
  const files = await readdir(root)
  const bundleFiles = files.filter((file) => file.startsWith('bundle-') && file.endsWith('.json'))

  for (const file of bundleFiles) {
    await validateFile(path.join(root, file))
  }

  console.log('Content validation complete')
}

run().catch((error) => {
  console.error('Content validation failed', error)
  process.exit(1)
})
