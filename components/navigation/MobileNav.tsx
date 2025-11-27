'use client'

import headerNavLinksMobile from '@/data/headerNavLinksMobile'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { allAuthors } from 'contentlayer/generated'
import { useParams } from 'next/navigation'
import { useCallback, useState, type JSX, type SVGProps } from 'react'
import Link from '../mdxcomponents/Link'

export function ChevronDownIcon({ className, ...props }: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...props} className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.135 6.158a.5.5 0 0 1 .707-.023L7.5 9.565l3.658-3.43a.5.5 0 0 1 .684.73l-4 3.75a.5.5 0 0 1-.684 0l-4-3.75a.5.5 0 0 1-.023-.707"
        clipRule="evenodd"
      />
    </svg>
  )
}

const MobileNav = (): JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')

  const mainAuthor = allAuthors.filter((a) => a.default === true && a.language === locale)

  const [navShow, setNavShow] = useState<boolean>(false)

  const onToggleNav = useCallback(() => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = 'auto'
      } else {
        document.body.style.overflow = 'hidden'
      }
      return !status
    })
  }, [])

  return (
    <>
      <button
        aria-label={t('showmenu')}
        onClick={useCallback(() => onToggleNav(), [onToggleNav])}
        className="sm:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-8 w-8 text-gray-900 dark:text-gray-100"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`fixed top-0 left-0 z-10 my-auto h-full w-full transform overflow-y-auto bg-white opacity-95 duration-300 ease-in-out dark:bg-gray-950 dark:opacity-[0.98] ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end">
          <button
            className="mt-11 h-8 w-8 pr-8"
            aria-label="Toggle Menu"
            onClick={useCallback(() => onToggleNav(), [onToggleNav])}
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-gray-900 dark:text-gray-100"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <nav className="fixed mt-8 h-full">
          {headerNavLinksMobile.map((link) => (
            <div key={link.title} className="px-12 py-4">
              <Link
                href={`/${locale}${link.href}`}
                className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                onClick={useCallback(() => onToggleNav(), [onToggleNav])}
              >
                {link.title === 'Brag Document' ? link.title : t(`${link.title.toLowerCase()}`)}
              </Link>
            </div>
          ))}
          <div className="px-12 py-4 text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100">
            {mainAuthor.map((author) => {
              const { name, language, slug } = author
              if (language === locale) {
                return (
                  <Link
                    href={`/${locale}/about/${slug}`}
                    onClick={useCallback(() => onToggleNav(), [onToggleNav])}
                    key={name}
                  >
                    {t('about')}
                  </Link>
                )
              }
              return null
            })}
          </div>
        </nav>
      </div>
    </>
  )
}

export default MobileNav
