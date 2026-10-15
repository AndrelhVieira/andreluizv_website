import { describe, expect, it, vi } from 'vitest'
import { auth, memoryAssets, memoryRepository, row, testApp } from './support/memory.js'

const mdx = (overrides: { language?: string; body?: string; images?: string } = {}) => `---
title: 'Feature Flags'
date: '2026-06-01'
language: ${overrides.language ?? 'en'}
tags: ['react']
images: [${overrides.images ?? ''}]
authors: ['andrevieira']
summary: 'Ship code, release when ready.'
---

${overrides.body ?? 'Intro paragraph.'}
`

const put = (app: ReturnType<typeof testApp>['app'], path: string, body: string, headers = auth) =>
  app.inject({ method: 'PUT', url: path, headers, payload: { mdx: body } })

describe('PUT /posts/:locale/:slug', () => {
  it('requires the API key', async () => {
    const { app } = testApp()
    const res = await put(app, '/posts/en/feature-flags', mdx(), {} as typeof auth)
    expect(res.statusCode).toBe(401)
  })

  it('creates a post, then updates it, and revalidates the site each time', async () => {
    const revalidate = vi.fn().mockResolvedValue({ status: 'revalidated' })
    const { app } = testApp({ revalidate })

    const created = await put(app, '/posts/en/feature-flags', mdx())
    expect(created.statusCode).toBe(201)
    expect(created.json()).toMatchObject({
      status: 'created',
      post: { locale: 'en', slug: 'feature-flags', title: 'Feature Flags' },
      revalidation: { status: 'revalidated' },
    })
    expect(created.json().post).not.toHaveProperty('bodyMdx')

    const updated = await put(app, '/posts/en/feature-flags', mdx({ body: 'New intro.' }))
    expect(updated.statusCode).toBe(200)
    expect(updated.json().status).toBe('updated')
    expect(revalidate).toHaveBeenCalledTimes(2)

    const read = await app.inject({ url: '/posts/en/feature-flags' })
    expect(read.json().bodyMdx).toContain('New intro.')
  })

  it('rejects slugs that are not kebab-case', async () => {
    const { app } = testApp()
    const res = await put(app, '/posts/en/Feature_Flags', mdx())
    expect(res.statusCode).toBe(400)
  })

  it('rejects a file whose language does not match the URL', async () => {
    const { app } = testApp()
    const res = await put(app, '/posts/pt/feature-flags', mdx({ language: 'en' }))
    expect(res.statusCode).toBe(400)
    expect(res.json().error).toMatch(/does not match/)
  })

  it('lists images that still need to be uploaded', async () => {
    const { app } = testApp()
    const res = await put(
      app,
      '/posts/en/feature-flags',
      mdx({
        images: "'/static/blog/cover.webp'",
        body: '<Image src="/static/blog/diagram.png" width={10} height={10} alt="" />',
      })
    )
    expect(res.statusCode).toBe(422)
    expect(res.json().missingAssets.sort()).toEqual([
      '/static/blog/cover.webp',
      '/static/blog/diagram.png',
    ])
  })

  it('rewrites uploaded images to their Blob URLs', async () => {
    const assets = memoryAssets([
      {
        sourcePath: '/static/blog/cover.webp',
        url: 'https://blob.test/blog/cover.webp',
        pathname: 'blog/cover.webp',
        contentType: 'image/webp',
        size: 1,
      },
    ])
    const { app } = testApp({ assets })
    const res = await put(
      app,
      '/posts/en/feature-flags',
      mdx({ images: "'/static/blog/cover.webp'" })
    )

    expect(res.statusCode).toBe(201)
    expect(res.json().post.images).toEqual(['https://blob.test/blog/cover.webp'])
  })

  it('rejects MDX that would break the site', async () => {
    const { app } = testApp()
    const res = await put(
      app,
      '/posts/en/feature-flags',
      mdx({ body: '<Image src="x" alt="unclosed"' })
    )
    expect(res.statusCode).toBe(422)
    expect(res.json().mdxError).toMatch(/\d+:\d+/)
  })

  it('keeps the post when the site cannot be revalidated', async () => {
    const { app } = testApp({ revalidate: async () => ({ status: 'failed', reason: 'down' }) })
    const res = await put(app, '/posts/en/feature-flags', mdx())
    expect(res.statusCode).toBe(201)
    expect(res.json().revalidation).toEqual({ status: 'failed', reason: 'down' })
  })
})

describe('DELETE /posts/:locale/:slug', () => {
  it('deletes a post and revalidates the site', async () => {
    const repository = memoryRepository([row({ locale: 'pt', slug: 'antigo' })])
    const { app } = testApp({ repository })

    const res = await app.inject({ method: 'DELETE', url: '/posts/pt/antigo', headers: auth })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ status: 'deleted', revalidation: { status: 'revalidated' } })
    expect((await app.inject({ url: '/posts/pt/antigo' })).statusCode).toBe(404)
  })

  it('returns 404 for a post that does not exist', async () => {
    const { app } = testApp()
    const res = await app.inject({ method: 'DELETE', url: '/posts/pt/nada', headers: auth })
    expect(res.statusCode).toBe(404)
  })

  it('requires the API key', async () => {
    const { app } = testApp({ repository: memoryRepository([row({ slug: 'keep' })]) })
    const res = await app.inject({ method: 'DELETE', url: '/posts/en/keep' })
    expect(res.statusCode).toBe(401)
  })
})
