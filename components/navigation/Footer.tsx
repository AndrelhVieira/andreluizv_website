'use client'

import SocialIcon from '@/components/social-icons'
import { maintitle } from '@/data/localeMetadata'
import siteMetadata from '@/data/siteMetadata'
import Link from '../mdxcomponents/Link'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams } from 'next/navigation'
import type { JSX } from 'react'

import { ContactModal } from '../formspree'
import NewsletterForm from '../newletter/NewsletterForm'

export default function Footer(): JSX.Element {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'footer')

  const footer_sections = [
    {
      title: 'Blog',
      submenus: [
        {
          name: t('blog_menu.latest.label'),
          href: `/${locale}/blog/latest`,
        },
        {
          name: t('blog_menu.all_posts.label'),
          href: `/${locale}/blog`,
        },
        {
          name: t('blog_menu.all_tags.label'),
          href: `/${locale}/tags`,
        },
      ],
    },
    {
      title: 'André Luiz Vieira',
      submenus: [
        {
          name: t('about_me_menu.about_me.label'),
          href: `/${locale}/about/andrevieira`,
        },
        {
          name: 'Skills',
          href: `/${locale}/skills`,
        },
        {
          name: t('about_me_menu.contact.label'),
          href: `/${locale}/contact`,
        },
      ],
    },
    {
      title: t('more'),
      submenus: [
        {
          name: t('about_me_menu.projects.label'),
          href: `/${locale}/projects`,
        },
        {
          name: t('about_me_menu.freelancing.label'),
          href: `/${locale}/freelancing`,
        },
        {
          name: 'Curriculum',
          href: `/${locale}/curriculum`,
        },
      ],
    },
  ]

  return (
    <>
      <footer className="mt-24 flex flex-col pb-10">
        <div className="flex w-full flex-col items-center justify-between gap-2 sm:gap-5 xl:flex-row xl:items-start xl:gap-12">
          <div className="mb-4 flex flex-col justify-evenly gap-4 sm:w-full sm:flex-row xl:w-1/2 xl:justify-around">
            {footer_sections.map((section) => (
              <div key={section.title} className="flex flex-col items-center gap-4 sm:items-start">
                <p className="font-bold text-gray-800 dark:text-white">{section.title}</p>
                {section.submenus.map((menu) => (
                  <Link
                    href={menu.href}
                    key={menu.name}
                    className="hover:text-primary-500 dark:hover:text-primary-500 text-gray-500 dark:text-gray-400"
                  >
                    {menu.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4 xl:w-1/2 xl:pt-0">
            <NewsletterForm />
          </div>
        </div>

        <hr className="mt-10 mb-5 w-full border border-gray-200" />

        <div className="flex flex-col justify-between xl:mb-4 xl:flex-row-reverse xl:items-center">
          <div className="mb-3 flex justify-center space-x-4">
            <div className="flex items-center justify-center gap-3">
              <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} />
            </div>
            <div className="flex items-center">
              <SocialIcon kind="github" href={siteMetadata.github} size={6} />
            </div>
            <div className="flex items-center">
              <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
            </div>
          </div>
          <div className="flex-center mt-5 mb-2 flex flex-col flex-wrap items-center justify-center space-x-2 text-sm text-gray-500 xl:flex-row dark:text-gray-400">
            <div>{`© ${new Date().getFullYear()}`}</div>
            <div className="hidden xl:block">{` • `}</div>
            <Link href="/">{maintitle[locale]}</Link>
            <div className="hidden xl:block">{` • `}</div>
            <div>Version: 2.2.0</div>
          </div>
        </div>

        <div className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="https://github.com/PxlSyl/tailwind-nextjs-starter-blog-i18n">
            {t('theme')}
          </Link>
        </div>
      </footer>
      <ContactModal />
    </>
  )
}
