import 'server-only'

import matter from 'gray-matter'
import type { EditorDocument } from './post-fields'

/** The full MDX file the content API expects (`PUT /posts/:locale/:slug`). */
export function toMdxFile({ locale, fields, body }: EditorDocument, draft: boolean): string {
  const frontmatter = Object.fromEntries(
    Object.entries({
      title: fields.title.trim(),
      date: fields.date,
      language: locale,
      tags: fields.tags,
      images: fields.images,
      authors: fields.authors,
      draft,
      featured: fields.featured,
      layout: fields.layout,
      summary: fields.summary.trim() || undefined,
      canonicalUrl: fields.canonicalUrl.trim() || undefined,
      ...fields.extra,
    }).filter(([, value]) => value !== undefined)
  )
  return matter.stringify(body.endsWith('\n') ? body : `${body}\n`, frontmatter)
}
