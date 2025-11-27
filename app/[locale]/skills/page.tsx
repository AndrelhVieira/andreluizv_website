import type { Metadata } from 'next'
import { createTranslation } from '../i18n/server'
import type { LocaleTypes } from '../i18n/settings'
import { genPageMetadata } from '../seo'

import TechCarousel from './TechCarousel'
import TechsMobile from './TechsMobile'

type SkillsProps = {
  params: { skills: string[]; locale: LocaleTypes }
}

export async function generateMetadata({ params: { locale } }: SkillsProps): Promise<Metadata> {
  return genPageMetadata({
    title: 'Skills',
    params: { locale },
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const SkillsPage = async ({ params: { locale } }: SkillsProps) => {
  const { t } = await createTranslation(locale, 'skills')
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-heading-400 dark:text-heading-400 text-3xl leading-9 font-extrabold tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Skills
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>
      <TechCarousel params={{ locale }} />
      <TechsMobile params={{ locale }} />
    </div>
  )
}

export default SkillsPage
