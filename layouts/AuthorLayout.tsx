import Image from '@/components/mdxcomponents/Image'
import SocialIcon from '@/components/social-icons'
import type { Authors } from 'contentlayer/generated'
import React, { type ReactNode } from 'react'

import CustomLink from '@/components/mdxcomponents/Link'
import { createTranslation } from 'app/[locale]/i18n/server'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'

import siteMetadata from '@/data/siteMetadata'
import { FaRegFileLines } from 'react-icons/fa6'

interface AuthorLayoutProps {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
  params: { locale: LocaleTypes }
}

export default async function AuthorLayout({
  children,
  content,
  params: { locale },
}: AuthorLayoutProps): Promise<React.JSX.Element> {
  const { name, avatar, occupation, linkedin, github } = content
  const { t } = await createTranslation(locale, 'about')

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-heading-400 dark:text-heading-400 text-3xl leading-9 font-extrabold tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          {t('about')}
        </h1>
      </div>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
        <div className="flex flex-col items-center space-x-2 pt-8">
          {avatar ? (
            <Image
              src={avatar}
              alt="avatar"
              title="avatar"
              width={192}
              height={192}
              className="h-48 w-48 rounded-full"
            />
          ) : null}
          <h2 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight">{name}</h2>
          <div className="text-gray-500 dark:text-gray-400">{occupation}</div>
          <div className="text-gray-500 dark:text-gray-400">Freelancer</div>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} />
            <SocialIcon kind="github" href={github} />
            <SocialIcon kind="linkedin" href={linkedin} />
          </div>
          <div className="m-5 flex flex-col gap-5">
            <CustomLink
              href={`/${locale}/curriculum`}
              className="bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md p-10 px-4 py-2 font-bold text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black"
            >
              <FaRegFileLines />
              CURRICULUM
            </CustomLink>
          </div>
        </div>
        <div className="prose dark:prose-invert max-w-none pt-8 pb-8 text-justify xl:col-span-2">
          {children}
        </div>
      </div>
    </div>
  )
}
