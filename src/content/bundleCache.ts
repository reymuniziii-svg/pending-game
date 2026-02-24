import { get, set } from 'idb-keyval'
import type { ContentBundle, LocaleCode } from '@/types'

const cacheKey = (locale: LocaleCode, version: string) => `content-bundle:${locale}:${version}`

export async function getCachedBundle(locale: LocaleCode, version: string): Promise<ContentBundle | null> {
  const bundle = await get<ContentBundle>(cacheKey(locale, version))
  return bundle || null
}

export async function setCachedBundle(bundle: ContentBundle): Promise<void> {
  await set(cacheKey(bundle.locale, bundle.version), bundle)
}
