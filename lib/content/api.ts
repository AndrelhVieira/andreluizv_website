import type {
  Post as ApiPost,
  PostRoute as ApiPostRoute,
  PostSummary as ApiPostSummary,
  TagCounts,
} from '@andreluizv/shared'
import siteMetadata from '@/data/siteMetadata'
import { locales } from 'app/[locale]/i18n/settings'
import { compileMdx } from 'lib/mdx/compile'
import { withSeries, type Post, type PostRoute, type PostSummary } from './types'

/** Tag on every API fetch; the revalidation webhook invalidates it after content changes */
export const CONTENT_CACHE_TAG = 'posts'

/** Fallback when the webhook is not called: content is never staler than this */
const REVALIDATE_SECONDS = 3600

const apiUrl = process.env.CONTENT_API_URL ?? 'http://localhost:4000'

// Drafts show up in `yarn dev` when CONTENT_API_KEY is set; the key never reaches production builds
const draftKey = process.env.NODE_ENV !== 'production' ? process.env.CONTENT_API_KEY : undefined

async function request<T>(path: string, query: Record<string, string> = {}): Promise<T | null> {
  const url = new URL(path, apiUrl)
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }
  if (draftKey) {
    url.searchParams.set('drafts', 'true')
  }

  const response = await fetch(url, {
    headers: draftKey ? { 'x-api-key': draftKey } : undefined,
    cache: 'force-cache',
    next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] },
  })
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`Content API responded ${response.status} for ${url.pathname}`)
  }
  return (await response.json()) as T
}

async function requireData<T>(path: string, query?: Record<string, string>): Promise<T> {
  const data = await request<T>(path, query)
  if (data === null) {
    throw new Error(`Content API returned 404 for ${path}`)
  }
  return data
}

/**
 * Paths the middleware skips (e.g. /static/blog/x.webp, /data/blog/x) reach the [locale]
 * routes with any "locale". The API rejects those with 400; for the site they don't exist.
 */
const isSupportedLocale = (locale: string): boolean =>
  (locales as readonly string[]).includes(locale)

function toPostSummary(post: ApiPostSummary): PostSummary {
  const path = `blog/${post.locale}/${post.slug}`
  return {
    type: 'Blog',
    title: post.title,
    date: post.date,
    lastmod: post.lastmod ?? undefined,
    language: post.locale,
    slug: post.slug,
    tags: post.tags,
    featured: post.featured,
    draft: post.draft,
    summary: post.summary ?? undefined,
    images: post.images,
    authors: post.authors,
    layout: post.layout,
    canonicalUrl: post.canonicalUrl ?? undefined,
    series: post.series ?? undefined,
    readingTime: post.readingTime,
    path,
    toc: [],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      dateModified: post.lastmod ?? post.date,
      description: post.summary ?? undefined,
      image: post.images[0] ?? siteMetadata.socialBanner,
      url: `${siteMetadata.siteUrl}/${post.locale}/blog/${post.slug}`,
    },
  }
}

async function toPost(post: ApiPost): Promise<Post> {
  const { code, toc } = await compileMdx(post.bodyMdx, { bibliography: post.bibliography })
  return {
    ...toPostSummary(post),
    _id: `blog/${post.locale}/${post.slug}.mdx`,
    bibliography: post.bibliography ?? undefined,
    toc,
    body: { raw: post.bodyMdx, code },
  }
}

/** All posts across every locale, newest first. Drafts only in development. */
export async function getAllPosts(): Promise<PostSummary[]> {
  const posts = await requireData<ApiPostSummary[]>('/posts')
  return posts.map(toPostSummary)
}

/** Posts for one locale, newest first. Drafts only in development. */
export async function getPosts(locale: string): Promise<PostSummary[]> {
  if (!isSupportedLocale(locale)) {
    return []
  }
  const posts = await requireData<ApiPostSummary[]>('/posts', { locale })
  return posts.map(toPostSummary)
}

/** Full post with compiled body, or null. Series siblings are attached when present. */
export async function getPost(locale: string, slug: string): Promise<Post | null> {
  if (!isSupportedLocale(locale)) {
    return null
  }
  const post = await request<ApiPost>(`/posts/${locale}/${encodeURIComponent(slug)}`)
  if (!post) {
    return null
  }
  const full = await toPost(post)
  return post.series ? withSeries(full, await getPosts(locale)) : full
}

/** Every post route, for generateStaticParams and the sitemap. */
export async function getPostRoutes(): Promise<PostRoute[]> {
  const routes = await requireData<ApiPostRoute[]>('/posts/routes')
  return routes.map((r) => ({
    slug: r.slug,
    language: r.locale,
    date: r.date,
    lastmod: r.lastmod ?? undefined,
    draft: r.draft,
  }))
}

/** Tag slug -> post count for one locale. */
export async function getTagCounts(locale: string): Promise<TagCounts> {
  if (!isSupportedLocale(locale)) {
    return {}
  }
  return requireData<TagCounts>('/tags', { locale })
}
