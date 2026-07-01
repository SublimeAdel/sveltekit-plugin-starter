import type { LayoutServerLoad } from './$types'
import { isAdmin } from '$lib/server/auth'

export const load: LayoutServerLoad = (event) => {
  return { isAdmin: isAdmin(event) }
}
