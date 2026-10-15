import FeaturedLayout from '@/layouts/FeaturedLayout'
import { getAllPosts } from 'lib/content'

import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import type { JSX } from 'react'
import LatestLayout from './LatestLayout'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export default async function Page({ params }: PageProps): Promise<JSX.Element> {
  const { locale } = await params
  const posts = await getAllPosts()
  const featuredPosts = posts.filter((post) => post.featured && post.language === locale)

  return (
    <>
      {featuredPosts.length > 0 && <FeaturedLayout posts={featuredPosts} params={{ locale }} />}

      <LatestLayout posts={posts} params={{ locale }} />
    </>
  )
}
