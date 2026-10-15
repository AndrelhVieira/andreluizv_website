import { z } from 'zod'

const RevalidateEnvSchema = z.object({
  SITE_REVALIDATE_URL: z.url(),
  REVALIDATE_SECRET: z.string().min(32),
})

export type RevalidateResult = { status: 'revalidated' } | { status: 'skipped'; reason: string }

/**
 * Asks the site to drop its cached content (POST /api/revalidate), so changes show up
 * without a deploy. Skipped when the site URL or secret are not configured.
 */
export async function revalidateSite(
  env: NodeJS.ProcessEnv = process.env
): Promise<RevalidateResult> {
  const parsed = RevalidateEnvSchema.safeParse(env)
  if (!parsed.success) {
    return { status: 'skipped', reason: 'SITE_REVALIDATE_URL or REVALIDATE_SECRET not set' }
  }

  const { SITE_REVALIDATE_URL, REVALIDATE_SECRET } = parsed.data
  const response = await fetch(SITE_REVALIDATE_URL, {
    method: 'POST',
    headers: { 'x-revalidate-secret': REVALIDATE_SECRET },
  })
  if (!response.ok) {
    throw new Error(`Site revalidation failed: ${response.status} ${await response.text()}`)
  }
  return { status: 'revalidated' }
}
