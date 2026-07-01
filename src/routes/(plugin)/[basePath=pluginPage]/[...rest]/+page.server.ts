// generic plugin page load. maps the url base segment to its owning plugin, guards on
// enabled state, then delegates to the plugin's own page load. no per-plugin route files.

import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getPluginPageMeta } from '$lib/plugins/_core/pageMeta.client'
import { getPluginConfig } from '$lib/server/pluginConfig'
import { pluginRegistry } from '$lib/plugins/_core/registry'

export const load: PageServerLoad = async (event) => {
  const meta = getPluginPageMeta(event.params.basePath)
  if (!meta) error(404)

  const state = await getPluginConfig(meta.pluginId)
  if (!state || state.status !== 'enabled') error(404)

  await pluginRegistry.initialize()
  const manifest = pluginRegistry.getManifest(meta.pluginId)
  if (!manifest?.pages?.load) error(404)

  const result = await manifest.pages.load(event, event.params.rest)
  if (!result) error(404)

  return { pluginId: meta.pluginId, component: meta.component, props: result.props }
}
