import type { BragDocument } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { ReactNode } from 'react'

import SectionContainer from '@/components/SectionContainer'
import type { LocaleTypes } from '../i18n/settings'

interface PostBragDocumentProps {
  locale: LocaleTypes
  content: CoreContent<BragDocument>
  children: ReactNode
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function PostBragDocumentLayout({ children }: PostBragDocumentProps) {
  return (
    <SectionContainer>
      <article>
        <div>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 xl:divide-y-0 dark:divide-gray-700">
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>
            </div>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
