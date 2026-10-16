import type { Locale, Post, PostRoute, PostSummary, TagCounts } from '@andreluizv/shared'
import { and, asc, desc, eq, type SQL } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { posts, type NewPostRow } from '../db/schema.js'
import { countTags, toPost, toPostRoute, toPostSummary } from './mappers.js'

export interface ReadOptions {
  includeDrafts: boolean
}

export interface PostRepository {
  /** Newest first. Without a locale, returns every locale. */
  list(locale: Locale | undefined, opts: ReadOptions): Promise<PostSummary[]>
  get(locale: Locale, slug: string, opts: ReadOptions): Promise<Post | null>
  routes(opts: ReadOptions): Promise<PostRoute[]>
  tagCounts(locale: Locale, opts: ReadOptions): Promise<TagCounts>
  /** Creates the post, or replaces the one with the same locale and slug */
  save(row: NewPostRow): Promise<{ created: boolean; post: Post }>
  /** Returns false when there was nothing to delete */
  remove(locale: Locale, slug: string): Promise<boolean>
}

function where(locale: Locale | undefined, opts: ReadOptions): SQL | undefined {
  return and(
    locale ? eq(posts.locale, locale) : undefined,
    opts.includeDrafts ? undefined : eq(posts.draft, false)
  )
}

// Ties must be broken all the way down: translations share date AND slug, so the locale
// is the last key. Without it, lists mixing locales come back in a different order each time.
const newestFirst = [desc(posts.date), asc(posts.slug), asc(posts.locale)]

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

    async save(row) {
      return db.transaction(async (tx) => {
        const [existing] = await tx
          .select({ id: posts.id })
          .from(posts)
          .where(and(eq(posts.locale, row.locale), eq(posts.slug, row.slug)))
          .limit(1)
        const [saved] = await tx
          .insert(posts)
          .values(row)
          .onConflictDoUpdate({
            target: [posts.locale, posts.slug],
            set: { ...row, updatedAt: new Date() },
          })
          .returning()
        if (!saved) {
          throw new Error(`Saving ${row.locale}/${row.slug} returned no row`)
        }
        return { created: !existing, post: toPost(saved) }
      })
    },

    async remove(locale, slug) {
      const deleted = await db
        .delete(posts)
        .where(and(eq(posts.locale, locale), eq(posts.slug, slug)))
        .returning({ id: posts.id })
      return deleted.length > 0
    },
  }
}
