// collection + index declarations, dependency-free so scripts and initPlugins can import them.

import type { PluginCollection } from '$lib/plugins/_core/types'

export const collections: PluginCollection[] = [
  {
    name: 'quotesAuthors',
    indexes: [{ slug: 1 }, { name: 'text' }],
  },
  {
    name: 'quotesQuotes',
    indexes: [{ authorId: 1 }],
  },
]
