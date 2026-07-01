// server-side plugin types. carries server-only deps (RequestEvent, zod) and must
// not be imported from browser code — client code imports from types.client.ts instead.

import type { RequestEvent } from '@sveltejs/kit'
import type { z } from 'zod'

import type {
  BrowseSectionProps,
  SettingsComponentProps,
  ManagementComponentProps,
  BrowseSectionData,
  LoadedPlugin,
  PluginPageData,
  PluginPageProps,
  PluginPageMeta,
} from './types.client'

export type {
  BrowseSectionProps,
  SettingsComponentProps,
  ManagementComponentProps,
  BrowseSectionData,
  LoadedPlugin,
  PluginPageData,
  PluginPageProps,
  PluginPageMeta,
}

export type RouteHandler = (event: RequestEvent) => Promise<Response>

// a data collection owned by a plugin. in this demo collections are backed by the
// in-memory store (src/lib/server/store.ts); in a real app you'd map each to a db table.
export interface PluginCollection {
  name: string
  indexes?: Array<Record<string, 1 | -1 | 'text'>>
}

// everything a plugin contributes to the host. only id/name/version are required;
// a plugin declares only the capabilities it provides.
export interface PluginManifest {
  id: string
  name: string
  description: string
  version: string
  author?: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zod object shape is plugin-defined, runtime-validated.
  settingsSchema?: z.ZodObject<any>
  defaultSettings?: Record<string, unknown>

  components?: {
    browse?: string
    settings?: string
    management?: string
  }

  collections?: PluginCollection[]

  browseSection?: {
    order: number
    getData: (config: PluginConfig | null, locale?: string) => Promise<BrowseSectionData>
  }

  routes?: {
    [method: string]: RouteHandler
  }

  // consumer-facing page. when present, the generic /[basePath]/[...rest] route serves it.
  // the browser learns about the page only via the client-safe pages.meta.ts, never this load.
  pages?: {
    basePath: string
    load: (event: RequestEvent, rest: string) => Promise<PluginPageData | null>
    component: string
  }
}

export interface PluginConfig {
  pluginId: string
  enabled: boolean
  settings: Record<string, unknown>
  createdAt?: Date
  updatedAt?: Date
}

export type PluginStatus = 'enabled' | 'disabled' | 'misconfigured'

export interface PluginState {
  config: PluginConfig | null
  status: PluginStatus
}
