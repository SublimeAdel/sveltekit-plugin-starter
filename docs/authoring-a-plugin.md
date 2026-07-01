# Authoring a plugin

A plugin is a folder under `src/lib/plugins/<id>/` whose only required file is
`plugin.manifest.ts`. Everything else is opt-in.

Fastest start: `npm run new:plugin <id>` scaffolds a browse-section + settings plugin (the
`hello` skeleton) into `src/lib/plugins/<id>/`. Then grow it using this guide.

For complete patterns, study the reference plugins under `examples/plugins/`: `quotes` uses
every capability, `announcement` is the minimal browse-section + settings case.

## Files by capability

```
src/lib/plugins/my-plugin/
  plugin.manifest.ts    required — declares the capabilities below
  schema.ts             settings Zod schema + defaults
  indexes.ts            collection + index declarations (dependency-free)
  collections.ts        typed store/db access
  api.ts                data-loading (browse data, lookups)
  routes/handlers.ts    HTTP handlers, routed internally by path
  pages.meta.ts         CLIENT-SAFE page metadata (types only)
  pages/myPage.ts       server load() for the consumer page
  components/
    Browse.svelte       browse-page section
    Settings.svelte     admin: configure the plugin
    Management.svelte    admin: manage data (CRUD)
    MyPage.svelte       the consumer page UI
```

Minimum viable plugins:

- **Browse only:** `plugin.manifest.ts`, `api.ts`, `components/Browse.svelte`.
- **Admin-managed:** add `schema.ts`, `collections.ts`, `indexes.ts`, `routes/handlers.ts`, `Settings.svelte`, `Management.svelte`.
- **With a public page:** add `pages.meta.ts`, `pages/*.ts`, a `pages` manifest block, and the page component.

## Checklist

1. Create `src/lib/plugins/<id>/` and `plugin.manifest.ts` with `id`, `name`, `version`. Match `id` to the folder name.
2. **Settings?** add a Zod schema + defaults; reference them in the manifest.
3. **Collections?** declare them in `indexes.ts`, list them in `manifest.collections`. They're created on startup by `initPluginCollections()`.
4. **Browse section?** implement `browseSection.getData` (batch your queries — never query inside a loop) and a `Browse.svelte`. Use an `order` of 50+ to sit after core sections.
5. **API?** add `routes/handlers.ts`, route internally on `event.params.path`, `requireAdmin` on writes and `requireEnabled` on public reads.
6. **Consumer page?** add a client-safe `pages.meta.ts`, a `pages/*.ts` `load` returning `PluginPageData | null` (null → 404), the `pages` manifest block, and the page component.
7. Restart the dev server so the glob re-runs and discovers the plugin.
8. Enable it in `/admin/plugins`.
9. `npm run check` must be clean.

## Rules that matter

- **`pages.meta.ts` is client-safe.** It's eagerly globbed by a browser-reachable registry, so it may import **types only** — never the manifest, a `load`, the store, or anything server-side. Breaking this drags server code into the client bundle.
- **Public endpoints check enabled state.** Call `requireEnabled(pluginId)` (or check `getPluginConfig`) so disabling the plugin actually hides its behavior.
- **Validate on the server, not just the UI.** Anyone can call your API directly, so re-validate ids and bodies in the handler even if the admin UI already constrains them.
- **Serialize page-load output.** Anything returned from a page `load` crosses to the client, so convert non-JSON values (dates, db ids) to plain values before returning.

## The manifest

```ts
import type { PluginManifest } from '$lib/plugins/_core/types'
import { BROWSE_SECTION_ORDER } from '$lib/plugins/_core/constants'

const manifest: PluginManifest = {
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'What it does',
  version: '1.0.0',

  settingsSchema, // optional
  defaultSettings, // optional
  collections, // optional
  components: {
    browse: './components/Browse.svelte',
    settings: './components/Settings.svelte',
    management: './components/Management.svelte',
  },
  browseSection: {
    order: BROWSE_SECTION_ORDER.PLUGIN_SECTIONS,
    getData: (config) => getMyBrowseData(config),
  },
  routes: { get: handleGet, post: handlePost },
  pages: { basePath: 'my-plugin', component: './components/MyPage.svelte', load: loadMyPage },
}

export default manifest
```

Every field except `id`/`name`/`version` is optional. Core reads the manifest and wires up
only the capabilities present.
