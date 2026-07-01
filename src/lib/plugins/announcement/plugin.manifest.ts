// announcement plugin manifest. a deliberately minimal plugin: it declares only a browse
// section and settings — no collections, api routes, or pages. shows that a plugin
// contributes only the capabilities it needs.

import type { PluginManifest, PluginConfig, BrowseSectionData } from '$lib/plugins/_core/types'
import { BROWSE_SECTION_ORDER } from '$lib/plugins/_core/constants'
import { announcementSettingsSchema, defaultAnnouncementSettings } from './schema'

async function getData(config: PluginConfig | null): Promise<BrowseSectionData> {
  const heading = (config?.settings.heading as string) ?? defaultAnnouncementSettings.heading
  const body = (config?.settings.body as string) ?? defaultAnnouncementSettings.body
  return { pluginId: 'announcement', props: { items: [{ heading, body }] } }
}

const manifest: PluginManifest = {
  id: 'announcement',
  name: 'Announcement',
  description: 'A configurable banner shown at the top of the browse page',
  version: '1.0.0',
  author: 'Reference Implementation',

  settingsSchema: announcementSettingsSchema,
  defaultSettings: defaultAnnouncementSettings,

  components: {
    browse: './components/Browse.svelte',
    settings: './components/Settings.svelte',
  },

  browseSection: {
    // negative order so the banner sits above core + other plugin sections.
    order: -10,
    getData,
  },
}

export default manifest
