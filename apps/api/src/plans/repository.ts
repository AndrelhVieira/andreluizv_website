import type { Locale, PostPlan, PostPlanCreate, PostPlanPatch } from '@andreluizv/shared'
import { asc, desc, eq, sql } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { postPlans, type PostPlanRow } from '../db/schema.js'

export interface PlanRepository {
  /** Dated plans first (soonest first), then undated ideas newest first */
  list(): Promise<PostPlan[]>
  get(id: string): Promise<PostPlan | null>
  create(input: PostPlanCreate): Promise<PostPlan>
  /** null when there is no plan with this id */
  update(id: string, patch: PostPlanPatch): Promise<PostPlan | null>
  remove(id: string): Promise<boolean>
}

export function toPostPlan(row: PostPlanRow): PostPlan {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    tags: row.tags,
    locales: row.locales as Locale[],
    plannedDate: row.plannedDate,
    slug: row.slug,
    suggested: row.suggested,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function createPlanRepository(db: Db): PlanRepository {
  return {
    async list() {
      const rows = await db
        .select()
        .from(postPlans)
        .orderBy(
          sql`${postPlans.plannedDate} asc nulls last`,
          desc(postPlans.createdAt),
          asc(postPlans.id)
        )
      return rows.map(toPostPlan)
    },

    async get(id) {
      const [row] = await db.select().from(postPlans).where(eq(postPlans.id, id))
      return row ? toPostPlan(row) : null
    },

    async create(input) {
      const [row] = await db.insert(postPlans).values(input).returning()
      if (!row) throw new Error('Insert returned no row')
      return toPostPlan(row)
    },

    async update(id, patch) {
      if (Object.keys(patch).length === 0) {
        return this.get(id)
      }
      const [row] = await db.update(postPlans).set(patch).where(eq(postPlans.id, id)).returning()
      return row ? toPostPlan(row) : null
    },

    async remove(id) {
      const rows = await db
        .delete(postPlans)
        .where(eq(postPlans.id, id))
        .returning({ id: postPlans.id })
      return rows.length > 0
    },
  }
}
