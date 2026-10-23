'use client'

import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinksFreelancing from 'app/[locale]/freelancing/headerNavLinksFreelancing'
import MobileNavFreela from 'app/[locale]/freelancing/MobileNavFreela'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react'
import LangSwitch from '../LangSwitch'
import Link from '../mdxcomponents/Link'
import SearchButton from '../search/SearchButton'
import SectionContainer from '../SectionContainer'
import ThemeSwitch from '../theme/ThemeSwitch'
import AboutMenu from './AboutMenu'
import BlogMenu from './BlogMenu'
import MobileNav from './MobileNav'

const Header = (): JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const pathname = usePathname()

  // The freelancing landing page keeps this header but swaps in its own in-page sections
  const isFreelancing = pathname.includes('/freelancing')
  const { t: tFreelancing } = useTranslation(locale, 'freelancing')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Sticky header that slims down once the page scrolls. The bottom margin gives back exactly
  // the height it loses — padding 2 × 1.75rem plus the logo going from 96.48px (logo.svg) to
  // 56px — so the header's height in the flow never changes and nothing below it moves (no
  // layout shift). The blurred background is a sibling layer: a
  // backdrop-filter on the header itself would trap MobileNav's fixed overlay inside it.
  return (
    <header
      className={`sticky top-0 z-40 transition-[margin] duration-300 ${scrolled ? 'mb-[96.48px]' : 'mb-0'}`}
    >
      {/* Only while scrolled: even at opacity 0 a backdrop-filter makes a composited layer, and
          macOS paints it a shade lighter than the page — a visible band in dark mode */}
      {scrolled ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-white/85 shadow-sm backdrop-blur-md dark:bg-gray-950/85 dark:shadow-gray-800/40"
        />
      ) : null}
      <SectionContainer>
        <div
          className={`flex items-center justify-between transition-[padding] duration-300 ${scrolled ? 'py-3' : 'py-10'}`}
        >
          <div>
            <Link href={`/${locale}/`} aria-label={siteMetadata.headerTitle}>
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  <Logo
                    className={`w-auto transition-[height] duration-300 ${scrolled ? 'h-14' : 'h-[96.48px]'}`}
                  />
                </div>
                {typeof siteMetadata.headerTitle === 'string' ? (
                  <div className="hidden sm:block">
                    <div className="h-6 text-2xl font-semibold">{siteMetadata.headerTitle}</div>
                    {isFreelancing ? (
                      <div className="mt-1 hidden xl:block">
                        {siteMetadata.siteUrl.replace('https://', '')}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          {isFreelancing ? (
            <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
              {headerNavLinksFreelancing.map((link) => (
                <Link
                  key={link.title}
                  href={`${link.href}`}
                  className="hover:text-primary-500 hidden font-medium text-gray-900 md:block dark:text-gray-100"
                >
                  {tFreelancing(`${link.title.toLowerCase()}`)}
                </Link>
              ))}
              <ThemeSwitch />
              <LangSwitch />
              <MobileNavFreela />
            </div>
          ) : (
            <div className="flex items-center space-x-2 leading-5 sm:space-x-6">
              <BlogMenu params={{ locale }} />
              {headerNavLinks
                .filter((link) => {
                  return link.href !== '/'
                })
                .map((link) => {
                  const isSelected = pathname.includes(link.href as string)
                  return (
                    <Link
                      key={link.title}
                      href={`/${locale}${link.href}`}
                      className="hidden transform-gpu items-center space-x-1 transition-transform duration-300 sm:flex"
                    >
                      <div
                        className={`font-medium ${
                          isSelected
                            ? 'text-primary-500'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                        } relative rounded-md px-2 py-1 font-medium transition-colors`}
                      >
                        <span className="relative z-10">{t(`${link.title.toLowerCase()}`)}</span>
                      </div>
                    </Link>
                  )
                })}
              <AboutMenu className="hidden sm:block" />
              <SearchButton />
              <ThemeSwitch />
              <LangSwitch />
              <MobileNav />
            </div>
          )}
        </div>
      </SectionContainer>
    </header>
  )
}

export default Header
