import HomeLayout from '@/layouts/HomeLayout'
import { getPosts } from 'lib/content'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import type { LocaleTypes } from './i18n/settings'
import { pageAlternates } from './seo'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return { alternates: pageAlternates(locale, '') }
}

export default async function Page({ params }: PageProps): Promise<ReactElement> {
  const { locale } = await params

  const filteredPosts = await getPosts(locale)

  return <HomeLayout posts={filteredPosts} params={{ locale }} />
}
