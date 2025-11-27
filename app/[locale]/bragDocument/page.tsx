/* eslint-disable no-duplicate-imports */
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { genPageMetadata } from 'app/[locale]/seo'
import type { BragDocument } from 'contentlayer/generated'
import { allBragDocuments } from 'contentlayer/generated'
import type { Metadata } from 'next'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent } from 'pliny/utils/contentlayer'
import type { JSX } from 'react'
import PostBragDocumentLayout from './PostBragDocument'

type BragDocumentProps = {
  params: { locale: LocaleTypes }
}

export async function generateMetadata({
  params: { locale },
}: BragDocumentProps): Promise<Metadata> {
  return genPageMetadata({
    title: 'BragDocument',
    params: { locale },
  })
}

const CustomTitle = ({ children }) => (
  <h2 className="mb-2 inline-block border-b-2 border-gray-900 leading-4">{children}</h2>
)

export default function Page({ params: { locale } }: BragDocumentProps): JSX.Element {
  const bragDocument = allBragDocuments.find((c) => c.language === locale) as BragDocument
  const mainContent = coreContent(bragDocument)

  return (
    <PostBragDocumentLayout locale={locale} content={mainContent}>
      <div>
        <MDXLayoutRenderer
          code={bragDocument.body.code}
          components={{
            p: ({ children }) => <p className="my-3">{children}</p>,
            h2: CustomTitle,
          }}
        />
      </div>
    </PostBragDocumentLayout>
  )
}
