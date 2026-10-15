import { LocaleSchema } from '@andreluizv/shared'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { hasValidApiKey } from '../auth.js'
import type { PostRepository, ReadOptions } from './repository.js'

interface PostRoutesOptions {
  repository: PostRepository
  apiKey: string
}

const DraftsQuery = z.object({ drafts: z.enum(['true', 'false']).default('false') })

/**
 * Drafts are only served to the author. Public responses can be cached by the CDN,
 * draft responses never.
 */
function readOptions(request: FastifyRequest, reply: FastifyReply, apiKey: string): ReadOptions {
  const { drafts } = DraftsQuery.parse(request.query)
  if (drafts === 'false') {
    reply.header('cache-control', 'public, s-maxage=60, stale-while-revalidate=300')
    return { includeDrafts: false }
  }
  if (!hasValidApiKey(request, apiKey)) {
    throw Object.assign(new Error('A valid API key is required to read drafts'), {
      statusCode: 401,
    })
  }
  reply.header('cache-control', 'private, no-store')
  return { includeDrafts: true }
}

export async function postRoutes(
  app: FastifyInstance,
  { repository, apiKey }: PostRoutesOptions
): Promise<void> {
  app.get('/posts', async (request, reply) => {
    const opts = readOptions(request, reply, apiKey)
    const { locale } = z.object({ locale: LocaleSchema.optional() }).parse(request.query)
    return repository.list(locale, opts)
  })

  app.get('/posts/routes', async (request, reply) => {
    return repository.routes(readOptions(request, reply, apiKey))
  })

  app.get('/posts/:locale/:slug', async (request, reply) => {
    const opts = readOptions(request, reply, apiKey)
    const { locale, slug } = z
      .object({ locale: LocaleSchema, slug: z.string().min(1) })
      .parse(request.params)
    const post = await repository.get(locale, slug, opts)
    if (!post) {
      return reply.code(404).send({ error: 'Post not found' })
    }
    return post
  })

  app.get('/tags', async (request, reply) => {
    const opts = readOptions(request, reply, apiKey)
    const { locale } = z.object({ locale: LocaleSchema }).parse(request.query)
    return repository.tagCounts(locale, opts)
  })
}
