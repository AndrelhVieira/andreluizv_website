import FeaturedLayout from '@/layouts/FeaturedLayout'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'

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
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const featuredPosts = posts.filter((post) => post.featured && post.language === locale)

  return (
    <>
      {featuredPosts.length > 0 && <FeaturedLayout posts={featuredPosts} params={{ locale }} />}

      <LatestLayout posts={posts} params={{ locale }} />
    </>
  )
}
