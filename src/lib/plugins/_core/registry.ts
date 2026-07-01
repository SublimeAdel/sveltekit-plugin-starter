// singleton registry that caches discovered manifests. initialize() is idempotent:
// it discovers once, and concurrent callers share the same in-flight promise.

import type { PluginManifest, LoadedPlugin, BrowseSectionProps } from './types'
import { discoverPlugins } from './discovery'
import { loadComponent } from './loader'
import { logger } from './logger'

class PluginRegistry {
  private manifests = new Map<string, PluginManifest>()
  private loadedPlugins = new Map<string, LoadedPlugin>()
  private initialized = false
  private initializationPromise: Promise<void> | null = null

  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = this.performInitialization()
    return this.initializationPromise
  }

  private async performInitialization(): Promise<void> {
    const log = logger().child({ domain: 'plugins', operation: 'registry-init' })
    try {
      this.manifests = await discoverPlugins()
      this.initialized = true
      log.info({ count: this.manifests.size }, 'plugin registry initialized')
    } catch (error) {
      log.error({ error }, 'failed to initialize plugin registry')
      throw error
    } finally {
      this.initializationPromise = null
    }
  }

  getAllManifests(): PluginManifest[] {
    this.assertInitialized()
    return [...this.manifests.values()]
  }

  getManifest(pluginId: string): PluginManifest | undefined {
    this.assertInitialized()
    return this.manifests.get(pluginId)
  }

  has(pluginId: string): boolean {
    return this.initialized && this.manifests.has(pluginId)
  }

  // loads and caches a plugin's fixed-convention components (browse/settings/management).
  async loadPlugin(pluginId: string): Promise<LoadedPlugin | undefined> {
    this.assertInitialized()

    const cached = this.loadedPlugins.get(pluginId)
    if (cached) return cached

    const manifest = this.getManifest(pluginId)
    if (!manifest) return undefined

    const components: LoadedPlugin['components'] = {}

    if (manifest.components?.browse) {
      components.browse = await loadComponent<BrowseSectionProps>(pluginId, 'browse')
    }
    if (manifest.components?.settings) {
      components.settings = await loadComponent(pluginId, 'settings')
    }
    if (manifest.components?.management) {
      components.management = await loadComponent(pluginId, 'management')
    }

    const loaded: LoadedPlugin = { manifest, components }
    this.loadedPlugins.set(pluginId, loaded)
    return loaded
  }

  private assertInitialized(): void {
    if (!this.initialized) {
      throw new Error('plugin registry not initialized — call initialize() first')
    }
  }
}

export const pluginRegistry = new PluginRegistry()
