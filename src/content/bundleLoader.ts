import { EVENTS } from '@/data/events'
import { IMMIGRATION_FORMS } from '@/data/forms'
import { POLICY_TRAPS } from '@/data/traps'
import { GLOSSARY_TERMS } from '@/data/glossary/terms'
import { computeChecksum } from '@/lib/utils'
import type { ContentBundle, LegalCitation, LocaleCode, PolicyRule } from '@/types'
import { ContentBundleSchema } from './schema'
import { getCachedBundle, setCachedBundle } from './bundleCache'

interface LoadBundleOptions {
  locale: LocaleCode
  version?: string
}

const DEFAULT_VERSION = 'latest'

const baseCitation: LegalCitation = {
  id: 'uscis-policy-manual',
  sourceUrl: 'https://www.uscis.gov/policy-manual',
  title: 'USCIS Policy Manual',
  publisher: 'USCIS',
  retrievedAt: new Date().toISOString(),
  effectiveDate: new Date().toISOString().slice(0, 10),
  confidence: 0.9,
}

const defaultRules: PolicyRule[] = [
  {
    id: 'rule-daca-renewal-only',
    name: 'DACA Renewal Baseline',
    description: 'Simulation assumes DACA eligibility is renewal-focused in the current policy window.',
    category: 'daca',
    effectiveDate: new Date().toISOString().slice(0, 10),
    conditions: [],
    outcomes: [],
    citations: [baseCitation],
  },
]

function buildLocalBundle(locale: LocaleCode): ContentBundle {
  const generatedAt = new Date().toISOString()
  const core = {
    version: `local-${locale}`,
    locale,
    effectiveDate: new Date().toISOString().slice(0, 10),
    generatedAt,
    events: EVENTS,
    forms: IMMIGRATION_FORMS,
    traps: POLICY_TRAPS,
    glossary: { terms: GLOSSARY_TERMS },
    rules: defaultRules,
    citations: [baseCitation],
  }

  return {
    ...core,
    checksum: computeChecksum(core),
  }
}

async function tryFetchJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch {
    return null
  }
}

export async function loadContentBundle(options: LoadBundleOptions): Promise<ContentBundle> {
  const locale = options.locale
  const version = options.version || DEFAULT_VERSION

  const cached = await getCachedBundle(locale, version)
  if (cached) {
    return cached
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (apiBase) {
    const apiPayload = await tryFetchJson(`${apiBase}/v1/content/bundle?locale=${locale}&version=${version}`)
    if (apiPayload) {
      const parsed = ContentBundleSchema.safeParse(apiPayload)
      if (parsed.success) {
        const bundle = parsed.data as unknown as ContentBundle
        await setCachedBundle(bundle)
        return bundle
      }
    }
  }

  const fallbackVersion = (import.meta.env.VITE_FALLBACK_BUNDLE_VERSION as string | undefined) || 'v1'
  const staticVersion = version === 'latest' ? fallbackVersion : version
  const staticPayload = await tryFetchJson(`/content/published/bundle-${staticVersion}.${locale}.json`)
  if (staticPayload) {
    const parsed = ContentBundleSchema.safeParse(staticPayload)
    if (parsed.success) {
      const bundle = parsed.data as unknown as ContentBundle
      await setCachedBundle(bundle)
      return bundle
    }
  }

  const localBundle = buildLocalBundle(locale)
  await setCachedBundle(localBundle)
  return localBundle
}
