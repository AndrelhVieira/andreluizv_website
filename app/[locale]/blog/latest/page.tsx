import { getPosts } from 'lib/content'

import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import type { JSX } from 'react'
import LatestLayout from './LatestLayout'
import { FadeIn } from '@/components/FadeIn'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export default async function Page({ params }: PageProps): Promise<JSX.Element> {
  const { locale } = await params
  const posts = await getPosts(locale)

  return (
    <FadeIn>
      <LatestLayout posts={posts} params={{ locale }} />
    </FadeIn>
  )
}
