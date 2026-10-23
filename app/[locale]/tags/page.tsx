import Tag from '@/components/tag'
import { sortTagsByCount } from '@/components/util/sortTagsByCount'
import { genPageMetadata } from 'app/[locale]/seo'
import { getTagCounts } from 'lib/content'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'
import { FadeIn } from '@/components/FadeIn'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'SEO')
  return genPageMetadata({
    title: 'Tags',
    path: '/tags',
    description: t('tags'),
    params: { locale },
  })
}

export default async function Page({ params }: PageProps): Promise<ReactElement> {
  const { locale } = await params
  const tagCounts = await getTagCounts(locale)
  const sortedTags = sortTagsByCount(tagCounts)
  const { t } = await createTranslation(locale, 'common')

  return (
    <FadeIn>
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-heading-700 dark:text-heading-400 text-3xl leading-9 font-extrabold tracking-tight sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14">
            Tags
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {sortedTags.length === 0 && t('notags')}
          {sortedTags.map((tag) => (
            <div key={tag} className="mt-2 mr-5 mb-2">
              <Tag text={tag} />
              <span className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300">
                {`(${tagCounts[tag]})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}
