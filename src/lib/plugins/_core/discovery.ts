// plugin discovery. finds plugins by globbing for plugin.manifest.ts files.
// dropping a plugin folder with a manifest is enough — no central registration list.
// the glob resolves at build time, so a new plugin folder is only seen after a dev restart.

import type { PluginManifest } from './types'
import { logger } from './logger'

const manifestModules = import.meta.glob('../*/plugin.manifest.ts', { eager: false })

export async function discoverPlugins(): Promise<Map<string, PluginManifest>> {
  const log = logger().child({ domain: 'plugins', operation: 'discovery' })
  const plugins = new Map<string, PluginManifest>()

  for (const [path, importFn] of Object.entries(manifestModules)) {
    try {
      if (path.includes('/_core/')) continue

      const pluginDir = path.match(/\.\.\/([^/]+)\/plugin\.manifest\.ts/)?.[1] ?? 'unknown'
      const module = (await importFn()) as { default: PluginManifest }
      const manifest = module.default

      if (!manifest.id || !manifest.name || !manifest.version) {
        log.warn({ path, pluginDir }, 'invalid plugin manifest: missing id/name/version')
        continue
      }

      if (manifest.id !== pluginDir) {
        log.warn({ manifestId: manifest.id, pluginDir }, 'plugin id does not match directory name')
      }

      if (plugins.has(manifest.id)) {
        log.error({ pluginId: manifest.id }, 'duplicate plugin id — ignoring duplicate')
        continue
      }

      plugins.set(manifest.id, manifest)
      log.debug({ pluginId: manifest.id, version: manifest.version }, 'plugin discovered')
    } catch (error) {
      log.error({ error, path }, 'failed to load plugin manifest')
    }
  }

  log.info({ count: plugins.size, pluginIds: [...plugins.keys()] }, 'plugin discovery complete')
  return plugins
}
