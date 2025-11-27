import HomeLayout from '@/layouts/HomeLayout'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import type { ReactElement } from 'react'
import type { LocaleTypes } from './i18n/settings'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export default async function Page({ params }: PageProps): Promise<ReactElement> {
  const { locale } = await params

  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const filteredPosts = posts.filter((p) => p.language === locale)

  return <HomeLayout posts={filteredPosts} params={{ locale }} />
}
