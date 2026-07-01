// creates each plugin's declared collections on startup by iterating manifests.
// with a real db this is where you'd create collections + indexes; the in-memory store
// creates lazily, so here we just touch each collection so it exists and log what was set up.

import { pluginRegistry } from '$lib/plugins/_core/registry'
import { collection } from './store'
import { logger } from '$lib/plugins/_core/logger'

export async function initPluginCollections(): Promise<void> {
  const log = logger().child({ domain: 'plugins', operation: 'init-collections' })
  await pluginRegistry.initialize()

  for (const manifest of pluginRegistry.getAllManifests()) {
    for (const { name } of manifest.collections ?? []) {
      collection(name)
      log.debug({ pluginId: manifest.id, collection: name }, 'collection ready')
    }
  }
}
