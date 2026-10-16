/**
 * Single entry point for blog content, served by the content API (apps/api).
 *
 * Pages, layouts and routes must read posts through this module, never call the API
 * directly. Responses are cached with ISR and refreshed by /api/revalidate.
 */
import { cache } from 'react'
import { getPost as fetchPost } from './api'

export { CONTENT_CACHE_TAG, getAllPosts, getPostRoutes, getPosts, getTagCounts } from './api'
export { toSummary } from './types'
export type { Post, PostRoute, PostSeries, PostSummary, SeriesEntry, TagCounts } from './types'

/** Cached per request: generateMetadata and the page share one fetch and one MDX compile */
export const getPost = cache(fetchPost)
