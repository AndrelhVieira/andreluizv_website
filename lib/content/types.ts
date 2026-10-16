import type { ReadingTime } from '@andreluizv/shared'
import type { Toc } from 'pliny/mdx-plugins/index.js'

export type TagCounts = Record<string, number>

export interface SeriesEntry {
  title: string
  slug: string
  language: string
  isCurrent: boolean
}

export interface PostSeries {
  title: string
  order: number
  /** Ordered posts of the series, attached on the post page */
  posts?: SeriesEntry[]
}

/**
 * What lists, feeds, search and layouts get. Field names follow what the site used with
 * Contentlayer (`language`, `path`, `structuredData`…), so layouts didn't need to change.
 */
export interface PostSummary {
  type: 'Blog'
  title: string
  /** ISO 8601 */
  date: string
  lastmod?: string
  language: string
  slug: string
  tags: string[]
  featured?: boolean
  draft?: boolean
  summary?: string
  images?: string[]
  authors: string[]
  layout?: string
  canonicalUrl?: string
  bibliography?: string
  series?: PostSeries
  readingTime: ReadingTime
  /** blog/{locale}/{slug} */
  path: string
  /** Empty for summaries; the post page gets the real table of contents */
  toc: Toc
  structuredData: Record<string, unknown>
}

/** A post with its compiled body, ready for pliny's MDXLayoutRenderer */
export interface Post extends PostSummary {
  _id: string
  body: { raw: string; code: string }
}

export interface PostRoute {
  slug: string
  language: string
  date: string
  lastmod?: string
  draft?: boolean
}

/** Attaches the ordered list of posts in the same series, as the post layouts expect. */
export function withSeries(post: Post, candidates: PostSummary[]): Post {
  if (!post.series) {
    return post
  }

  const posts: SeriesEntry[] = candidates
    .filter((p) => p.language === post.language && p.series?.title === post.series?.title)
    .sort((a, b) => Number(a.series?.order ?? 0) - Number(b.series?.order ?? 0))
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      language: p.language,
      isCurrent: p.slug === post.slug,
    }))

  return { ...post, series: { ...post.series, posts } }
}

/** The summary part of a post (drops the compiled body), for layouts */
export function toSummary(post: Post): PostSummary {
  const summary: Partial<Post> = { ...post }
  delete summary._id
  delete summary.body
  return summary as PostSummary
}
