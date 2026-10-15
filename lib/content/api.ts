import type {
  Post as ApiPost,
  PostRoute as ApiPostRoute,
  PostSummary as ApiPostSummary,
  TagCounts,
} from '@andreluizv/shared'
import siteMetadata from '@/data/siteMetadata'
import { compileMdx } from 'lib/mdx/compile'
import { withSeries, type ContentSource, type Post, type PostSummary } from './types'

/** Tag on every API fetch; the revalidation webhook invalidates it after content changes */
export const CONTENT_CACHE_TAG = 'posts'

/** Fallback when the webhook is not called: content is never staler than this */
const REVALIDATE_SECONDS = 3600

const apiUrl = process.env.CONTENT_API_URL ?? 'http://localhost:4000'

// Drafts show up in development, like they do with Contentlayer; the key never reaches production builds
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

/** Same fields Contentlayer computes in contentlayer.config.ts */
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
    filePath: `${path}.mdx`,
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
  } as unknown as PostSummary
}

async function toPost(post: ApiPost): Promise<Post> {
  const { code, toc } = await compileMdx(post.bodyMdx, { bibliography: post.bibliography })
  return {
    ...toPostSummary(post),
    _id: `blog/${post.locale}/${post.slug}.mdx`,
    bibliography: post.bibliography ?? undefined,
    toc,
    body: { raw: post.bodyMdx, code },
  } as unknown as Post
}

/** Posts served by apps/api (Neon + Vercel Blob) */
export const apiSource: ContentSource = {
  async getAllPosts() {
    const posts = await requireData<ApiPostSummary[]>('/posts')
    return posts.map(toPostSummary)
  },

  async getPosts(locale) {
    const posts = await requireData<ApiPostSummary[]>('/posts', { locale })
    return posts.map(toPostSummary)
  },

  async getPost(locale, slug) {
    const post = await request<ApiPost>(`/posts/${locale}/${encodeURIComponent(slug)}`)
    if (!post) {
      return null
    }
    const full = await toPost(post)
    if (!post.series) {
      return full
    }
    const siblings = await apiSource.getPosts(locale)
    return withSeries(full, siblings as unknown as Post[])
  },

  async getPostRoutes() {
    const routes = await requireData<ApiPostRoute[]>('/posts/routes')
    return routes.map((r) => ({
      slug: r.slug,
      language: r.locale,
      date: r.date,
      lastmod: r.lastmod ?? undefined,
      draft: r.draft,
    }))
  },

  async getTagCounts(locale) {
    return requireData<TagCounts>('/tags', { locale })
  },
}
