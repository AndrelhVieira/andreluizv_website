import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import { ZodError, z } from 'zod'
import type { PostRepository } from './posts/repository'
import { postRoutes } from './posts/routes'

export interface AppDeps {
  repository: PostRepository
  apiKey: string
}

export function buildApp(deps: AppDeps, options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify(options)

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'Invalid request', issues: z.flattenError(error) })
    }
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    if (statusCode >= 500) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
    return reply.code(statusCode).send({ error: (error as Error).message })
  })

  app.get('/health', async () => ({ status: 'ok' }))
  app.register(postRoutes, deps)

  return app
}
