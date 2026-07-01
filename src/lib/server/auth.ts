// auth stubs for the demo. real apps validate a session/jwt; here "admin" is a demo cookie
// set by /login so the admin console and plugin write endpoints can be gated realistically.

import { error, type RequestEvent } from '@sveltejs/kit'
import { getPluginConfig } from './pluginConfig'

export const ADMIN_COOKIE = 'demo_admin'

export function isAdmin(event: RequestEvent): boolean {
  return event.cookies.get(ADMIN_COOKIE) === 'true'
}

export function requireAdmin(event: RequestEvent): void {
  if (!isAdmin(event)) error(401, 'admin access required')
}

// public plugin surfaces call this so disabling a plugin actually hides its behavior.
export async function requireEnabled(pluginId: string): Promise<void> {
  const state = await getPluginConfig(pluginId)
  if (!state || state.status !== 'enabled') error(404, 'plugin is not enabled')
}
