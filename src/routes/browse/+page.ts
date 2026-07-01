import type { PageLoad } from './$types'

interface Section {
  pluginId: string
  order: number
  props: Record<string, unknown>
}

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/api/plugins/browse-sections')
  const { sections } = (await res.json()) as { sections: Section[] }
  return { sections }
}
