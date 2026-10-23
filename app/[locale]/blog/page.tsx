import ListLayout from '@/layouts/ListLayout'
import { genPageMetadata } from 'app/[locale]/seo'
import { getPosts, getTagCounts } from 'lib/content'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return genPageMetadata({
    title: 'Blog',
    path: '/blog',
    params: { locale },
  })
}

export default async function BlogPage({ params }: PageProps): Promise<ReactElement> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'home')
  const [posts, tagCounts] = await Promise.all([getPosts(locale), getTagCounts(locale)])

  return <ListLayout params={{ locale }} posts={posts} tagCounts={tagCounts} title={t('all')} />
}
