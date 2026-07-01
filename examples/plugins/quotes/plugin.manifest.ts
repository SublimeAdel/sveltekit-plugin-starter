// quotes plugin manifest — the single entry point declaring every capability this plugin
// contributes. it exercises the full system: settings, collections, a browse section,
// api routes, and a consumer page.

import type { PluginManifest } from '$lib/plugins/_core/types'
import { BROWSE_SECTION_ORDER } from '$lib/plugins/_core/constants'
import { quotesSettingsSchema, defaultQuotesSettings } from './schema'
import { collections } from './indexes'
import { getQuotesBrowseData } from './api'
import * as handlers from './routes/handlers'
import { loadAuthorPage } from './pages/authorPage'
import pageMeta from './pages.meta'

const manifest: PluginManifest = {
  id: 'quotes',
  name: 'Quotes',
  description: 'Showcase authors and their quotes on the browse page',
  version: '1.0.0',
  author: 'Reference Implementation',

  settingsSchema: quotesSettingsSchema,
  defaultSettings: defaultQuotesSettings,

  components: {
    browse: './components/Browse.svelte',
    settings: './components/Settings.svelte',
    management: './components/Management.svelte',
  },

  collections,

  browseSection: {
    order: BROWSE_SECTION_ORDER.PLUGIN_SECTIONS,
    getData: (config) => getQuotesBrowseData(config),
  },

  routes: {
    get: handlers.handleGet,
    post: handlers.handlePost,
    put: handlers.handlePut,
    delete: handlers.handleDelete,
  },

  pages: {
    basePath: pageMeta.basePath,
    component: pageMeta.component,
    load: loadAuthorPage,
  },
}

export default manifest
