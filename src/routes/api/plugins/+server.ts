// admin endpoint to enable/disable a plugin and save its settings.
// validates settings against the plugin's own zod schema before persisting.

import { json, error } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'
import { pluginRegistry } from '$lib/plugins/_core/registry'
import { savePluginConfig } from '$lib/server/pluginConfig'
import { requireAdmin } from '$lib/server/auth'

export async function PUT(event: RequestEvent) {
  requireAdmin(event)
  await pluginRegistry.initialize()

  const body = (await event.request.json()) as {
    pluginId?: string
    enabled?: boolean
    settings?: Record<string, unknown>
  }

  if (!body.pluginId) error(400, 'pluginId is required')

  const manifest = pluginRegistry.getManifest(body.pluginId)
  if (!manifest) error(404, 'plugin not found')

  let settings = body.settings ?? {}
  if (manifest.settingsSchema) {
    const parsed = manifest.settingsSchema.safeParse(settings)
    if (!parsed.success) error(400, parsed.error.issues[0].message)
    settings = parsed.data
  }

  savePluginConfig(body.pluginId, body.enabled ?? false, settings)
  return json({ success: true })
}
