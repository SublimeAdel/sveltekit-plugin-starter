// generic plugin api dispatcher. resolves the plugin by id, picks the handler by http method
// (manifest.routes[method]), and delegates. every plugin api endpoint flows through here —
// plugins own their routes with zero route files in core.

import { error, type RequestEvent } from '@sveltejs/kit'
import { pluginRegistry } from '$lib/plugins/_core/registry'

async function dispatch(event: RequestEvent): Promise<Response> {
  await pluginRegistry.initialize()

  const manifest = pluginRegistry.getManifest(event.params.pluginId!)
  if (!manifest) error(404, 'plugin not found')

  const handler = manifest.routes?.[event.request.method.toLowerCase()]
  if (!handler) error(405, 'method not supported by plugin')

  return handler(event)
}

export const GET = dispatch
export const POST = dispatch
export const PUT = dispatch
export const DELETE = dispatch
