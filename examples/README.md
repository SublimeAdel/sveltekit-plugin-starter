# Example plugins

Reference plugins that are **not** discovered by the app (they live outside
`src/lib/plugins/`, so the discovery glob doesn't see them). They exist to show complete,
real-world patterns you can copy from.

| Plugin         | Shows                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| `announcement` | the minimum: a browse section + settings, nothing else                     |
| `quotes`       | every capability: collections, browse section, admin settings + management, HTTP API, and a consumer page at `/quotes/<slug>` |

## Copying one into your app

To make an example live, copy its folder into `src/lib/plugins/` and restart the dev server:

```bash
cp -r examples/plugins/quotes src/lib/plugins/quotes
```

The examples import via `$lib/...` and internal relative paths, so they work unchanged once
inside `src/lib/plugins/`. The `quotes` plugin also seeds demo data — call `seedQuotes()` from
`src/hooks.server.ts` if you want it populated on startup:

```ts
import { seedQuotes } from '$lib/plugins/quotes/seed'
// ...inside startup(): seedQuotes()
```

Then enable it in `/admin/plugins`.

## Building your own instead

Run `npm run new:plugin <id>` to scaffold a fresh plugin (browse section + settings) directly
into `src/lib/plugins/`, then grow it. See [`../docs/authoring-a-plugin.md`](../docs/authoring-a-plugin.md).
