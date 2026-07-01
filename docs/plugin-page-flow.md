# Plugin page flow — end-to-end trace

What happens when a browser requests a plugin-owned consumer page, following the code from
the URL into the plugin and back.

**Example:** `GET /quotes/ada-lovelace`

## Files involved

| # | File                                                                | Role                                                  |
| - | ------------------------------------------------------------------- | ----------------------------------------------------- |
| 1 | `src/lib/plugins/quotes/pages.meta.ts`                              | client-safe: "I own base path `quotes`"               |
| 2 | `src/lib/plugins/_core/pageMeta.client.ts`                          | registry: all `pages.meta.ts` → `basePath → meta` map |
| 3 | `src/params/pluginPage.ts`                                          | route matcher: is this segment a plugin page?         |
| 4 | `src/routes/(plugin)/[basePath=pluginPage]/[...rest]/+page.server.ts` | server load: guard + delegate to the plugin           |
| 5 | `src/lib/plugins/quotes/pages/authorPage.ts`                        | the plugin's `load` — fetches + serializes            |
| 6 | `src/routes/(plugin)/[basePath=pluginPage]/[...rest]/+page.svelte`  | client: lazy-loads and renders the component          |
| 7 | `src/lib/plugins/_core/loader.ts`                                   | `loadComponentByPath` dynamically imports the component |
| 8 | `src/lib/plugins/quotes/components/AuthorPage.svelte`               | the UI, receives `props`                              |

## Build-time setup (once)

Two globs wire plugins in without central registration:

- `pageMeta.client.ts` eagerly globs `../*/pages.meta.ts` → a `basePath → meta` map. Eager so
  the matcher can answer synchronously; safe because those files import only types.
- `loader.ts` lazily globs `../*/**/*.svelte` → a map of import functions, so each component
  is a code-split chunk downloaded on first use.

## Request-time flow

**1. Matcher.** SvelteKit parses `/quotes/ada-lovelace` into `basePath='quotes'`,
`rest='ada-lovelace'`. The `pluginPage` matcher runs `isPluginPageBasePath('quotes')` → `true`,
so the route matches. For `/randomword/x` it returns `false` and SvelteKit moves on — this is
the entire reason the generic route doesn't swallow `/browse`, `/admin`, etc.

**2. Server load (core).**

```ts
const meta = getPluginPageMeta('quotes')   // { pluginId, basePath, component }
const state = await getPluginConfig('quotes')
if (state?.status !== 'enabled') error(404) // disabled ⇒ 404 by design
const manifest = pluginRegistry.getManifest('quotes')
const result = await manifest.pages.load(event, 'ada-lovelace')
if (!result) error(404)
return { pluginId, component: meta.component, props: result.props }
```

Core never names "quotes" — it reads it from the meta map.

**3. Plugin load.** `loadAuthorPage(event, 'ada-lovelace')`:

- validates the slug (non-empty, `[a-z0-9-]`, ≤128 chars) → invalid returns `null` → 404,
- fetches the author + quotes → not found returns `null` → 404,
- returns `{ pluginId: 'quotes', props: { author, canonicalUrl } }`.

**4. Client page.** `+page.svelte` receives `{ pluginId, component, props }` as `data`. It
lazy-loads the component:

```ts
loadComponentByPath('quotes', './components/AuthorPage.svelte')
```

and renders it inside a boundary:

```svelte
<PluginErrorBoundary pluginId="quotes">
  <AuthorPage {...data.props} />
</PluginErrorBoundary>
```

**5. Component renders** the props it was given. It does no fetching — the server load already
resolved everything.

## Failure paths

| Condition                              | Where                | Result       |
| -------------------------------------- | -------------------- | ------------ |
| Segment isn't a registered base path   | matcher → `false`    | normal 404   |
| Plugin disabled                        | core load guard      | `error(404)` |
| Manifest has no `pages.load`           | core load guard      | `error(404)` |
| Slug malformed / author not found      | plugin load → `null` | `error(404)` |
| Component import fails                 | `+page.svelte`       | "unavailable" branch |
| Component throws while rendering       | `PluginErrorBoundary` | isolated error UI |

## Why the indirection

Two globs decouple core from plugins: the `pages.meta.ts` glob answers _"which URLs belong to
plugins?"_ and the `*.svelte` glob answers _"how do I render this plugin's component?"_. Core
reads both from whatever files exist on disk, so adding a page to a new plugin needs a
`pages.meta.ts`, a `load`, a manifest `pages` block, and a component — and **no change to any
file in this trace.**
