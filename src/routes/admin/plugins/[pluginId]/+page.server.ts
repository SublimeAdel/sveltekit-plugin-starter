import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { pluginRegistry } from '$lib/plugins/_core/registry'
import { getPluginConfig } from '$lib/server/pluginConfig'

export const load: PageServerLoad = async ({ params }) => {
  await pluginRegistry.initialize()
  const manifest = pluginRegistry.getManifest(params.pluginId)
  if (!manifest) error(404, 'plugin not found')

  const state = await getPluginConfig(params.pluginId)

  return {
    pluginId: manifest.id,
    name: manifest.name,
    description: manifest.description,
    version: manifest.version,
    hasSettings: !!manifest.components?.settings,
    hasManagement: !!manifest.components?.management,
    enabled: state?.config?.enabled ?? false,
    status: state?.status ?? 'disabled',
    settings: state?.config?.settings ?? manifest.defaultSettings ?? {},
  }
}
