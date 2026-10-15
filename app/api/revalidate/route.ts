import { CONTENT_CACHE_TAG } from 'lib/content'
import { revalidateTag } from 'next/cache'
import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (value: string): Buffer => createHash('sha256').update(value).digest()

/**
 * Called by the content API after posts change, so ISR pages, feeds and the search
 * index pick up new content without a deploy.
 *
 *   POST /api/revalidate  with header  x-revalidate-secret: $REVALIDATE_SECRET
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return Response.json({ error: 'Revalidation is not configured' }, { status: 503 })
  }

  const received = request.headers.get('x-revalidate-secret') ?? ''
  if (!received || !timingSafeEqual(digest(received), digest(secret))) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }

  revalidateTag(CONTENT_CACHE_TAG)
  return Response.json({ revalidated: true, tag: CONTENT_CACHE_TAG })
}
