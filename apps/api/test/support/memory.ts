import type { Locale } from '@andreluizv/shared'
import type { AssetRecord, AssetRepository } from '../../src/assets/repository.js'
import type { AssetStorage } from '../../src/assets/storage.js'
import type { FastifyInstance } from 'fastify'
import { buildApp, type AppDeps } from '../../src/create-app.js'
import type { NewPostRow, PostRow } from '../../src/db/schema.js'
import { countTags, toPost, toPostRoute, toPostSummary } from '../../src/posts/mappers.js'
import type { PostRepository } from '../../src/posts/repository.js'

export const API_KEY = 'a'.repeat(64)
export const auth = { 'x-api-key': API_KEY }

export function row(overrides: Partial<PostRow>): PostRow {
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
export function memoryRepository(rows: PostRow[]): PostRepository {
  const visible = (locale: Locale | undefined, includeDrafts: boolean) =>
    rows
      .filter((r) => (!locale || r.locale === locale) && (includeDrafts || !r.draft))
      .sort(
        (a, b) =>
          b.date.getTime() - a.date.getTime() ||
          a.slug.localeCompare(b.slug) ||
          a.locale.localeCompare(b.locale)
      )
  const indexOf = (locale: string, slug: string) =>
    rows.findIndex((r) => r.locale === locale && r.slug === slug)

  return {
    list: async (locale, o) => visible(locale, o.includeDrafts).map(toPostSummary),
    get: async (locale, slug, o) => {
      const found = visible(locale, o.includeDrafts).find((r) => r.slug === slug)
      return found ? toPost(found) : null
    },
    routes: async (o) => visible(undefined, o.includeDrafts).map(toPostRoute),
    tagCounts: async (locale, o) => countTags(visible(locale, o.includeDrafts).map((r) => r.tags)),
    save: async (input: NewPostRow) => {
      const index = indexOf(input.locale, input.slug)
      const saved = row({ ...(index >= 0 ? rows[index] : {}), ...input } as Partial<PostRow>)
      if (index >= 0) rows[index] = saved
      else rows.push(saved)
      return { created: index < 0, post: toPost(saved) }
    },
    remove: async (locale, slug) => {
      const index = indexOf(locale, slug)
      if (index < 0) return false
      rows.splice(index, 1)
      return true
    },
  }
}

export function memoryAssets(
  records: AssetRecord[] = []
): AssetRepository & { records: AssetRecord[] } {
  return {
    records,
    urlsBySourcePath: async (paths) =>
      new Map(
        records.filter((r) => paths.includes(r.sourcePath)).map((r) => [r.sourcePath, r.url])
      ),
    save: async (asset) => {
      const index = records.findIndex((r) => r.pathname === asset.pathname)
      if (index >= 0) records[index] = asset
      else records.push(asset)
    },
  }
}

export function memoryStorage(): AssetStorage & { files: Map<string, Buffer> } {
  const files = new Map<string, Buffer>()
  return {
    files,
    upload: async (pathname, body) => {
      files.set(pathname, body)
      return { url: `https://blob.test/${pathname}` }
    },
  }
}

export function testApp(overrides: Partial<AppDeps> = {}): { app: FastifyInstance; deps: AppDeps } {
  const deps: AppDeps = {
    apiKey: API_KEY,
    repository: memoryRepository([]),
    assets: memoryAssets(),
    storage: memoryStorage(),
    revalidate: async () => ({ status: 'revalidated' }),
    ...overrides,
  }
  return { app: buildApp(deps), deps }
}
