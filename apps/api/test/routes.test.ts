import type { Locale } from '@andreluizv/shared'
import { afterAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app'
import type { PostRow } from '../src/db/schema'
import { countTags, toPost, toPostRoute, toPostSummary } from '../src/posts/mappers'
import type { PostRepository } from '../src/posts/repository'

const API_KEY = 'a'.repeat(64)

function row(overrides: Partial<PostRow>): PostRow {
  return {
    id: crypto.randomUUID(),
    locale: 'en',
    slug: 'post',
    title: 'Post',
    summary: null,
    bodyMdx: '# Hello',
    date: new Date('2026-01-01'),
    lastmod: null,
    tags: [],
    images: [],
    authors: ['andrevieira'],
    layout: 'PostBanner',
    draft: false,
    featured: false,
    seriesTitle: null,
    seriesOrder: null,
    canonicalUrl: null,
    bibliography: null,
    readingTime: { text: '1 min read', minutes: 1, time: 60000, words: 2 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/** Same contract as the Drizzle repository, over an array. */
function memoryRepository(rows: PostRow[]): PostRepository {
  const visible = (locale: Locale | undefined, includeDrafts: boolean) =>
    rows
      .filter((r) => (!locale || r.locale === locale) && (includeDrafts || !r.draft))
      .sort((a, b) => b.date.getTime() - a.date.getTime() || a.slug.localeCompare(b.slug))

  return {
    list: async (locale, o) => visible(locale, o.includeDrafts).map(toPostSummary),
    get: async (locale, slug, o) => {
      const found = visible(locale, o.includeDrafts).find((r) => r.slug === slug)
      return found ? toPost(found) : null
    },
    routes: async (o) => visible(undefined, o.includeDrafts).map(toPostRoute),
    tagCounts: async (locale, o) => countTags(visible(locale, o.includeDrafts).map((r) => r.tags)),
  }
}

const app = buildApp({
  apiKey: API_KEY,
  repository: memoryRepository([
    row({ slug: 'older', date: new Date('2026-01-01'), tags: ['React', 'clean-code'] }),
    row({ slug: 'newer', date: new Date('2026-03-01'), tags: ['React'] }),
    row({ slug: 'secret', date: new Date('2026-05-01'), draft: true, tags: ['React'] }),
    row({ locale: 'pt', slug: 'newer', title: 'Mais novo', date: new Date('2026-03-01') }),
  ]),
})

afterAll(() => app.close())

describe('GET /posts', () => {
  it('lists published posts of a locale, newest first, without the body', async () => {
    const res = await app.inject({ url: '/posts?locale=en' })

    expect(res.statusCode).toBe(200)
    expect(res.headers['cache-control']).toContain('s-maxage')
    const body = res.json()
    expect(body.map((p: { slug: string }) => p.slug)).toEqual(['newer', 'older'])
    expect(body[0]).not.toHaveProperty('bodyMdx')
  })

  it('rejects an unknown locale', async () => {
    const res = await app.inject({ url: '/posts?locale=fr' })
    expect(res.statusCode).toBe(400)
  })

  it('requires the API key to include drafts', async () => {
    const res = await app.inject({ url: '/posts?locale=en&drafts=true' })
    expect(res.statusCode).toBe(401)
  })

  it('includes drafts with a valid API key and never caches them', async () => {
    const res = await app.inject({
      url: '/posts?locale=en&drafts=true',
      headers: { 'x-api-key': API_KEY },
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['cache-control']).toBe('private, no-store')
    expect(res.json().map((p: { slug: string }) => p.slug)).toEqual(['secret', 'newer', 'older'])
  })

  it('rejects a wrong API key', async () => {
    const res = await app.inject({
      url: '/posts?drafts=true',
      headers: { 'x-api-key': 'b'.repeat(64) },
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /posts/:locale/:slug', () => {
  it('returns the full post for the requested locale', async () => {
    const res = await app.inject({ url: '/posts/pt/newer' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ locale: 'pt', title: 'Mais novo', bodyMdx: '# Hello' })
  })

  it('hides drafts from the public', async () => {
    const res = await app.inject({ url: '/posts/en/secret' })
    expect(res.statusCode).toBe(404)
  })
})

describe('GET /posts/routes', () => {
  it('returns every published route across locales', async () => {
    const res = await app.inject({ url: '/posts/routes' })
    expect(res.json()).toHaveLength(3)
  })
})

describe('GET /tags', () => {
  it('counts tags by slug, ignoring drafts', async () => {
    const res = await app.inject({ url: '/tags?locale=en' })
    expect(res.json()).toEqual({ react: 2, 'clean-code': 1 })
  })

  it('requires a locale', async () => {
    const res = await app.inject({ url: '/tags' })
    expect(res.statusCode).toBe(400)
  })
})
