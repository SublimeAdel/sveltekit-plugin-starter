// server load for /quotes/<slug>. validates the handle, fetches the author + quotes,
// and returns serializable props. returning null produces a 404.

import type { RequestEvent } from '@sveltejs/kit'
import type { PluginPageData } from '$lib/plugins/_core/types'
import { getAuthorBySlug } from '../api'

function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 128 && /^[a-z0-9-]+$/.test(slug)
}

export async function loadAuthorPage(
  event: RequestEvent,
  rest: string,
): Promise<PluginPageData | null> {
  if (!isValidSlug(rest)) return null

  const author = getAuthorBySlug(rest)
  if (!author) return null

  const canonicalUrl = new URL(`/quotes/${author.slug}`, event.url.origin).toString()
  return { pluginId: 'quotes', props: { author, canonicalUrl } }
}
