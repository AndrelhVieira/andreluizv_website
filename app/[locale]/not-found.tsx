'use client'

import Image from '@/components/mdxcomponents/Image'
import CustomLink from '@/components/mdxcomponents/Link'
import type { ReactElement } from 'react'

import { IoArrowBackOutline } from 'react-icons/io5'
import { LuFileStack } from 'react-icons/lu'
import { MdOutlineDevicesOther } from 'react-icons/md'
import { RiContactsLine } from 'react-icons/ri'
import Logo from '/public/static/images/logo.png'

import { useParams } from 'next/navigation'
import { FaAngleRight } from 'react-icons/fa6'
import { useTranslation } from './i18n/client'
import type { LocaleTypes } from './i18n/settings'
export default function NotFound(): ReactElement {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, '404')

  const navigationOptions = [
    {
      name: t('navigation_options.blog.label'),
      description: t('navigation_options.blog.description'),
      href: `/${locale}/blog`,
      icon: LuFileStack,
    },
    {
      name: t('navigation_options.projects.label'),
      description: t('navigation_options.projects.description'),
      href: `/${locale}/projects`,
      icon: MdOutlineDevicesOther,
    },
    {
      name: t('navigation_options.contact.label'),
      description: t('navigation_options.contact.description'),
      href: `/${locale}/contact`,
      icon: RiContactsLine,
    },
  ]

  return (
    <div className="flex flex-col items-start justify-start md:flex-row md:items-center md:justify-center md:space-x-6">
      <div className="flex flex-col items-center gap-5">
        <Image src={Logo} alt="Andre Luiz Vieira Logo" className="max-w-40" />
        <p className="text-primary-500 text-center font-bold">404</p>
        <p className="text-3xl font-bold">{t('firstext')}</p>
        <p className="text-center text-xl">{t('secondtext')}</p>

        <div className="rounded-xl md:w-3/5">
          {navigationOptions.map((item) => (
            <div
              key={item.name}
              className="group relative mb-3 flex items-center justify-between gap-x-6 rounded-lg bg-gray-100 p-4 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-500"
            >
              <div className="flex gap-5">
                <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white dark:bg-gray-600 dark:group-hover:bg-gray-800">
                  <item.icon
                    className="group-hover:text-primary-600 h-6 w-6 text-gray-600 dark:text-white"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <CustomLink
                    href={item.href}
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    {item.name}
                    <span className="absolute inset-0" />
                  </CustomLink>
                  <p className="mt-1 text-gray-600 dark:text-white">{item.description}</p>
                </div>
              </div>
              <FaAngleRight />
            </div>
          ))}

          <CustomLink
            href={`/${locale}/`}
            className="text-primary-500 mt-10 flex items-center justify-center gap-3 text-center text-lg font-bold"
          >
            <IoArrowBackOutline />
            {t('back')}
          </CustomLink>
        </div>
      </div>
    </div>
  )
}
