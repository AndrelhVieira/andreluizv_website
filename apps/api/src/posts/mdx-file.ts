import { LocaleSchema } from '@andreluizv/shared'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { z } from 'zod'
import type { NewPostRow } from '../db/schema.js'

const dateLike = z.union([z.date(), z.string().trim().min(1)]).transform((value, ctx) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({ code: 'custom', message: `Invalid date: ${String(value)}` })
    return z.NEVER
  }
  return date
})

const stringList = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (typeof value === 'string' ? [value] : value))

/** Mirrors the Blog document type in contentlayer.config.ts */
const FrontmatterSchema = z.object({
  title: z.string().min(1),
  date: dateLike,
  language: LocaleSchema,
  tags: stringList.default([]),
  lastmod: dateLike.optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  summary: z.string().optional(),
  images: stringList.default([]),
  authors: stringList.pipe(z.array(z.string()).min(1)),
  layout: z.string().default('PostBanner'),
  bibliography: z.string().optional(),
  canonicalUrl: z.string().optional(),
  series: z.object({ title: z.string(), order: z.number() }).optional(),
})

export interface MdxSource {
  /** Locale from the URL; must match the frontmatter `language` */
  locale: string
  /** Slug from the URL (the file name when pushed with `yarn blog`) */
  slug: string
  raw: string
}

export function parseMdxFile({ locale, slug, raw }: MdxSource): NewPostRow {
  const { data, content } = matter(raw)
  const fm = FrontmatterSchema.parse(data)
  if (fm.language !== locale) {
    throw new Error(`language "${fm.language}" does not match folder "${locale}"`)
  }

  return {
    locale: fm.language,
    slug,
    title: fm.title,
    summary: fm.summary ?? null,
    bodyMdx: content,
    date: fm.date,
    lastmod: fm.lastmod ?? null,
    tags: fm.tags,
    images: fm.images,
    authors: fm.authors,
    layout: fm.layout,
    draft: fm.draft,
    featured: fm.featured,
    seriesTitle: fm.series?.title ?? null,
    seriesOrder: fm.series?.order ?? null,
    canonicalUrl: fm.canonicalUrl ?? null,
    bibliography: fm.bibliography ?? null,
    readingTime: readingTime(content),
  }
}

const STATIC_BLOG_PATH = /\/static\/blog\/[\w.-]+\.(?:webp|png|jpe?g|gif|svg|avif)/g

/** True for a single /static/blog/<file> image path, the only form posts use for uploads */
export const isStaticBlogPath = (path: string): boolean =>
  new RegExp(`^${STATIC_BLOG_PATH.source}$`).test(path)

/** Every distinct /static/blog/* path in a piece of text, e.g. a whole MDX file. */
export function findStaticBlogPaths(text: string): string[] {
  return [...new Set(Array.from(text.matchAll(STATIC_BLOG_PATH), (match) => match[0]))]
}

/** Every /static/blog/* file a post references, in its body or cover images. */
export function findAssetPaths(post: Pick<NewPostRow, 'bodyMdx' | 'images'>): string[] {
  return findStaticBlogPaths([post.bodyMdx, ...(post.images ?? [])].join('\n'))
}

/** Replaces /static/blog/* paths with their Blob URLs. Unknown paths stay untouched. */
export function rewriteAssetPaths<T extends Pick<NewPostRow, 'bodyMdx' | 'images'>>(
  post: T,
  urls: ReadonlyMap<string, string>
): T {
  const replace = (text: string) => text.replace(STATIC_BLOG_PATH, (path) => urls.get(path) ?? path)
  return { ...post, bodyMdx: replace(post.bodyMdx), images: (post.images ?? []).map(replace) }
}
