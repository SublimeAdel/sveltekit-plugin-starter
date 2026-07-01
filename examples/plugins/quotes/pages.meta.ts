// client-safe page metadata. types only — never import server code here (see pageMeta.client.ts).

import type { PluginPageMeta } from '$lib/plugins/_core/types.client'

const pageMeta: PluginPageMeta = {
  pluginId: 'quotes',
  basePath: 'quotes',
  component: './components/AuthorPage.svelte',
}

export default pageMeta
