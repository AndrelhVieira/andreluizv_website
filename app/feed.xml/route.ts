import { fallbackLng } from 'app/[locale]/i18n/locales'
import { getPosts } from 'lib/content'
import { buildFeed, rssResponse } from 'lib/rss'

export const revalidate = 3600

/** Default-locale feed: the URL the English feed advertises as its own (atom:link rel="self") */
export async function GET(): Promise<Response> {
  return rssResponse(buildFeed(await getPosts(fallbackLng), fallbackLng))
}
