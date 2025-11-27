import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import type { Curriculum } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { JSX, ReactNode } from 'react'
import type { LocaleTypes } from '../i18n/settings'

import CurriculumInfos from '@/components/CurriculumInfos'
import Share from '@/components/share'
import { createTranslation } from '../i18n/server'

interface PostCurriculumProps {
  locale: LocaleTypes
  content: CoreContent<Curriculum>
  children: ReactNode
}

export default async function PostCurriculumLayout({
  content,
  children,
  locale,
}: PostCurriculumProps): Promise<JSX.Element> {
  const { slug, title } = content
  const { t } = await createTranslation(locale, 'curriculum')

  return (
    <SectionContainer>
      <article id="curriculum-content">
        <div>
          <header>
            <div className="space-y-1 border-b border-gray-200 pb-10 text-center dark:border-gray-700">
              <dl>
                <div>
                  <dt className="sr-only">{t('pub')}</dt>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
              <CurriculumInfos locale={locale} />
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 xl:divide-y-0 dark:divide-gray-700">
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>
            </div>
          </div>
        </div>
      </article>
      <Share title={title} slug={slug} />
    </SectionContainer>
  )
}
