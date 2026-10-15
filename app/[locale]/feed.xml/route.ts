import { locales, type LocaleTypes } from 'app/[locale]/i18n/settings'
import { getPosts } from 'lib/content'
import { buildFeed, rssResponse } from 'lib/rss'

export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams(): { locale: LocaleTypes }[] {
  return locales.map((locale) => ({ locale }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: LocaleTypes }> }
): Promise<Response> {
  const { locale } = await params
  return rssResponse(buildFeed(await getPosts(locale), locale))
}
