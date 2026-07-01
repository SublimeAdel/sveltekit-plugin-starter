// skeleton plugin — the starting point for a new plugin. it declares a browse section and
// settings, and nothing else. copy this folder (or run `npm run new:plugin <id>`) and grow it.
//
// to add more: collections, api routes, a management component, or a consumer page — see the
// examples/ plugins and docs/authoring-a-plugin.md.

import type { PluginManifest, PluginConfig, BrowseSectionData } from '$lib/plugins/_core/types'
import { BROWSE_SECTION_ORDER } from '$lib/plugins/_core/constants'
import { helloSettingsSchema, defaultHelloSettings } from './schema'

async function getData(config: PluginConfig | null): Promise<BrowseSectionData> {
  const greeting = (config?.settings.greeting as string) ?? defaultHelloSettings.greeting
  return { pluginId: 'hello', props: { items: [{ greeting }] } }
}

const manifest: PluginManifest = {
  id: 'hello',
  name: 'Hello',
  description: 'A skeleton plugin: a configurable greeting on the browse page',
  version: '1.0.0',
  author: 'you',

  settingsSchema: helloSettingsSchema,
  defaultSettings: defaultHelloSettings,

  components: {
    browse: './components/Browse.svelte',
    settings: './components/Settings.svelte',
  },

  browseSection: {
    order: BROWSE_SECTION_ORDER.PLUGIN_SECTIONS,
    getData,
  },
}

export default manifest
