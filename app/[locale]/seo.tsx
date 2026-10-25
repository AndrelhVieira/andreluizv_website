import { maindescription, maintitle } from '@/data/localeMetadata'
import siteMetadata from '@/data/siteMetadata'
import { feedUrl } from 'lib/rss'
import type { Metadata } from 'next'
import { fallbackLng } from './i18n/locales'
import { locales, type LocaleTypes } from './i18n/settings'

/**
 * Absolute public URL of a page in a locale. The middleware serves the default locale
 * without a prefix (/en/blog redirects to /blog), so canonicals must never include it.
 */
export function localeUrl(locale: string, path = ''): string {
  return `${siteMetadata.siteUrl}${locale === fallbackLng ? '' : `/${locale}`}${path}`
}

/** hreflang map for the locales a page exists in; x-default is the default-locale version */
export function languageAlternates(
  path: string,
  available: readonly string[] = locales
): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    available.map((locale) => [locale, localeUrl(locale, path)])
  )
  if (available.includes(fallbackLng)) languages['x-default'] = localeUrl(fallbackLng, path)
  return languages
}

/** canonical + hreflang + RSS link; a page's alternates replace the layout's as a whole */
export function pageAlternates(
  locale: LocaleTypes,
  path: string,
  available?: readonly string[]
): NonNullable<Metadata['alternates']> {
  return {
    canonical: localeUrl(locale, path),
    languages: languageAlternates(path, available),
    types: { 'application/rss+xml': feedUrl(locale) },
  }
}

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  /** Path after the locale prefix, e.g. '/blog' ('' for the home page) */
  path: string

  params: { locale: LocaleTypes }
  [key: string]: unknown
}

export function genPageMetadata({
  title,
  description,
  image,
  path,
  params: { locale },
  ...rest
}: PageSEOProps): Metadata {
  return {
    title,
    description: description || maindescription[locale],
    alternates: pageAlternates(locale, path),
    openGraph: {
      title: `${title} | ${maintitle[locale]}`,
      description: description || maindescription[locale],
      url: localeUrl(locale, path),
      siteName: maintitle[locale],
      images: image ? [image] : [siteMetadata.socialBanner],
      locale,
      type: 'website',
    },
    twitter: {
      title: `${title} | ${maintitle[locale]}`,
      description: description ? description : maindescription[locale],
      site: siteMetadata.siteUrl,
      creator: siteMetadata.author,
      card: 'summary_large_image',
      images: image ? [image] : [siteMetadata.socialBanner],
    },
    ...rest,
  }
}
