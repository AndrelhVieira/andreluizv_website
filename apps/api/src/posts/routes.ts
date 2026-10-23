import { LocaleSchema } from '@andreluizv/shared'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { hasValidApiKey } from '../auth.js'
import { httpError } from '../http-error.js'
import type { PostRepository, ReadOptions } from './repository.js'

interface PostRoutesOptions {
  repository: PostRepository
  apiKey: string
}

const DraftsQuery = z.object({ drafts: z.enum(['true', 'false']).default('false') })

/**
 * Drafts are only served to the author. Nothing is cached by the CDN: the site keeps its own
 * copy (ISR, tag `posts`) and refetches right after the revalidation webhook, so a CDN copy
 * served it the pre-write content and a just-published post stayed hidden for an hour.
 */
function readOptions(request: FastifyRequest, reply: FastifyReply, apiKey: string): ReadOptions {
  const { drafts } = DraftsQuery.parse(request.query)
  if (drafts === 'false') {
    reply.header('cache-control', 'public, max-age=0, must-revalidate')
    return { includeDrafts: false }
  }
  if (!hasValidApiKey(request, apiKey)) {
    throw httpError(401, 'A valid API key is required to read drafts')
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
