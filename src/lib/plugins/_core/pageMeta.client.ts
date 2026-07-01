// client-safe registry of plugin page metadata. maps a url base segment to its owning
// plugin and page component. eager glob so the route matcher can resolve base paths
// synchronously — this stays client-safe only because pages.meta.ts files import types only.

import type { PluginPageMeta } from './types.client'

const metaModules = import.meta.glob('../*/pages.meta.ts', { eager: true })

const metaByBasePath = new Map<string, PluginPageMeta>()

for (const [path, mod] of Object.entries(metaModules)) {
  const meta = (mod as { default?: PluginPageMeta }).default
  if (!meta?.basePath || !meta.pluginId || !meta.component) {
    console.warn('[plugin-page-meta] skipping invalid pages.meta.ts:', path)
    continue
  }

  if (metaByBasePath.has(meta.basePath)) {
    console.error(`[plugin-page-meta] duplicate basePath '${meta.basePath}' — ignoring ${path}`)
    continue
  }

  metaByBasePath.set(meta.basePath, meta)
}

export function isPluginPageBasePath(basePath: string): boolean {
  return metaByBasePath.has(basePath)
}

export function getPluginPageMeta(basePath: string): PluginPageMeta | undefined {
  return metaByBasePath.get(basePath)
}
