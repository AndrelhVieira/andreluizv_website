import type { Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'

/**
 * Both sources return the shape Contentlayer generates, so pages and layouts don't care
 * where a post came from. The API source builds the same fields (path, toc, structuredData…).
 */
export type Post = Blog
export type PostSummary = CoreContent<Post>
export type TagCounts = Record<string, number>

export interface PostRoute {
  slug: string
  language: string
  date: string
  lastmod?: string
  draft?: boolean
}

export interface SeriesEntry {
  title: string
  slug: string
  language: string
  isCurrent: boolean
}

export interface ContentSource {
  /** All posts across every locale, newest first. Drafts are hidden in production. */
  getAllPosts(): Promise<PostSummary[]>
  /** Posts for one locale, newest first. Drafts are hidden in production. */
  getPosts(locale: string): Promise<PostSummary[]>
  /** Full post (with compiled body) or null. Series siblings are attached when present. */
  getPost(locale: string, slug: string): Promise<Post | null>
  /** Every post route, for generateStaticParams and the sitemap. */
  getPostRoutes(): Promise<PostRoute[]>
  /** Tag slug -> post count for one locale. */
  getTagCounts(locale: string): Promise<TagCounts>
}

type SeriesCandidate = Pick<Post, 'title' | 'slug' | 'language' | 'series'>

/** Attaches the ordered list of posts in the same series, as the post layouts expect. */
export function withSeries(post: Post, candidates: SeriesCandidate[]): Post {
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

  return { ...post, series: { ...post.series, posts } } as Post
}
