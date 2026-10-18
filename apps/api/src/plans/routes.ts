import { PostPlanCreateSchema, PostPlanPatchSchema } from '@andreluizv/shared'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireApiKey } from '../auth.js'
import { httpError } from '../http-error.js'
import type { PlanRepository } from './repository.js'

export interface PlanRoutesOptions {
  plans: PlanRepository
  apiKey: string
}

const Params = z.object({ id: z.uuid() })

/**
 * The admin's blog schedule. Private like drafts: every route needs the API key. Plans
 * never show on the site, so writes don't call the revalidation webhook.
 */
export async function planRoutes(
  app: FastifyInstance,
  { plans, apiKey }: PlanRoutesOptions
): Promise<void> {
  app.addHook('preHandler', requireApiKey(apiKey))

  const parseId = (params: unknown): string => {
    const parsed = Params.safeParse(params)
    if (!parsed.success) {
      throw httpError(404, 'Plan not found')
    }
    return parsed.data.id
  }

  app.get('/plans', async () => plans.list())

  app.get('/plans/:id', async (request) => {
    const plan = await plans.get(parseId(request.params))
    if (!plan) throw httpError(404, 'Plan not found')
    return plan
  })

  app.post('/plans', async (request, reply) => {
    const plan = await plans.create(PostPlanCreateSchema.parse(request.body))
    return reply.code(201).send(plan)
  })

  app.patch('/plans/:id', async (request) => {
    const id = parseId(request.params)
    const plan = await plans.update(id, PostPlanPatchSchema.parse(request.body))
    if (!plan) throw httpError(404, 'Plan not found')
    return plan
  })

  app.delete('/plans/:id', async (request) => {
    if (!(await plans.remove(parseId(request.params)))) {
      throw httpError(404, 'Plan not found')
    }
    return { status: 'deleted' }
  })
}
