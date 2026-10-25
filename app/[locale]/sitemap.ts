import { allAuthors } from 'contentlayer/generated'
import { getPostRoutes } from 'lib/content'
import type { MetadataRoute } from 'next'
import { locales } from './i18n/settings'
import { languageAlternates, localeUrl } from './seo'

type SitemapEntry = MetadataRoute.Sitemap[number]

const staticPaths = [
  '',
  '/blog',
  '/projects',
  '/tags',
  '/curriculum',
  '/freelancing',
  '/contact',
  '/privacy',
]

/** One entry per locale the page exists in, each pointing at its siblings with hreflang */
function localizedEntries(
  path: string,
  available: readonly string[],
  lastModified?: string
): SitemapEntry[] {
  const languages = languageAlternates(path, available)
  return available.map((locale) => ({
    url: localeUrl(locale, path),
    lastModified,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [today] = new Date().toISOString().split('T')

  const translationsBySlug = new Map<string, { locale: string; lastModified: string }[]>()
  for (const post of await getPostRoutes()) {
    if (post.draft) continue
    const translations = translationsBySlug.get(post.slug) ?? []
    translations.push({ locale: post.language, lastModified: post.lastmod || post.date })
    translationsBySlug.set(post.slug, translations)
  }

  const blogEntries = [...translationsBySlug].flatMap(([slug, translations]) => {
    const languages = languageAlternates(
      `/blog/${slug}`,
      translations.map((t) => t.locale)
    )
    return translations.map(({ locale, lastModified }) => ({
      url: localeUrl(locale, `/blog/${slug}`),
      lastModified,
      alternates: { languages },
    }))
  })

  const authorSlugs = [...new Set(allAuthors.map((author) => author.slug))]
  const authorEntries = authorSlugs.flatMap((slug) =>
    localizedEntries(
      `/about/${slug}`,
      allAuthors.filter((author) => author.slug === slug).map((author) => author.language)
    )
  )

  const staticEntries = staticPaths.flatMap((path) => localizedEntries(path, locales, today))

  return [...staticEntries, ...blogEntries, ...authorEntries]
}
