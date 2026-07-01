// route matcher: only match a url base segment that some plugin registered as a page base path.
// this is what keeps the generic /[basePath]/[...rest] route from swallowing /browse, /admin, etc.

import type { ParamMatcher } from '@sveltejs/kit'
import { isPluginPageBasePath } from '$lib/plugins/_core/pageMeta.client'

export const match: ParamMatcher = (param) => isPluginPageBasePath(param)
