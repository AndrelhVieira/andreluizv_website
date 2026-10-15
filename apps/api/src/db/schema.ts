import type { ReadingTime } from '@andreluizv/shared'
import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

const emptyTextArray = sql`'{}'::text[]`

/** One row per post per locale. Translations of the same post share the slug. */
export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    locale: text('locale').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    bodyMdx: text('body_mdx').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    lastmod: timestamp('lastmod', { withTimezone: true }),
    tags: text('tags').array().notNull().default(emptyTextArray),
    images: text('images').array().notNull().default(emptyTextArray),
    authors: text('authors').array().notNull().default(emptyTextArray),
    layout: text('layout').notNull().default('PostBanner'),
    draft: boolean('draft').notNull().default(false),
    featured: boolean('featured').notNull().default(false),
    seriesTitle: text('series_title'),
    seriesOrder: integer('series_order'),
    canonicalUrl: text('canonical_url'),
    bibliography: text('bibliography'),
    readingTime: jsonb('reading_time').$type<ReadingTime>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex('posts_locale_slug_idx').on(t.locale, t.slug),
    index('posts_locale_date_idx').on(t.locale, t.date.desc()),
  ]
)

/** Files stored in Vercel Blob. `sourcePath` keeps the old /static path for imported files. */
export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathname: text('pathname').notNull().unique(),
  url: text('url').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  sourcePath: text('source_path').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PostRow = typeof posts.$inferSelect
export type NewPostRow = typeof posts.$inferInsert
export type AssetRow = typeof assets.$inferSelect
