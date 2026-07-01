// aggregates browse-section data from every enabled plugin, sorted by section order.
// a plugin section that throws or returns no items is skipped, never breaking the page.

import { json } from '@sveltejs/kit'
import { pluginRegistry } from '$lib/plugins/_core/registry'
import { getEnabledPlugins } from '$lib/server/pluginConfig'
import { logger } from '$lib/plugins/_core/logger'

interface Section {
  pluginId: string
  order: number
  props: Record<string, unknown>
}

export async function GET() {
  const log = logger().child({ domain: 'plugins', operation: 'browse-sections' })
  await pluginRegistry.initialize()

  const enabled = await getEnabledPlugins()
  const sections: Section[] = []

  for (const { id, config } of enabled) {
    const manifest = pluginRegistry.getManifest(id)
    if (!manifest?.browseSection) continue

    try {
      const data = await manifest.browseSection.getData(config)
      const items = data.props.items as unknown[] | undefined
      if (items && items.length === 0) continue

      sections.push({ pluginId: id, order: manifest.browseSection.order, props: data.props })
    } catch (error) {
      log.error({ error, pluginId: id }, 'browse section failed — skipping')
    }
  }

  sections.sort((a, b) => a.order - b.order)
  return json({ sections })
}
