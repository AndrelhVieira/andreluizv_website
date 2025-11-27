import Link from '@/components/mdxcomponents/Link'
import NewsletterForm from '@/components/newletter/NewsletterForm'
import PresentationContent from '@/components/PresentationContent'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import Project from 'app/[locale]/projects/project'
import TechCarouselForHome from 'app/[locale]/skills/TechCarouselForHome'
import TechsMobileForHome from 'app/[locale]/skills/TechsMobileForHome'
import React from 'react'
import { createTranslation } from '../app/[locale]/i18n/server'
import type { LocaleTypes } from '../app/[locale]/i18n/settings'
import PostList from './home/PostList'

interface Post {
  slug: string
  date: string
  title: string
  summary?: string | undefined
  tags: string[]
  language: string
  draft?: boolean
}

interface HomeProps {
  posts: Post[]
  params: { locale: LocaleTypes }
}

const MAX_DISPLAY = 3

export default async function HomeLayout({
  posts,
  params: { locale },
}: HomeProps): Promise<React.JSX.Element> {
  const { t } = await createTranslation(locale, 'common')
  return (
    <>
      <div className="flex flex-col gap-10">
        <PresentationContent params={{ locale }} />
        <div className="flex flex-col items-center">
          <p className="text-primary-500 text-center text-2xl font-bold uppercase">{t('title')}</p>
          <div className="mt-4 flex space-x-4">
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={10} />
            <div className="flex items-center">
              <SocialIcon kind="github" href={siteMetadata.github} size={10} />
            </div>
            <div className="flex items-center">
              <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={10} />
            </div>
            <div className="flex items-center">
              <SocialIcon kind="instagram" href={siteMetadata.instagram} size={10} />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-4xl font-bold">{t('projects')}</h2>
          <div className="flex flex-col items-center md:flex-row md:items-stretch">
            <Project projectsToShow={['Barberstone', 'User Finder']} />
          </div>
          <Link
            className={
              'bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 mx-auto mt-4 cursor-pointer rounded-md px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black'
            }
            href={`/${locale}/projects`}
          >
            {t('more_projects')}
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">{t('about')}</h2>
          <div className="flex">
            <p>{t('about_me')}</p>
          </div>
          <Link
            className={
              'bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 mx-auto mt-4 cursor-pointer rounded-md px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black'
            }
            href={`/${locale}/about/andrevieira`}
          >
            {t('more')}
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">{t('skills')}</h2>
          <div className="flex">
            <TechCarouselForHome params={{ locale }} />
            <TechsMobileForHome />
          </div>
          <Link
            className={
              'bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 mx-auto mt-4 cursor-pointer rounded-md px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black'
            }
            href={`/${locale}/skills`}
          >
            {t('more')}
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">Posts</h2>
          <p className="">{t('posts_text')}</p>
          <PostList locale={locale} posts={posts} maxDisplay={MAX_DISPLAY} t={t} />
          <Link
            className={
              'bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 mx-auto mt-4 cursor-pointer rounded-md px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black'
            }
            href={`/${locale}/blog`}
          >
            {t('more_blog')}
          </Link>
        </div>
      </div>
      {siteMetadata.newsletter?.provider ? (
        <div className="flex items-center justify-center pt-10">
          <NewsletterForm />
        </div>
      ) : null}
    </>
  )
}
