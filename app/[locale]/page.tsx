import HomeLayout from '@/layouts/HomeLayout'
import { getPosts } from 'lib/content'
import type { ReactElement } from 'react'
import type { LocaleTypes } from './i18n/settings'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export default async function Page({ params }: PageProps): Promise<ReactElement> {
  const { locale } = await params

  const filteredPosts = await getPosts(locale)

  return <HomeLayout posts={filteredPosts} params={{ locale }} />
}
