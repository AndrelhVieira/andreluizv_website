/**
 * Single entry point for blog content.
 *
 * Pages and layouts must read posts through this module, never from
 * `contentlayer/generated` directly. Today the source is Contentlayer; the
 * content API will plug in here behind `CONTENT_SOURCE` without touching callers.
 *
 * Every function is async on purpose: the API source will need it.
 */
import tagData from 'app/[locale]/tag-data.json'
import { allBlogs, type Blog } from 'contentlayer/generated'
import { allCoreContent, sortPosts, type CoreContent } from 'pliny/utils/contentlayer'

export type Post = Blog
export type PostSummary = CoreContent<Post>
export type TagCounts = Record<string, number>

export interface SeriesEntry {
  title: string
  slug: string
  language: string
  isCurrent: boolean
}

/** All posts across every locale, newest first. Drafts are hidden in production. */
export async function getAllPosts(): Promise<PostSummary[]> {
  return allCoreContent(sortPosts(allBlogs))
}

/** Posts for one locale, newest first. Drafts are hidden in production. */
export async function getPosts(locale: string): Promise<PostSummary[]> {
  return allCoreContent(sortPosts(allBlogs.filter((p) => p.language === locale)))
}

/** Full post (with compiled body) or null. Series siblings are attached when present. */
export async function getPost(locale: string, slug: string): Promise<Post | null> {
  const post = allBlogs.find((p) => p.language === locale && p.slug === slug)
  if (!post) {
    return null
  }

  if (!post.series) {
    return post
  }

  const seriesPosts: SeriesEntry[] = allBlogs
    .filter((p) => p.language === locale && p.series?.title === post.series?.title)
    .sort((a, b) => Number(a.series?.order ?? 0) - Number(b.series?.order ?? 0))
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      language: p.language,
      isCurrent: p.slug === post.slug,
    }))

  return { ...post, series: { ...post.series, posts: seriesPosts } } as Post
}

/** Every post route, used by generateStaticParams and the sitemap. Includes drafts. */
export async function getPostRoutes(): Promise<
  { slug: string; language: string; date: string; lastmod?: string; draft?: boolean }[]
> {
  return allBlogs.map(({ slug, language, date, lastmod, draft }) => ({
    slug,
    language,
    date,
    lastmod,
    draft,
  }))
}

/** Tag slug -> post count for one locale. */
export async function getTagCounts(locale: string): Promise<TagCounts> {
  return (tagData as Record<string, TagCounts>)[locale] ?? {}
}
