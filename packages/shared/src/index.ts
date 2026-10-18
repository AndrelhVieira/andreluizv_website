/**
 * Content API contract, shared by the API (apps/api) and the site.
 */
import { z } from 'zod'

export const locales = ['en', 'pt', 'es'] as const
export const LocaleSchema = z.enum(locales)
export type Locale = z.infer<typeof LocaleSchema>

export const ReadingTimeSchema = z.object({
  text: z.string(),
  minutes: z.number(),
  time: z.number(),
  words: z.number(),
})
export type ReadingTime = z.infer<typeof ReadingTimeSchema>

export const PostSummarySchema = z.object({
  locale: LocaleSchema,
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  /** ISO 8601 */
  date: z.string(),
  /** ISO 8601 */
  lastmod: z.string().nullable(),
  tags: z.array(z.string()),
  images: z.array(z.string()),
  authors: z.array(z.string()),
  layout: z.string(),
  draft: z.boolean(),
  featured: z.boolean(),
  series: z.object({ title: z.string(), order: z.number() }).nullable(),
  canonicalUrl: z.string().nullable(),
  readingTime: ReadingTimeSchema,
})
export type PostSummary = z.infer<typeof PostSummarySchema>

export const PostSchema = PostSummarySchema.extend({
  bodyMdx: z.string(),
  bibliography: z.string().nullable(),
})
export type Post = z.infer<typeof PostSchema>

export const PostRouteSchema = PostSummarySchema.pick({
  locale: true,
  slug: true,
  date: true,
  lastmod: true,
  draft: true,
})
export type PostRoute = z.infer<typeof PostRouteSchema>

/** Tag slug -> number of posts */
export const TagCountsSchema = z.record(z.string(), z.number())
export type TagCounts = z.infer<typeof TagCountsSchema>

/** URL slug: lowercase words joined by hyphens */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Editable fields of a post plan (the admin's blog schedule) */
const postPlanFields = {
  title: z.string().trim().min(1).max(200),
  notes: z.string().max(5000).nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  /** Languages the post is planned in */
  locales: z.array(LocaleSchema),
  /** YYYY-MM-DD; null while it is only an idea */
  plannedDate: z.iso.date().nullable(),
  /** The post this plan became; translations share it */
  slug: z.string().regex(SLUG_PATTERN).nullable(),
  /** Added from the CLI (a Claude session), waiting to be accepted in the admin */
  suggested: z.boolean(),
}

export const PostPlanSchema = z.object({
  id: z.string(),
  ...postPlanFields,
  /** ISO 8601 */
  createdAt: z.string(),
  /** ISO 8601 */
  updatedAt: z.string(),
})
export type PostPlan = z.infer<typeof PostPlanSchema>

/** POST /plans: only the title is required */
export const PostPlanCreateSchema = z.object(postPlanFields).partial().required({ title: true })
export type PostPlanCreate = z.infer<typeof PostPlanCreateSchema>

/** PATCH /plans/:id: only the fields sent change */
export const PostPlanPatchSchema = z.object(postPlanFields).partial()
export type PostPlanPatch = z.infer<typeof PostPlanPatchSchema>
