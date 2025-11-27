import FeaturedLayout from '@/layouts/FeaturedLayout'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'

import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import type { JSX } from 'react'
import LatestLayout from './LatestLayout'

export default function Page({ params }: { params: { locale: LocaleTypes } }): JSX.Element {
  const { locale } = params
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
