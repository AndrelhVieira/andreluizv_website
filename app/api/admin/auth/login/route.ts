import { adminEnv } from 'lib/admin/env'
import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

/** Starts Sign in with Vercel: authorization code flow with PKCE (S256), state and nonce. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const state = crypto.randomBytes(32).toString('base64url')
  const nonce = crypto.randomBytes(32).toString('base64url')
  const codeVerifier = crypto.randomBytes(48).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')

  const params = new URLSearchParams({
    client_id: adminEnv.clientId(),
    redirect_uri: `${request.nextUrl.origin}/api/admin/auth/callback`,
    response_type: 'code',
    scope: 'openid profile',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  const response = NextResponse.redirect(`https://vercel.com/oauth/authorize?${params}`)
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/admin/auth',
    maxAge: 10 * 60,
  }
  response.cookies.set('admin_oauth_state', state, options)
  response.cookies.set('admin_oauth_nonce', nonce, options)
  response.cookies.set('admin_oauth_verifier', codeVerifier, options)
  return response
}
