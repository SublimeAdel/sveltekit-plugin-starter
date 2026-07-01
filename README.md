# SvelteKit Plugin System

A manifest-driven plugin architecture for SvelteKit. Drop a folder under
`src/lib/plugins/` with a `plugin.manifest.ts` and it's auto-discovered — the host app never
imports a plugin by name and needs **zero changes** to add one.

This repo is a small, self-contained reference implementation with two working example
plugins. It's extracted from a production white-label streaming platform and rebuilt with no
proprietary dependencies so the architecture can be studied and reused.

```
src/lib/plugins/
  _core/            discovery, registry, loader, page metadata, types
  components/       shared: error boundary, browse-section loader
  quotes/           example plugin using every capability
  announcement/     minimal plugin: browse section + settings only
```

## What a plugin can contribute

A plugin declares any subset of these in its manifest. It provides only what it needs.

| Capability          | Manifest field          | In the `quotes` example                      |
| ------------------- | ----------------------- | -------------------------------------------- |
| Data collections    | `collections`           | `quotesAuthors`, `quotesQuotes`              |
| Browse-page section | `browseSection`         | the "Featured Authors" carousel on `/browse` |
| Admin settings UI   | `components.settings`   | section title, max authors                   |
| Admin management UI | `components.management` | CRUD authors and their quotes                |
| HTTP API            | `routes`                | `/api/plugins/quotes/...`                     |
| Consumer page       | `pages`                 | `/quotes/<slug>`                             |
| Settings validation | `settingsSchema`        | a Zod schema                                 |

## How it works

**Discovery.** `_core/discovery.ts` globs for `plugin.manifest.ts` files with Vite's
`import.meta.glob`. There's no central registration list; the glob resolves at build time
(so a new plugin folder needs a dev-server restart). `_core/registry.ts` caches the result
behind an idempotent `initialize()`.

**Discovered vs enabled.** Discovery finds every plugin on disk. Whether one is _active_ is
stored per-plugin (`src/lib/server/pluginConfig.ts`) and toggled in the admin console. Public
surfaces guard on this — disabling a plugin 404s its page and API and drops its browse section.

**Generic host routes, plugin-owned logic.** Core provides one of each:

- `GET /api/plugins/browse-sections` — aggregates every enabled plugin's `browseSection.getData`, sorted by `order`.
- `/api/plugins/[pluginId]/[...path]` — dispatches to the plugin's method handler; plugins own all their endpoints with no route files in core.
- `/[basePath=pluginPage]/[...rest]` — serves any plugin's consumer page, guarded by a route matcher.

**Client-safe page routing.** The route matcher runs in the browser and must be synchronous,
so it can't touch the server-only manifest. Each plugin exposing a page also declares a tiny
client-safe `pages.meta.ts` (types only), eagerly globbed into a `basePath → meta` map. This
is the one rule you must not break: **never import server code into `pages.meta.ts` or
anything the matcher touches.** That's why there are two type files — `types.ts` (server) and
`types.client.ts` (browser-safe).

**Lazy, isolated UI.** Components are code-split and loaded on demand (`_core/loader.ts`),
then cached. Every plugin surface is wrapped in `<PluginErrorBoundary>` so one plugin's
render error can't crash the host page.

For a line-by-line trace of a page request through every hop, see
[`docs/plugin-page-flow.md`](docs/plugin-page-flow.md). To build your own plugin, see
[`docs/authoring-a-plugin.md`](docs/authoring-a-plugin.md).

## Running it

```bash
npm install
npm run dev
```

Then:

1. Open `/login` and continue as the demo admin.
2. Open `/admin/plugins` and enable both plugins.
3. In the Quotes plugin's Management tab, add authors and quotes (some are seeded already).
4. Visit `/browse` to see the plugin sections, and `/quotes/ada-lovelace` for a plugin page.

`npm run check` type-checks the project (clean: 0 errors, 0 warnings).

## Notes on the demo backend

To stay dependency-free, this reference replaces the original MongoDB layer with a small
in-memory store (`src/lib/server/store.ts`) that resets on restart, and replaces real auth
with a demo admin cookie (`src/lib/server/auth.ts`). Both are deliberately isolated so
swapping in a real database or auth provider is a localized change — the plugin contract and
`_core` are untouched.
