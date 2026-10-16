import { describe, expect, it } from 'vitest'
import { findAssetPaths, parseMdxFile, rewriteAssetPaths } from '../src/posts/mdx-file.js'

const raw = `---
title: "Feature Flags in Frontend"
date: '2026-06-01'
language: en
tags: ['react', 'Feature Flags']
images: ['/static/blog/feature-flags-in-frontend.webp']
authors: ['andrevieira']
draft: false
layout: PostBanner
summary: "Ship code, release when ready."
canonicalUrl: https://andreluizv.dev.br/blog/feature-flags-in-frontend
---

Intro paragraph.

![diagram](/static/blog/flags-diagram.png)
`

describe('parseMdxFile', () => {
  it('maps frontmatter and body to a post row', () => {
    const post = parseMdxFile({ locale: 'en', slug: 'feature-flags-in-frontend', raw })

    expect(post).toMatchObject({
      locale: 'en',
      slug: 'feature-flags-in-frontend',
      title: 'Feature Flags in Frontend',
      tags: ['react', 'Feature Flags'],
      authors: ['andrevieira'],
      featured: false,
      draft: false,
      seriesTitle: null,
      lastmod: null,
    })
    expect(post.date.toISOString()).toBe('2026-06-01T00:00:00.000Z')
    expect(post.bodyMdx).toContain('Intro paragraph.')
    expect(post.bodyMdx).not.toContain('title:')
    expect(post.readingTime.words).toBeGreaterThan(0)
  })

  it('rejects a file whose language does not match its folder', () => {
    expect(() => parseMdxFile({ locale: 'pt', slug: 'x', raw })).toThrow(/does not match folder/)
  })

  it('rejects a file without authors', () => {
    const noAuthors = raw.replace("authors: ['andrevieira']\n", '')
    expect(() => parseMdxFile({ locale: 'en', slug: 'x', raw: noAuthors })).toThrow()
  })
})

describe('asset paths', () => {
  const post = parseMdxFile({ locale: 'en', slug: 'feature-flags-in-frontend', raw })

  it('finds images in the body and in the cover list', () => {
    expect(findAssetPaths(post).sort()).toEqual([
      '/static/blog/feature-flags-in-frontend.webp',
      '/static/blog/flags-diagram.png',
    ])
  })

  it('rewrites known paths and leaves unknown ones alone', () => {
    const urls = new Map([
      ['/static/blog/flags-diagram.png', 'https://blob.example/blog/flags-diagram.png'],
    ])
    const rewritten = rewriteAssetPaths(post, urls)

    expect(rewritten.bodyMdx).toContain('](https://blob.example/blog/flags-diagram.png)')
    expect(rewritten.images).toEqual(['/static/blog/feature-flags-in-frontend.webp'])
  })
})
