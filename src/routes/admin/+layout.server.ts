import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { isAdmin } from '$lib/server/auth'

export const load: LayoutServerLoad = (event) => {
  if (!isAdmin(event)) redirect(303, '/login?next=/admin/plugins')
  return {}
}
