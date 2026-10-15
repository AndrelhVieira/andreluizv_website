/**
 * Single entry point for blog content.
 *
 * Pages and layouts must read posts through this module, never from
 * `contentlayer/generated` or the content API directly.
 *
 * CONTENT_SOURCE picks where posts come from:
 * - `contentlayer` (default): MDX files in data/blog, compiled at build time
 * - `api`: the content API (apps/api), cached with ISR and refreshed by /api/revalidate
 */
import { cache } from 'react'
import { apiSource } from './api'
import { contentlayerSource } from './contentlayer'
import type { ContentSource } from './types'

export type { Post, PostRoute, PostSummary, SeriesEntry, TagCounts } from './types'
export { CONTENT_CACHE_TAG } from './api'

export const contentSource: 'api' | 'contentlayer' =
  process.env.CONTENT_SOURCE === 'api' ? 'api' : 'contentlayer'

const source: ContentSource = contentSource === 'api' ? apiSource : contentlayerSource

export const getAllPosts = (): ReturnType<ContentSource['getAllPosts']> => source.getAllPosts()

export const getPosts = (locale: string): ReturnType<ContentSource['getPosts']> =>
  source.getPosts(locale)

/** Cached per request: generateMetadata and the page share one fetch and one MDX compile */
export const getPost = cache(
  (locale: string, slug: string): ReturnType<ContentSource['getPost']> =>
    source.getPost(locale, slug)
)

export const getPostRoutes = (): ReturnType<ContentSource['getPostRoutes']> =>
  source.getPostRoutes()

export const getTagCounts = (locale: string): ReturnType<ContentSource['getTagCounts']> =>
  source.getTagCounts(locale)
