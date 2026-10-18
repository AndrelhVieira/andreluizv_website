'use server'

import { PostPlanCreateSchema } from '@andreluizv/shared'
import { createPlan, deletePlan, updatePlan } from 'lib/admin/content'
import { requireAdmin } from 'lib/admin/session'
import { revalidatePath } from 'next/cache'

// Server actions are public POST endpoints: each one checks the session itself.

export type PlanActionResult = { ok: true } | { ok: false; message: string }

export interface PlanFormValues {
  title: string
  notes: string
  tags: string[]
  locales: string[]
  /** YYYY-MM-DD or '' */
  plannedDate: string
  /** '' when no post is linked */
  slug: string
}

function toPlanInput(values: PlanFormValues): unknown {
  return {
    title: values.title,
    notes: values.notes.trim() || null,
    tags: values.tags,
    locales: values.locales,
    plannedDate: values.plannedDate || null,
    slug: values.slug.trim() || null,
  }
}

async function run(task: () => Promise<unknown>): Promise<PlanActionResult> {
  try {
    await task()
  } catch (error) {
    return { ok: false, message: (error as Error).message }
  }
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/** Creates a plan when `id` is null, otherwise replaces its fields */
export async function savePlanAction(
  id: string | null,
  values: PlanFormValues
): Promise<PlanActionResult> {
  await requireAdmin()
  const parsed = PostPlanCreateSchema.safeParse(toPlanInput(values))
  if (!parsed.success) {
    const [issue] = parsed.error.issues
    const field = issue?.path.join('.') ?? ''
    return { ok: false, message: `Campo inválido${field ? ` (${field})` : ''}: ${issue?.message}` }
  }
  return run(() => (id ? updatePlan(id, parsed.data) : createPlan(parsed.data)))
}

/** A CLI suggestion becomes a regular idea */
export async function acceptPlanAction(id: string): Promise<PlanActionResult> {
  await requireAdmin()
  return run(() => updatePlan(id, { suggested: false }))
}

export async function deletePlanAction(id: string): Promise<PlanActionResult> {
  await requireAdmin()
  return run(() => deletePlan(id))
}
