import CustomLink from '@/components/mdxcomponents/Link'
import NewsletterForm from '@/components/newletter/NewsletterForm'
import siteMetadata from '@/data/siteMetadata'
import PostList from '@/layouts/home/PostList'
import { createTranslation } from 'app/[locale]/i18n/server'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import type { JSX } from 'react'

const MAX_DISPLAY = 5

type PostType = {
  slug: string
  date: string
  title: string
  summary?: string | undefined
  tags: string[]
  language: string
  draft?: boolean
}

type LatestLayoutPropsType = {
  posts: PostType[]
  params: { locale: LocaleTypes }
}

export default async function LatestLayout({
  posts,
  params: { locale },
}: LatestLayoutPropsType): Promise<JSX.Element> {
  const { t } = await createTranslation(locale, 'home')

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-heading-400 dark:text-heading-400 text-3xl leading-9 font-extrabold tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {t('latest')}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{t('description')}</p>
        </div>
        <PostList locale={locale} posts={posts} maxDisplay={MAX_DISPLAY} t={t} />
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <CustomLink
            href={`/${locale}/blog`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={t('all')}
          >
            {t('all')} &rarr;
          </CustomLink>
        </div>
      )}

      <div className="my-5" />

      {siteMetadata.newsletter?.provider ? (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      ) : null}
    </>
  )
}
