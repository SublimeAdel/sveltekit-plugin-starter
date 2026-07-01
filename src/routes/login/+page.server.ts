// demo login: toggles the admin cookie. no real credentials — this exists only so the admin
// console and plugin write endpoints can be gated realistically.

import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { ADMIN_COOKIE } from '$lib/server/auth'

export const actions: Actions = {
  login: ({ cookies, url }) => {
    cookies.set(ADMIN_COOKIE, 'true', { path: '/', httpOnly: true, sameSite: 'lax' })
    redirect(303, url.searchParams.get('next') ?? '/admin/plugins')
  },
  logout: ({ cookies }) => {
    cookies.delete(ADMIN_COOKIE, { path: '/' })
    redirect(303, '/')
  },
}
