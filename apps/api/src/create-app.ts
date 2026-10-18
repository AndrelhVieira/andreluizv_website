import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import { ZodError, z } from 'zod'
import type { HttpError } from './http-error.js'
import type { AssetRepository } from './assets/repository.js'
import { assetRoutes } from './assets/routes.js'
import type { AssetStorage } from './assets/storage.js'
import type { PlanRepository } from './plans/repository.js'
import { planRoutes } from './plans/routes.js'
import type { PostRepository } from './posts/repository.js'
import { postRoutes } from './posts/routes.js'
import { writeRoutes } from './posts/write-routes.js'
import type { RevalidateResult } from './revalidate.js'

export interface AppDeps {
  repository: PostRepository
  assets: AssetRepository
  plans: PlanRepository
  storage: AssetStorage
  apiKey: string
  /** Tells the site that content changed; must never throw */
  revalidate: () => Promise<RevalidateResult>
}

export function buildApp(deps: AppDeps, options: FastifyServerOptions = {}): FastifyInstance {
  return configureApp(Fastify(options), deps)
}

/** Registers error handling and routes on an existing instance. */
export function configureApp(app: FastifyInstance, deps: AppDeps): FastifyInstance {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'Invalid request', issues: z.flattenError(error) })
    }
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    if (statusCode >= 500) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
    const { details } = error as Partial<HttpError>
    return reply.code(statusCode).send({ error: (error as Error).message, ...details })
  })

  app.get('/health', async () => ({ status: 'ok' }))
  app.register(postRoutes, deps)
  // Each register() is its own scope: the API key hook only guards the routes inside it
  app.register(writeRoutes, deps)
  app.register(assetRoutes, deps)
  app.register(planRoutes, deps)

  return app
}
