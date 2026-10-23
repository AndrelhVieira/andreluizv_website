import { CookieChoiceButton } from '@/components/CookieChoiceButton'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/[locale]/seo'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'
import { FadeIn } from '@/components/FadeIn'

interface PageProps {
  params: Promise<{ locale: LocaleTypes }>
}

/** Sections in reading order; each one's text lives in privacy.json under its key */
const SECTIONS = [
  { key: 'controller', paragraphs: 2 },
  { key: 'analytics', paragraphs: 3 },
  { key: 'ads', paragraphs: 3 },
  { key: 'forms', paragraphs: 3 },
  { key: 'cookies', paragraphs: 1, items: 4 },
  { key: 'hosting', paragraphs: 1 },
] as const

const AD_LINKS = [
  { key: 'google_policy', href: 'https://policies.google.com/technologies/partner-sites' },
  { key: 'ads_settings', href: 'https://adssettings.google.com' },
  { key: 'aboutads', href: 'https://optout.aboutads.info' },
  { key: 'youronlinechoices', href: 'https://www.youronlinechoices.eu' },
]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'privacy')
  return genPageMetadata({ title: t('title'), description: t('description'), params: { locale } })
}

export default async function PrivacyPage({ params }: PageProps): Promise<ReactElement> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'privacy')

  return (
    <FadeIn>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {t('title')}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{t('updated')}</p>
        </div>
        <article className="prose dark:prose-invert max-w-none py-8">
          {SECTIONS.map((section) => (
            <section key={section.key}>
              <h2>{t(`${section.key}.title`)}</h2>
              {Array.from({ length: section.paragraphs }, (_, i) => (
                <p key={i}>{t(`${section.key}.p${i + 1}`)}</p>
              ))}
              {'items' in section ? (
                <ul>
                  {Array.from({ length: section.items }, (_, i) => (
                    <li key={i}>{t(`${section.key}.item${i + 1}`)}</li>
                  ))}
                </ul>
              ) : null}
              {section.key === 'ads' ? (
                <ul>
                  {AD_LINKS.map((link) => (
                    <li key={link.key}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {t(`ads.${link.key}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          <section>
            <h2>{t('rights.title')}</h2>
            <p>{t('rights.p1')}</p>
            <CookieChoiceButton locale={locale} />
            <p>
              {t('rights.p2')} <a href={`mailto:${siteMetadata.email}`}>{siteMetadata.email}</a>
            </p>
          </section>
        </article>
      </div>
    </FadeIn>
  )
}
