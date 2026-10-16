import { adminEnv } from 'lib/admin/env'
import { createSessionCookie } from 'lib/admin/session'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

const vercelJwks = createRemoteJWKSet(new URL('https://vercel.com/.well-known/jwks'))

function sameValue(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b || a.length !== b.length) {
    return false
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

async function exchangeCode(code: string, verifier: string, redirectUri: string): Promise<string> {
  const response = await fetch('https://api.vercel.com/login/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: adminEnv.clientId(),
      client_secret: adminEnv.clientSecret(),
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Token exchange failed with ${response.status}`)
  }
  const { id_token: idToken } = (await response.json()) as { id_token?: string }
  if (!idToken) {
    throw new Error('Token response has no id_token')
  }
  return idToken
}

/**
 * Finishes Sign in with Vercel. Only the verified ID token is used: its signature, issuer,
 * audience and nonce are checked, then `sub` must be in ADMIN_VERCEL_USER_IDS. Vercel's
 * access and refresh tokens are never stored; the admin gets its own session cookie.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl
  const fail = (reason: string): NextResponse => {
    console.error(`Admin sign-in failed: ${reason}`)
    const response = NextResponse.redirect(new URL('/admin/login?error=1', origin))
    clearFlowCookies(response)
    return response
  }

  const code = searchParams.get('code')
  const state = request.cookies.get('admin_oauth_state')?.value
  const nonce = request.cookies.get('admin_oauth_nonce')?.value
  const verifier = request.cookies.get('admin_oauth_verifier')?.value

  if (searchParams.get('error')) {
    return fail(`authorization denied (${searchParams.get('error')})`)
  }
  if (!code || !verifier || !sameValue(searchParams.get('state'), state)) {
    return fail('missing code or state mismatch')
  }

  let identity: { sub: string; name: string }
  try {
    const idToken = await exchangeCode(code, verifier, `${origin}/api/admin/auth/callback`)
    const { payload } = await jwtVerify(idToken, vercelJwks, {
      issuer: 'https://vercel.com',
      audience: adminEnv.clientId(),
    })
    if (!sameValue(typeof payload.nonce === 'string' ? payload.nonce : null, nonce)) {
      return fail('nonce mismatch')
    }
    if (!payload.sub) {
      return fail('ID token has no sub')
    }
    identity = {
      sub: payload.sub,
      name: String(payload.name ?? payload.preferred_username ?? ''),
    }
  } catch (error) {
    return fail((error as Error).message)
  }

  const { sub, name } = identity
  if (!adminEnv.allowedUserIds().includes(sub)) {
    const response = NextResponse.redirect(new URL('/admin/login', origin))
    clearFlowCookies(response)
    // Shown on the login page so the owner can add their own id to ADMIN_VERCEL_USER_IDS
    response.cookies.set('admin_denied_sub', sub, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin',
      maxAge: 5 * 60,
    })
    return response
  }

  const session = await createSessionCookie({ sub, name })
  const response = NextResponse.redirect(new URL('/admin', origin))
  response.cookies.set(session.name, session.value, session.options)
  clearFlowCookies(response)
  return response
}

function clearFlowCookies(response: NextResponse): void {
  for (const name of ['admin_oauth_state', 'admin_oauth_nonce', 'admin_oauth_verifier']) {
    response.cookies.set(name, '', { path: '/api/admin/auth', maxAge: 0 })
  }
}
