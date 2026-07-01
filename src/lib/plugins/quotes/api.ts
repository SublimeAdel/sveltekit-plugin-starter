// data-loading for the quotes plugin: browse-section data and single-author lookup.
// both use the batch pattern — fetch parents, then fetch all children by parent id — instead
// of querying inside a loop.

import type { PluginConfig, BrowseSectionData } from '$lib/plugins/_core/types'
import { Authors, Quotes, type Author, type Quote } from './collections'
import { defaultQuotesSettings } from './schema'

export interface AuthorWithQuotes extends Author {
  quotes: Quote[]
}

function quotesByAuthor(authorIds: string[]): Map<string, Quote[]> {
  const ids = new Set(authorIds)
  const map = new Map<string, Quote[]>()
  for (const quote of Quotes.find((q) => ids.has(q.authorId))) {
    const list = map.get(quote.authorId) ?? []
    list.push(quote)
    map.set(quote.authorId, list)
  }
  return map
}

export async function getQuotesBrowseData(config: PluginConfig | null): Promise<BrowseSectionData> {
  const title = (config?.settings.sectionTitle as string) ?? defaultQuotesSettings.sectionTitle
  const maxAuthors = (config?.settings.maxAuthors as number) ?? defaultQuotesSettings.maxAuthors

  const authors = Authors.all().slice(0, maxAuthors)
  const quotesMap = quotesByAuthor(authors.map((a) => a.id))

  const items: AuthorWithQuotes[] = authors.map((author) => ({
    ...author,
    quotes: quotesMap.get(author.id) ?? [],
  }))

  return { pluginId: 'quotes', props: { title, items } }
}

export function getAuthorBySlug(slug: string): AuthorWithQuotes | null {
  const author = Authors.find((a) => a.slug === slug)[0]
  if (!author) return null
  return { ...author, quotes: Quotes.find((q) => q.authorId === author.id) }
}
