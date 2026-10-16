import type { Locale, Post } from '@andreluizv/shared'

/**
 * What the editor form edits. Shared by the editor (client) and the server actions, so it
 * has no server-only imports. Frontmatter keys the form doesn't know (series, bibliography,
 * lastmod…) travel in `extra` and are written back untouched.
 */
export interface PostFields {
  title: string
  /** YYYY-MM-DD */
  date: string
  tags: string[]
  summary: string
  layout: string
  featured: boolean
  images: string[]
  authors: string[]
  canonicalUrl: string
  extra: Record<string, unknown>
}

export interface EditorDocument {
  locale: Locale
  slug: string
  fields: PostFields
  body: string
}

export const LAYOUTS = ['PostBanner', 'PostLayout', 'PostSimple'] as const
export const DEFAULT_AUTHORS = ['andrevieira']
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** Search engines cut descriptions around this length */
export const SUMMARY_MAX = 160

export function emptyFields(): PostFields {
  return {
    title: '',
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    summary: '',
    layout: 'PostBanner',
    featured: false,
    images: [],
    authors: DEFAULT_AUTHORS,
    canonicalUrl: '',
    extra: {},
  }
}

export function fieldsFromPost(post: Post): PostFields {
  const extra: Record<string, unknown> = {}
  if (post.series) extra.series = post.series
  if (post.bibliography) extra.bibliography = post.bibliography
  if (post.lastmod) extra.lastmod = post.lastmod.slice(0, 10)
  return {
    title: post.title,
    date: post.date.slice(0, 10),
    tags: post.tags,
    summary: post.summary ?? '',
    layout: post.layout,
    featured: post.featured,
    images: post.images,
    authors: post.authors.length > 0 ? post.authors : DEFAULT_AUTHORS,
    canonicalUrl: post.canonicalUrl ?? '',
    extra,
  }
}

/** "2026-10-16" (or a full ISO timestamp) → "16/10/2026" */
export function formatDateBr(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-')
  return year && month && day ? `${day}/${month}/${year}` : iso
}

/** "16/10/2026" → "2026-10-16", or null when it isn't a real date (31/02, 2026 typos…) */
export function parseDateBr(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim())
  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const date = new Date(`${iso}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(iso) ? iso : null
}

/** "Meu Post: Ação!" → "meu-post-acao" */
export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function countWords(body: string): number {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
  return prose.split(/\s+/).filter(Boolean).length
}
