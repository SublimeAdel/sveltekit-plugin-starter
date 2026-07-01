# SvelteKit Plugin Starter

A starter template for a **manifest-driven plugin architecture** in SvelteKit. Drop a folder
under `src/lib/plugins/` with a `plugin.manifest.ts` and it's auto-discovered — the host app
never imports a plugin by name and needs **zero changes** to add one.

Clone it and start building plugins immediately. It ships one skeleton plugin (`hello`),
generic host wiring for every capability, and two full reference plugins under `examples/`.

> Looking for the annotated demo with the reference plugins live and seeded? That's the
> `main` branch. This `template` branch is the lean starting point.

## Quick start

```bash
npx degit SublimeAdel/sveltekit-plugin-starter my-app
cd my-app
npm install
npm run dev
```

Then create your first plugin:

```bash
npm run new:plugin my-plugin   # scaffolds src/lib/plugins/my-plugin/
# restart the dev server so discovery picks it up, then enable it at /admin/plugins
```

## What's in the box

```
src/lib/plugins/
  _core/            discovery, registry, loader, page metadata, types  ← the system
  components/       shared: error boundary, browse-section loader
  hello/            skeleton plugin (browse section + settings) — your starting point

src/lib/server/     swappable backend: in-memory store, demo-cookie auth, plugin config
src/routes/         generic host routes (browse, admin console, plugin API + page)
scripts/            new-plugin.js scaffolder
examples/plugins/   quotes + announcement — full reference plugins (not auto-discovered)
docs/               authoring guide + a page-request trace
```

## What a plugin can contribute

A plugin declares any subset of these in its manifest. It provides only what it needs — the
`hello` skeleton uses just the first two.

| Capability          | Manifest field          |
| ------------------- | ----------------------- |
| Browse-page section | `browseSection`         |
| Admin settings UI   | `components.settings`   |
| Admin management UI | `components.management` |
| Data collections    | `collections`           |
| HTTP API            | `routes`                |
| Consumer page       | `pages`                 |
| Settings validation | `settingsSchema`        |

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

See [`docs/authoring-a-plugin.md`](docs/authoring-a-plugin.md) to build a plugin and
[`docs/plugin-page-flow.md`](docs/plugin-page-flow.md) for a line-by-line request trace.

## The swappable backend

To run with no external services, `src/lib/server/` provides an in-memory store
(`store.ts`, resets on restart) and demo-cookie auth (`auth.ts`). Both are isolated so
swapping in a real database or auth provider is a localized change — the plugin contract and
`_core` are untouched. This is the first thing to replace when adapting the template.

`npm run check` type-checks the project (clean: 0 errors, 0 warnings).
