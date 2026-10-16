import 'server-only'

import { components } from '@/components/mdxcomponents'
import PostBanner from '@/layouts/PostBanner'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import { allAuthors, type Authors } from 'contentlayer/generated'
import { toPostSummary } from 'lib/content'
import { compileMdx } from 'lib/mdx/compile'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent } from 'pliny/utils/contentlayer'
import type { ReactElement } from 'react'
import readingTime from 'reading-time'
import type { EditorDocument } from './post-fields'

const layouts = { PostBanner, PostLayout, PostSimple }

export type PreviewResult = { ok: true; node: ReactElement } | { ok: false; message: string }

/**
 * Renders unsaved editor content exactly like app/[locale]/blog/[...slug]/page.tsx: same MDX
 * pipeline, same layouts and MDX components. Nothing is written to the content API.
 */
export async function renderPreview(doc: EditorDocument): Promise<PreviewResult> {
  let compiled
  try {
    compiled = await compileMdx(doc.body, {
      bibliography: (doc.fields.extra.bibliography as string | undefined) ?? null,
    })
  } catch (error) {
    const { line, column, reason, message } = error as {
      line?: number
      column?: number
      reason?: string
      message?: string
    }
    const text = reason ?? message ?? String(error)
    return { ok: false, message: line ? `Linha ${line}:${column ?? 1} — ${text}` : text }
  }

  const { fields, locale, slug } = doc
  const summary = toPostSummary({
    locale,
    slug: slug || 'preview',
    title: fields.title || 'Sem título',
    summary: fields.summary || null,
    date: new Date(`${fields.date}T00:00:00Z`).toISOString(),
    lastmod: null,
    tags: fields.tags,
    images: fields.images,
    authors: fields.authors,
    layout: fields.layout,
    draft: true,
    featured: fields.featured,
    series: (fields.extra.series as { title: string; order: number } | undefined) ?? null,
    canonicalUrl: fields.canonicalUrl || null,
    readingTime: readingTime(doc.body),
  })

  const authorDetails = fields.authors
    .map((author) =>
      allAuthors.filter((a) => a.language === locale).find((a) => a.slug.includes(author))
    )
    .filter((author): author is Authors => Boolean(author))
    .map((author) => coreContent(author))

  const Layout = layouts[fields.layout as keyof typeof layouts] ?? PostLayout

  return {
    ok: true,
    node: (
      <Layout
        content={{ ...summary, toc: compiled.toc }}
        authorDetails={authorDetails}
        params={{ locale }}
      >
        <MDXLayoutRenderer code={compiled.code} components={components} toc={compiled.toc} />
      </Layout>
    ),
  }
}
