// lazy component loader. plugin svelte components are code-split and loaded on demand,
// then cached. imported by both client and server, so it must not import server-only code.
//
// two resolution styles:
//   loadComponent(id, type)        — fixed convention: Browse/Settings/Management.svelte
//   loadComponentByPath(id, path)  — arbitrary manifest-declared paths (e.g. page components)

import type { Component } from 'svelte'

export type ComponentType = 'browse' | 'settings' | 'management'

const browseComponents = import.meta.glob('../*/components/Browse.svelte', { eager: false })
const settingsComponents = import.meta.glob('../*/components/Settings.svelte', { eager: false })
const managementComponents = import.meta.glob('../*/components/Management.svelte', { eager: false })

// every plugin component, keyed by full relative path — used by loadComponentByPath.
const allPluginComponents = import.meta.glob('../*/**/*.svelte', { eager: false })

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cache holds mixed prop types, cast at retrieval.
const componentCache = new Map<string, Component<any>>()

const globsByType: Record<ComponentType, Record<string, () => Promise<unknown>>> = {
  browse: browseComponents,
  settings: settingsComponents,
  management: managementComponents,
}

const fileNamesByType: Record<ComponentType, string> = {
  browse: 'Browse.svelte',
  settings: 'Settings.svelte',
  management: 'Management.svelte',
}

export async function loadComponent<T extends Record<string, unknown> = Record<string, unknown>>(
  pluginId: string,
  componentType: ComponentType,
): Promise<Component<T> | undefined> {
  const componentPath = `../${pluginId}/components/${fileNamesByType[componentType]}`
  return importAndCache<T>(componentPath, globsByType[componentType])
}

export async function loadComponentByPath<
  T extends Record<string, unknown> = Record<string, unknown>,
>(pluginId: string, relativePath: string): Promise<Component<T> | undefined> {
  const componentPath = `../${pluginId}/${relativePath.replace(/^\.\//, '')}`
  return importAndCache<T>(componentPath, allPluginComponents)
}

async function importAndCache<T extends Record<string, unknown>>(
  componentPath: string,
  glob: Record<string, () => Promise<unknown>>,
): Promise<Component<T> | undefined> {
  const cached = componentCache.get(componentPath)
  if (cached) return cached as Component<T>

  const importFn = glob[componentPath]
  if (!importFn) {
    console.warn('[plugin-loader] component not found:', componentPath)
    return undefined
  }

  try {
    const module = (await importFn()) as { default: Component<T> }
    if (!module.default) {
      console.warn('[plugin-loader] no default export:', componentPath)
      return undefined
    }
    componentCache.set(componentPath, module.default)
    return module.default
  } catch (error) {
    console.warn('[plugin-loader] failed to load component:', componentPath, error)
    return undefined
  }
}
