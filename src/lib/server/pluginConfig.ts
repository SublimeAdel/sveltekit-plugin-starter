// plugin configuration state with per-plugin caching (5-minute ttl) and status derivation.
// backed by the in-memory store here; in fenix this reads/writes a mongodb collection.

import { pluginRegistry } from '$lib/plugins/_core/registry'
import type { PluginState, PluginStatus, PluginConfig, PluginManifest } from '$lib/plugins/_core/types'
import { PLUGIN_CACHE_TTL_MS } from '$lib/plugins/_core/constants'
import { collection, type Doc } from './store'

type ConfigDoc = Doc & PluginConfig

const configs = collection<ConfigDoc>('pluginConfigs')

interface CacheEntry {
  state: PluginState
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

function isCacheValid(pluginId: string): boolean {
  const entry = cache.get(pluginId)
  return !!entry && Date.now() - entry.timestamp < PLUGIN_CACHE_TTL_MS
}

function readConfig(pluginId: string): PluginConfig | null {
  return configs.find((c) => c.pluginId === pluginId)[0] ?? null
}

// enabled requires: config present, enabled flag set, and every settings-schema key present.
// missing required settings ⇒ misconfigured.
function determineStatus(config: PluginConfig | null, manifest: PluginManifest): PluginStatus {
  if (!config || !config.enabled) return 'disabled'
  if (!manifest.settingsSchema) return 'enabled'

  try {
    const requiredKeys = manifest.settingsSchema.keyof().options as string[]
    const hasAll = requiredKeys.every((key) => config.settings[key] !== undefined)
    return hasAll ? 'enabled' : 'misconfigured'
  } catch {
    return 'enabled'
  }
}

export async function getPluginConfig(pluginId: string): Promise<PluginState | undefined> {
  if (isCacheValid(pluginId)) return cache.get(pluginId)!.state

  await pluginRegistry.initialize()
  const manifest = pluginRegistry.getManifest(pluginId)
  if (!manifest) return undefined

  const config = readConfig(pluginId)
  const state: PluginState = { config, status: determineStatus(config, manifest) }

  cache.set(pluginId, { state, timestamp: Date.now() })
  return state
}

export async function getPluginStates(): Promise<Map<string, PluginState>> {
  await pluginRegistry.initialize()
  const states = new Map<string, PluginState>()

  await Promise.all(
    pluginRegistry.getAllManifests().map(async (manifest) => {
      const state = await getPluginConfig(manifest.id)
      if (state) states.set(manifest.id, state)
    }),
  )

  return states
}

export async function getEnabledPlugins(): Promise<
  Array<{ id: string; config: PluginConfig | null; status: PluginStatus }>
> {
  const states = await getPluginStates()
  return [...states.entries()]
    .filter(([, state]) => state.status === 'enabled')
    .map(([id, state]) => ({ id, config: state.config, status: state.status }))
}

export function savePluginConfig(pluginId: string, enabled: boolean, settings: Record<string, unknown>): void {
  const existing = readConfig(pluginId) as ConfigDoc | null
  if (existing) {
    configs.update(existing.id, { enabled, settings, updatedAt: new Date() })
  } else {
    configs.insert({ pluginId, enabled, settings, createdAt: new Date(), updatedAt: new Date() })
  }
  invalidatePluginCache(pluginId)
}

export function invalidatePluginCache(pluginId?: string): void {
  if (pluginId) cache.delete(pluginId)
  else cache.clear()
}
