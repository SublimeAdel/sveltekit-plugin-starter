// scaffolds a new plugin folder (browse section + settings) from the hello skeleton.
//
//   npm run new:plugin <id>
//
// <id> must be lowercase letters, numbers, and hyphens. after running, restart the dev server
// so discovery picks up the new folder, then enable it in /admin/plugins.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const id = process.argv[2]

if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error('usage: npm run new:plugin <id>   (lowercase letters, numbers, hyphens)')
  process.exit(1)
}

const dir = join('src', 'lib', 'plugins', id)
if (existsSync(dir)) {
  console.error(`plugin already exists: ${dir}`)
  process.exit(1)
}

// PascalCase display name from the id, e.g. my-plugin → My Plugin
const name = id
  .split('-')
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join(' ')

// camelCase prefix for identifiers, e.g. my-plugin → myPlugin
const camel = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())

const files = {
  'schema.ts': `import { z } from 'zod'

export const ${camel}SettingsSchema = z.object({
  greeting: z.string().min(1, 'greeting is required'),
})

export type ${name.replace(/ /g, '')}Settings = z.infer<typeof ${camel}SettingsSchema>

export const default${name.replace(/ /g, '')}Settings: ${name.replace(/ /g, '')}Settings = {
  greeting: 'Hello from ${name} 👋',
}
`,

  'plugin.manifest.ts': `import type { PluginManifest, PluginConfig, BrowseSectionData } from '$lib/plugins/_core/types'
import { BROWSE_SECTION_ORDER } from '$lib/plugins/_core/constants'
import { ${camel}SettingsSchema, default${name.replace(/ /g, '')}Settings } from './schema'

async function getData(config: PluginConfig | null): Promise<BrowseSectionData> {
  const greeting = (config?.settings.greeting as string) ?? default${name.replace(/ /g, '')}Settings.greeting
  return { pluginId: '${id}', props: { items: [{ greeting }] } }
}

const manifest: PluginManifest = {
  id: '${id}',
  name: '${name}',
  description: 'TODO: describe ${name}',
  version: '1.0.0',
  author: 'you',

  settingsSchema: ${camel}SettingsSchema,
  defaultSettings: default${name.replace(/ /g, '')}Settings,

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
`,

  'components/Browse.svelte': `<script lang="ts">
  interface Item {
    greeting: string
  }

  interface Props {
    items?: Item[]
  }

  let { items = [] }: Props = $props()
  let item = $derived(items[0])
</script>

{#if item}
  <section>
    <h2>{item.greeting}</h2>
  </section>
{/if}
`,

  'components/Settings.svelte': `<script lang="ts">
  import { untrack } from 'svelte'
  import type { SettingsComponentProps } from '$lib/plugins/_core/types.client'
  import { default${name.replace(/ /g, '')}Settings } from '../schema'

  let { settings, onUpdate, loading = false, error }: SettingsComponentProps = $props()

  let greeting = $state(
    untrack(() => (settings.greeting as string) ?? default${name.replace(/ /g, '')}Settings.greeting),
  )
</script>

<form
  onsubmit={(e) => {
    e.preventDefault()
    onUpdate?.({ greeting })
  }}
>
  <label>
    greeting
    <input bind:value={greeting} />
  </label>
  {#if error}<p>{error}</p>{/if}
  <button type="submit" disabled={loading}>{loading ? 'saving…' : 'save'}</button>
</form>
`,
}

mkdirSync(join(dir, 'components'), { recursive: true })
for (const [file, contents] of Object.entries(files)) {
  writeFileSync(join(dir, file), contents)
}

console.log(`created plugin '${id}' at ${dir}`)
console.log('next: restart the dev server, then enable it in /admin/plugins')
