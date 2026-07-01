// settings schema + defaults for the quotes plugin, validated on save.

import { z } from 'zod'

export const quotesSettingsSchema = z.object({
  sectionTitle: z.string().min(1, 'section title is required'),
  maxAuthors: z.number().min(1).max(20).default(8),
})

export type QuotesSettings = z.infer<typeof quotesSettingsSchema>

export const defaultQuotesSettings: QuotesSettings = {
  sectionTitle: 'Featured Authors',
  maxAuthors: 8,
}
