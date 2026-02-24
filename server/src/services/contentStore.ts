import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const contentRoot = path.resolve(process.cwd(), 'content')
const draftDir = path.join(contentRoot, 'draft')
const publishedDir = path.join(contentRoot, 'published')
const activeFile = path.join(publishedDir, 'active.json')

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

export async function getActiveVersion(): Promise<string | null> {
  const active = await readJsonFile<{ version: string }>(activeFile)
  return active?.version || null
}

export async function setActiveVersion(version: string): Promise<void> {
  await writeFile(activeFile, JSON.stringify({ version }, null, 2), 'utf-8')
}

export async function listPublishedBundles(): Promise<string[]> {
  const files = await readdir(publishedDir)
  return files.filter((file) => file.startsWith('bundle-') && file.endsWith('.json')).sort()
}

export async function getPublishedBundle(
  locale: 'en' | 'es',
  version = 'latest'
): Promise<Record<string, unknown> | null> {
  const resolvedVersion = version === 'latest' ? await getActiveVersion() : version
  if (!resolvedVersion) {
    return null
  }

  const fileName = `bundle-${resolvedVersion}.${locale}.json`
  return readJsonFile<Record<string, unknown>>(path.join(publishedDir, fileName))
}

export async function getDraftFile(name: string): Promise<Record<string, unknown> | null> {
  return readJsonFile<Record<string, unknown>>(path.join(draftDir, name))
}

export async function writeDraftFile(name: string, data: unknown): Promise<void> {
  await writeFile(path.join(draftDir, name), JSON.stringify(data, null, 2), 'utf-8')
}
