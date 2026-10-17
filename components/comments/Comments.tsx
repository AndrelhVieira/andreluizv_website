'use client'

import { useTheme } from '@/components/theme/ThemeContext'
import siteMetadata from '@/data/siteMetadata'
import GiscusComponent, { type AvailableLanguage } from '@giscus/react'
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
      <button
        type="button"
        onClick={handleLoadComments}
        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
      >
        {t('comment')}
      </button>
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
