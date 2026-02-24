import { publishDraftContent } from '../server/src/services/publishService'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

async function run() {
  const version = process.argv[2] || 'v1.1'
  const result = await publishDraftContent(version)

  const sourceDir = path.resolve(process.cwd(), 'content', 'published')
  const publicDir = path.resolve(process.cwd(), 'public', 'content', 'published')
  await mkdir(publicDir, { recursive: true })

  for (const file of result.files) {
    await copyFile(path.join(sourceDir, file), path.join(publicDir, file))
  }

  console.log(`Published ${result.version}: ${result.files.join(', ')}`)
}

run().catch((error) => {
  console.error('Publish failed', error)
  process.exit(1)
})
