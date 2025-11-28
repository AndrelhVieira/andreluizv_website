/* eslint-disable no-duplicate-imports */
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { genPageMetadata } from 'app/[locale]/seo'
import type { Curriculum } from 'contentlayer/generated'
import { allCurriculums } from 'contentlayer/generated'
import type { Metadata } from 'next'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent } from 'pliny/utils/contentlayer'
import type { ReactElement } from 'react'
import PostCurriculumLayout from './PostCurriculum'
import PrintButton from './PrintButton'

type CurriculumProps = {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export async function generateMetadata({ params }: CurriculumProps): Promise<Metadata> {
  const { locale } = await params
  return genPageMetadata({
    title: 'Curriculum',
    params: { locale },
  })
}

const CustomTitle = ({ children }) => (
  <h2 className="mb-2 inline-block border-b-2 border-gray-900 leading-4">{children}</h2>
)

export default async function Page({ params }: CurriculumProps): Promise<ReactElement> {
  const { locale } = await params
  const curriculum = allCurriculums.find((c) => c.language === locale) as Curriculum
  const mainContent = coreContent(curriculum)

  return (
    <>
      <PostCurriculumLayout locale={locale} content={mainContent}>
        <div>
          <MDXLayoutRenderer
            code={curriculum.body.code}
            components={{
              p: ({ children }) => <p className="my-3">{children}</p>,
              h2: CustomTitle,
            }}
          />
        </div>
      </PostCurriculumLayout>
      <PrintButton />
    </>
  )
}
