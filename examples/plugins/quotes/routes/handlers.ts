// http handlers for /api/plugins/quotes/*. the generic dispatcher picks one by method;
// each handler routes internally on event.params.path.
//
//   GET  /api/plugins/quotes            admin  list authors (+ quote counts)
//   GET  /api/plugins/quotes/browse     public browse-section props
//   GET  /api/plugins/quotes/<slug>     public single author + quotes
//   POST /api/plugins/quotes            admin  create author
//   POST /api/plugins/quotes/<id>/quotes  admin  replace an author's quotes
//   PUT  /api/plugins/quotes            admin  update author
//   DELETE /api/plugins/quotes?id=<id>  admin  delete author (cascades quotes)

import { json, error, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'
import { requireAdmin, requireEnabled } from '$lib/server/auth'
import { getPluginConfig } from '$lib/server/pluginConfig'
import { Authors, Quotes } from '../collections'
import { getQuotesBrowseData, getAuthorBySlug } from '../api'

const PLUGIN_ID = 'quotes'

const authorSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, and hyphens'),
  bio: z.string().default(''),
  accentColor: z.string().default('#3b58d6'),
})

function path(event: RequestEvent): string {
  return event.params.path ?? ''
}

export async function handleGet(event: RequestEvent): Promise<Response> {
  const p = path(event)

  if (p === 'browse') {
    await requireEnabled(PLUGIN_ID)
    const state = await getPluginConfig(PLUGIN_ID)
    const data = await getQuotesBrowseData(state?.config ?? null)
    event.setHeaders({ 'cache-control': 'public, max-age=60' })
    return json(data.props)
  }

  if (p === '') {
    requireAdmin(event)
    const authors = Authors.all().map((a) => ({
      ...a,
      quoteCount: Quotes.find((q) => q.authorId === a.id).length,
    }))
    return json({ authors })
  }

  // public: /api/plugins/quotes/<slug>
  await requireEnabled(PLUGIN_ID)
  const author = getAuthorBySlug(p)
  if (!author) error(404, 'author not found')
  return json(author)
}

export async function handlePost(event: RequestEvent): Promise<Response> {
  requireAdmin(event)
  const p = path(event)

  const quotesMatch = p.match(/^([^/]+)\/quotes$/)
  if (quotesMatch) return replaceQuotes(event, quotesMatch[1])

  if (p === '') {
    const parsed = authorSchema.safeParse(await event.request.json())
    if (!parsed.success) error(400, parsed.error.issues[0].message)
    if (Authors.find((a) => a.slug === parsed.data.slug).length) error(409, 'slug already exists')
    return json(Authors.insert(parsed.data), { status: 201 })
  }

  error(404, 'not found')
}

export async function handlePut(event: RequestEvent): Promise<Response> {
  requireAdmin(event)
  const body = (await event.request.json()) as { id?: string }
  if (!body.id) error(400, 'id is required')

  const parsed = authorSchema.safeParse(body)
  if (!parsed.success) error(400, parsed.error.issues[0].message)

  const updated = Authors.update(body.id, parsed.data)
  if (!updated) error(404, 'author not found')
  return json(updated)
}

export async function handleDelete(event: RequestEvent): Promise<Response> {
  requireAdmin(event)
  const id = event.url.searchParams.get('id')
  if (!id) error(400, 'id is required')

  const deleted = Authors.delete(id)
  if (!deleted) error(404, 'author not found')
  for (const quote of Quotes.find((q) => q.authorId === id)) Quotes.delete(quote.id)
  return json({ success: true })
}

async function replaceQuotes(event: RequestEvent, authorId: string): Promise<Response> {
  if (!Authors.get(authorId)) error(404, 'author not found')

  const parsed = z
    .object({ quotes: z.array(z.string().min(1)) })
    .safeParse(await event.request.json())
  if (!parsed.success) error(400, 'quotes must be a list of non-empty strings')

  for (const existing of Quotes.find((q) => q.authorId === authorId)) Quotes.delete(existing.id)
  for (const text of parsed.data.quotes) Quotes.insert({ authorId, text })
  return json({ success: true })
}
