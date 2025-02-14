import {
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
  redirect,
} from '@remix-run/cloudflare'
import type { Session } from '@remix-run/cloudflare'

import * as jose from 'jose'
import type { JWTPayload } from 'jose'

const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    domain: COOKIE_DOMAIN,
    name: '3ID_SESSION',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV == 'production',
    maxAge: 60 * 60 * 4,
    httpOnly: true,
    secrets: [sessionSecret],
  },
})

export async function createUserSession(
  jwt: string,
  redirectTo: string,
  defaultProfileUrn?: string // NOTE: storing this temporarily in the session util RPC url remove address
) {
  const parsedJWT = parseJwt(jwt)
  const session = await storage.getSession()
  session.set('core', parsedJWT.iss)
  session.set('jwt', jwt)
  session.set('defaultProfileUrn', defaultProfileUrn)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

// TODO: reset cookie maxAge if valid
export function getUserSession(request: Request, renew: boolean = true) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyUserSession(
  session: Session,
  searchParams: URLSearchParams
) {
  return redirect(`/authenticate?${searchParams}`, {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

export async function requireJWT(
  request: Request,
  searchParams: URLSearchParams = new URLSearchParams(request.url)
) {
  const session = await getUserSession(request)
  const jwt = session.get('jwt')

  if (!jwt || typeof jwt !== 'string') {
    throw redirect(`/authenticate?${searchParams}`)
  }
  if (jwt) {
    const parsedJWT = parseJwt(jwt)
    if (parsedJWT.exp < Date.now() / 1000) {
      throw await destroyUserSession(session, searchParams)
    }
  }

  return jwt
}

export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}
