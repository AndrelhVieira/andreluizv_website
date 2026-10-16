import 'server-only'

/**
 * Admin settings, read on demand so a build without them still works: the admin pages are
 * dynamic and only need these at request time.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set`)
  }
  return value
}

export const adminEnv = {
  /** Sign in with Vercel app (team Settings → Apps) */
  clientId: (): string => required('VERCEL_APP_CLIENT_ID'),
  clientSecret: (): string => required('VERCEL_APP_CLIENT_SECRET'),
  /** HS256 key for the admin session cookie, at least 32 characters */
  sessionSecret: (): Uint8Array => {
    const secret = required('ADMIN_SESSION_SECRET')
    if (secret.length < 32) {
      throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters')
    }
    return new TextEncoder().encode(secret)
  },
  /** Comma-separated Vercel user ids (the ID token `sub`) allowed into /admin */
  allowedUserIds: (): string[] =>
    required('ADMIN_VERCEL_USER_IDS')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  /**
   * Write key for the content API. Separate from CONTENT_API_KEY, which `yarn dev` uses to
   * show drafts on the public pages; this one is only ever read by lib/admin.
   */
  contentApiKey: (): string =>
    // Locally the dev API's key (.env.development.local) is enough; production needs its own
    process.env.NODE_ENV === 'development' && !process.env.ADMIN_CONTENT_API_KEY
      ? required('CONTENT_API_KEY')
      : required('ADMIN_CONTENT_API_KEY'),
  contentApiUrl: (): string => process.env.CONTENT_API_URL || 'http://localhost:4000',
}
