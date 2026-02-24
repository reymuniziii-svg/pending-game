import { z } from 'zod'

export const LegalCitationSchema = z.object({
  id: z.string(),
  sourceUrl: z.string().url(),
  title: z.string(),
  publisher: z.string(),
  retrievedAt: z.string(),
  effectiveDate: z.string(),
  confidence: z.number().min(0).max(1),
})

export const PolicyRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['daca', 'unlawful-presence', 'h1b', 'asylum', 'ar11', 'visa-bulletin', 'general']),
  effectiveDate: z.string(),
  expirationDate: z.string().optional(),
  conditions: z.array(z.unknown()),
  outcomes: z.array(z.unknown()),
  citations: z.array(LegalCitationSchema),
})

export const ContentBundleSchema = z.object({
  version: z.string(),
  locale: z.enum(['en', 'es']),
  checksum: z.string(),
  effectiveDate: z.string(),
  generatedAt: z.string(),
  events: z.array(z.unknown()),
  forms: z.record(z.string(), z.unknown()),
  traps: z.array(z.unknown()),
  glossary: z.object({
    terms: z.array(
      z.object({
        id: z.string(),
        term: z.string(),
        shortDefinition: z.string(),
        fullDefinition: z.string(),
        category: z.string(),
        aliases: z.array(z.string()).optional(),
      })
    ),
  }),
  rules: z.array(PolicyRuleSchema),
  citations: z.array(LegalCitationSchema),
})

export type ParsedContentBundle = z.infer<typeof ContentBundleSchema>
