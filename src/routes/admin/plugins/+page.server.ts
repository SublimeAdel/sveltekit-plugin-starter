// admin plugin list: combines each discovered manifest with its db-backed enabled/status.

import type { PageServerLoad } from './$types'
import { pluginRegistry } from '$lib/plugins/_core/registry'
import { getPluginStates } from '$lib/server/pluginConfig'

export const load: PageServerLoad = async () => {
  await pluginRegistry.initialize()
  const states = await getPluginStates()

  const plugins = pluginRegistry.getAllManifests().map((manifest) => ({
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    version: manifest.version,
    author: manifest.author,
    status: states.get(manifest.id)?.status ?? 'disabled',
    hasBrowseSection: !!manifest.browseSection,
    hasSettings: !!manifest.components?.settings,
    hasManagement: !!manifest.components?.management,
    hasPage: !!manifest.pages,
  }))

  return { plugins }
}
