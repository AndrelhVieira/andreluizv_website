import { afterAll, describe, expect, it } from 'vitest'
import { API_KEY, memoryRepository, row, testApp } from './support/memory.js'

const { app } = testApp({
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
    expect(res.headers['cache-control']).not.toContain('s-maxage')
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

describe('ordering across locales', () => {
  it('breaks date and slug ties by locale, so mixed lists are stable', async () => {
    const day = new Date('2026-07-01')
    const { app: mixed } = testApp({
      repository: memoryRepository([
        row({ locale: 'pt', slug: 'same', date: day }),
        row({ locale: 'es', slug: 'same', date: day }),
        row({ locale: 'en', slug: 'same', date: day }),
      ]),
    })
    const res = await mixed.inject({ url: '/posts' })
    expect(res.json().map((p: { locale: string }) => p.locale)).toEqual(['en', 'es', 'pt'])
    await mixed.close()
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
