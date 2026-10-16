import siteMetadata from '@/data/siteMetadata'
import { fallbackLng } from 'app/[locale]/i18n/locales'
import type { PostSummary } from 'lib/content'
import { escape } from 'pliny/utils/htmlEscaper'

const localePrefix = (locale: string): string => (locale === fallbackLng ? '' : `/${locale}`)

/** Public URL of a locale's feed, as advertised in each page's <head> */
export const feedUrl = (locale: string): string =>
  `${siteMetadata.siteUrl}${localePrefix(locale)}/feed.xml`

function item(post: PostSummary, locale: string): string {
  const url = `${siteMetadata.siteUrl}${localePrefix(locale)}/blog/${post.slug}`
  return `
  <item>
    <guid>${url}</guid>
    <title>${escape(post.title)}</title>
    <link>${url}</link>
    ${post.summary ? `<description>${escape(post.summary)}</description>` : ''}
    ${post.date ? `<pubDate>${new Date(post.date).toUTCString()}</pubDate>` : ''}
    <author>${siteMetadata.email} (${siteMetadata.author})</author>
    ${post.tags ? post.tags.map((t) => `<category>${t}</category>`).join('') : ''}
  </item>`
}

/** RSS 2.0 feed for one locale. `posts` must already be filtered and sorted newest first. */
export function buildFeed(posts: PostSummary[], locale: string): string {
  const published = posts.filter((post) => post.draft !== true)
  return `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteMetadata.title)}</title>
    <link>${siteMetadata.siteUrl}${localePrefix(locale)}/blog</link>
    <description>${escape(siteMetadata.description)}</description>
    <language>${locale}</language>
    <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
    <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
    ${published.length > 0 ? `<lastBuildDate>${new Date(published[0].date).toUTCString()}</lastBuildDate>` : ''}
    <atom:link href="${feedUrl(locale)}" rel="self" type="application/rss+xml"/>
    ${published.map((post) => item(post, locale)).join('')}
  </channel>
</rss>`
}

export const rssResponse = (xml: string): Response =>
  new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
