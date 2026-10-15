import type { Locale, Post, PostRoute, PostSummary, TagCounts } from '@andreluizv/shared'
import { and, asc, desc, eq, type SQL } from 'drizzle-orm'
import type { Db } from '../db/client'
import { posts } from '../db/schema'
import { countTags, toPost, toPostRoute, toPostSummary } from './mappers'

export interface ReadOptions {
  includeDrafts: boolean
}

export interface PostRepository {
  /** Newest first. Without a locale, returns every locale. */
  list(locale: Locale | undefined, opts: ReadOptions): Promise<PostSummary[]>
  get(locale: Locale, slug: string, opts: ReadOptions): Promise<Post | null>
  routes(opts: ReadOptions): Promise<PostRoute[]>
  tagCounts(locale: Locale, opts: ReadOptions): Promise<TagCounts>
}

function where(locale: Locale | undefined, opts: ReadOptions): SQL | undefined {
  return and(
    locale ? eq(posts.locale, locale) : undefined,
    opts.includeDrafts ? undefined : eq(posts.draft, false)
  )
}

// Slug as tie-breaker: posts published on the same day must keep a stable order
const newestFirst = [desc(posts.date), asc(posts.slug)]

export function createPostRepository(db: Db): PostRepository {
  return {
    async list(locale, opts) {
      const rows = await db
        .select()
        .from(posts)
        .where(where(locale, opts))
        .orderBy(...newestFirst)
      return rows.map(toPostSummary)
    },

    async get(locale, slug, opts) {
      const [row] = await db
        .select()
        .from(posts)
        .where(and(where(locale, opts), eq(posts.slug, slug)))
        .limit(1)
      return row ? toPost(row) : null
    },

    async routes(opts) {
      const rows = await db
        .select({
          locale: posts.locale,
          slug: posts.slug,
          date: posts.date,
          lastmod: posts.lastmod,
          draft: posts.draft,
        })
        .from(posts)
        .where(where(undefined, opts))
        .orderBy(...newestFirst)
      return rows.map(toPostRoute)
    },

    async tagCounts(locale, opts) {
      const rows = await db.select({ tags: posts.tags }).from(posts).where(where(locale, opts))
      return countTags(rows.map((r) => r.tags))
    },
  }
}
