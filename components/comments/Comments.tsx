'use client'

import { useTheme } from '@/components/theme/ThemeContext'
import siteMetadata from '@/data/siteMetadata'
import GiscusComponent, { type AvailableLanguage } from '@giscus/react'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams } from 'next/navigation'
import { useCallback, useState, type ReactElement } from 'react'

type CommentsProps = {
  slug: string
}

/** giscus UI language per site locale */
const GISCUS_LANG: Record<LocaleTypes, AvailableLanguage> = { en: 'en', pt: 'pt', es: 'es' }

/**
 * giscus comments (GitHub Discussions in AndrelhVieira/blog_discuss_base), loaded on demand.
 * Uses @giscus/react directly: pliny's wrapper picks the theme through next-themes, which
 * this site doesn't use, so dark mode always got the light theme.
 */
export default function Comments({ slug }: CommentsProps): ReactElement | null {
  const [loadComments, setLoadComments] = useState(false)
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'home')
  const { resolvedTheme } = useTheme()

  const handleLoadComments = useCallback(() => {
    setLoadComments(true)
  }, [])

  const { comments } = siteMetadata
  if (comments?.provider !== 'giscus') {
    return null
  }
  const config = comments.giscusConfig

  if (!loadComments) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 px-6 py-8 dark:border-gray-700">
        <span className="bg-primary-500/10 text-primary-500 rounded-full p-3">
          <ChatBubbleLeftRightIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t('commentstitle')}
          </h2>
          <p className="mx-auto max-w-md text-sm text-gray-600 dark:text-gray-400">
            {t('commentsdescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadComments}
          className="bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 inline-flex cursor-pointer items-center gap-2 rounded-md px-5 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 focus:outline-none dark:ring-offset-black"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
          {t('comment')}
        </button>
      </section>
    )
  }

  return (
    <GiscusComponent
      key={slug}
      id="comments-container"
      repo={config.repo as `${string}/${string}`}
      repoId={config.repositoryId}
      category={config.category}
      categoryId={config.categoryId}
      mapping={config.mapping}
      reactionsEnabled={config.reactions}
      emitMetadata={config.metadata}
      inputPosition="top"
      theme={resolvedTheme === 'dark' ? config.darkTheme : config.theme}
      lang={GISCUS_LANG[locale] ?? 'en'}
      loading="lazy"
    />
  )
}
