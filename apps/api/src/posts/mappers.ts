import type { Locale, Post, PostRoute, PostSummary, TagCounts } from '@andreluizv/shared'
import { slug } from 'github-slugger'
import type { PostRow } from '../db/schema'

export function toPostSummary(row: PostRow): PostSummary {
  return {
    locale: row.locale as Locale,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    date: row.date.toISOString(),
    lastmod: row.lastmod?.toISOString() ?? null,
    tags: row.tags,
    images: row.images,
    authors: row.authors,
    layout: row.layout,
    draft: row.draft,
    featured: row.featured,
    series:
      row.seriesTitle !== null ? { title: row.seriesTitle, order: row.seriesOrder ?? 0 } : null,
    canonicalUrl: row.canonicalUrl,
    readingTime: row.readingTime,
  }
}

export function toPost(row: PostRow): Post {
  return { ...toPostSummary(row), bodyMdx: row.bodyMdx, bibliography: row.bibliography }
}

export function toPostRoute(
  row: Pick<PostRow, 'locale' | 'slug' | 'date' | 'lastmod' | 'draft'>
): PostRoute {
  return {
    locale: row.locale as Locale,
    slug: row.slug,
    date: row.date.toISOString(),
    lastmod: row.lastmod?.toISOString() ?? null,
    draft: row.draft,
  }
}

/** Same slugging Contentlayer used for tag-data.json, so tag URLs stay the same. */
export function countTags(tagLists: string[][]): TagCounts {
  const counts: TagCounts = {}
  for (const tags of tagLists) {
    for (const tag of tags) {
      const key = slug(tag)
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}
