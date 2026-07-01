// startup wiring: initialize plugin collections and seed demo data once, on the first request.
// mirrors where a real app would run initPluginCollections() during server boot.

import type { Handle } from '@sveltejs/kit'
import { initPluginCollections } from '$lib/server/initPlugins'
import { seedQuotes } from '$lib/plugins/quotes/seed'

let started: Promise<void> | null = null

function startup(): Promise<void> {
  started ??= (async () => {
    await initPluginCollections()
    seedQuotes()
  })()
  return started
}

export const handle: Handle = async ({ event, resolve }) => {
  await startup()
  return resolve(event)
}
