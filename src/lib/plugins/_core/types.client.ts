// client-safe plugin types. no server dependencies — safe to import in the browser.
// the route matcher and any client component import from here.

import type { Component } from 'svelte'

export interface BrowseSectionProps {
  items: unknown[]
  title?: string
  [key: string]: unknown
}

export interface SettingsComponentProps {
  settings: Record<string, unknown>
  onUpdate?: (settings: Record<string, unknown>) => void | Promise<void>
  loading?: boolean
  error?: string
  [key: string]: unknown
}

export interface ManagementComponentProps {
  pluginId?: string
  [key: string]: unknown
}

export interface BrowseSectionData {
  pluginId: string
  props: BrowseSectionProps
}

export interface PluginPageProps {
  [key: string]: unknown
}

// returning null from a page load signals a 404.
export interface PluginPageData {
  pluginId: string
  props: PluginPageProps
}

// the only page-related shape the browser/matcher may import. it excludes the
// server-side load handler so importing it never pulls server code into the client bundle.
export interface PluginPageMeta {
  pluginId: string
  basePath: string
  component: string
}

export interface LoadedPlugin {
  manifest: {
    id: string
    name: string
    description: string
    version: string
    author?: string
  }
  components: {
    browse?: Component<BrowseSectionProps>
    settings?: Component<SettingsComponentProps>
    management?: Component<ManagementComponentProps>
  }
}
