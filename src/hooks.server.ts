// startup wiring: initialize plugin collections once, on the first request.
// mirrors where a real app would run initPluginCollections() during server boot.

import type { Handle } from '@sveltejs/kit'
import { initPluginCollections } from '$lib/server/initPlugins'

let started: Promise<void> | null = null

function startup(): Promise<void> {
  started ??= initPluginCollections()
  return started
}

export const handle: Handle = async ({ event, resolve }) => {
  await startup()
  return resolve(event)
}
