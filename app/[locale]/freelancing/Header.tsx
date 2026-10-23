'use client'

import CustomLink from '@/components/mdxcomponents/Link'
import SectionContainer from '@/components/SectionContainer'
import { useTranslation } from '../i18n/client'
import type { LocaleTypes } from '../i18n/settings'

export default function Header({ locale }: { locale: LocaleTypes }): React.ReactElement {
  const { t } = useTranslation(locale, 'freelancing')

  return (
    <SectionContainer>
      <div className="flex flex-col justify-between font-sans">
        <div className="relative isolate px-6 lg:px-8">
          {/* Pink glow behind the hero. Plain radial gradients: the old clip-path + blur-3xl +
              transform-gpu blobs sat in clipped composited layers, whose edges showed as a hard
              line under the header in dark mode. Each ellipse fades out before the element's
              edges, so there is no edge to see. Full width via 50vw; the layout clips the overflow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-44 -bottom-40 left-[calc(50%-50vw)] -z-10 w-screen bg-[radial-gradient(ellipse_32%_24%_at_37%_25%,rgb(219_84_97/0.34),rgb(219_84_97/0.12)_45%,transparent_100%),radial-gradient(ellipse_26%_18%_at_70%_80%,rgb(232_94_140/0.28),rgb(232_94_140/0.1)_45%,transparent_100%)]"
          />
          {/* The sticky site header now sits above this hero (it used to float over it), so the top
            padding is the old one minus the header's height */}
          <div className="pt-2 pb-32 sm:pt-16 sm:pb-48 lg:pt-24 lg:pb-56">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="*: relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-300 dark:ring-gray-300/10 dark:hover:ring-gray-100/20">
                {t('header.portfolio_cta')}
                <CustomLink href="#portfolio" className="text-primary-500 ml-2 font-semibold">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t('header.portfolio_cta_button')} <span aria-hidden="true">&rarr;</span>
                </CustomLink>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                {t('header.title')}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                {t('header.subtitle')}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <CustomLink
                  href="#services"
                  className="bg-primary-500 hover:bg-primary-600 focus-visible:outline-primary-500 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {t('services')}
                </CustomLink>
                <CustomLink
                  href="#contact"
                  className="text-sm leading-6 font-semibold text-gray-900 dark:text-white"
                >
                  {t('contact')} <span aria-hidden="true">→</span>
                </CustomLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
