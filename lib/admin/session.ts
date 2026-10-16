import 'server-only'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminEnv } from './env'

const SESSION_COOKIE = 'admin_session'
const SESSION_AUDIENCE = 'andreluizv-admin'
const SESSION_TTL_SECONDS = 8 * 60 * 60

export interface AdminSession {
  /** Vercel user id */
  sub: string
  name: string
}

export interface SessionCookie {
  name: string
  value: string
  options: {
    httpOnly: true
    secure: boolean
    sameSite: 'lax'
    path: string
    maxAge: number
  }
}

/** Signed session cookie for a verified admin; the caller sets it on its response. */
export async function createSessionCookie({ sub, name }: AdminSession): Promise<SessionCookie> {
  const token = await new SignJWT({ name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(adminEnv.sessionSecret())

  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // lax, not strict: the cookie is set at the end of a redirect chain that starts on vercel.com
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    },
  }
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/** The current admin, or null. The allowlist is checked on every call, so removing an id revokes access. */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) {
    return null
  }
  try {
    const { payload } = await jwtVerify(token, adminEnv.sessionSecret(), {
      audience: SESSION_AUDIENCE,
      algorithms: ['HS256'],
    })
    if (!payload.sub || !adminEnv.allowedUserIds().includes(payload.sub)) {
      return null
    }
    return { sub: payload.sub, name: String(payload.name ?? '') }
  } catch {
    return null
  }
}

/**
 * Every admin page and server action starts with this. Middleware alone is not enough:
 * server actions are plain POST endpoints that can be called directly.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }
  return session
}
