import { AuthorCard } from '@/components/AuthorCard'
import Comments from '@/components/comments/Comments'
import WalineComments from '@/components/comments/walinecomponents/walineComments'
import Image from '@/components/mdxcomponents/Image'
import Link from '@/components/mdxcomponents/Link'
import PageTitle from '@/components/PageTitle'
import ScrollTopAndComment from '@/components/scroll'
import SectionContainer from '@/components/SectionContainer'
import { PostSeriesBox } from '@/components/seriescard'
import Share from '@/components/share'
import Sidetoc from '@/components/sidetoc'
import Tag from '@/components/tag'
import siteMetadata from '@/data/siteMetadata'
import { createTranslation } from 'app/[locale]/i18n/server'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import type { Authors } from 'contentlayer/generated'
import type { Toc } from 'pliny/mdx-plugins'
import Bleed from 'pliny/ui/Bleed'
import type { PostSummary } from 'lib/content'
import type { CoreContent } from 'pliny/utils/contentlayer'
import React, { type ReactNode } from 'react'

interface PostBannerProps {
  content: PostSummary & {
    series?: {
      title: string
      order: number
      posts?: Array<{
        title: string
        slug: string
        language: string
        isCurrent: boolean
      }>
    }
  }
  authorDetails: CoreContent<Authors>[]
  children: ReactNode
  next?: { slug: string; title: string }
  prev?: { slug: string; title: string }
  params: { locale: LocaleTypes }
}

const postDateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
}

export default async function PostMinimal({
  content,
  authorDetails,
  next,
  prev,
  children,
  params: { locale },
}: PostBannerProps): Promise<React.JSX.Element> {
  const { slug, title, images, series, toc, date, tags, readingTime } = content
  const { t } = await createTranslation(locale, 'common')
  const [author] = authorDetails
  const readingMinutes = Math.max(1, Math.ceil(readingTime?.minutes ?? 0))
  const tableOfContents: Toc = toc as unknown as Toc
  const displayImage =
    images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/picsum/800/400'

  return (
    <>
      <ScrollTopAndComment />
      <Sidetoc toc={tableOfContents} />
      <SectionContainer>
        <article>
          <div>
            <div className="space-y-1 pb-10 text-center dark:border-gray-700">
              <div className="w-full">
                <Bleed>
                  <div className="relative aspect-[2/1] w-full">
                    <Image
                      src={displayImage}
                      alt={title}
                      fill
                      priority
                      // The cover carries its title as pixels: q75 blurs the letters
                      quality={85}
                      sizes="(max-width: 1024px) 100vw, 1024px"
                      className="object-cover"
                    />
                  </div>
                </Bleed>
              </div>
              <div className="relative pt-10">
                <PageTitle>{title}</PageTitle>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-6 text-sm text-gray-500 dark:text-gray-400">
                {author ? (
                  <>
                    {author.avatar ? (
                      <Image
                        src={author.avatar}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : null}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {author.name}
                    </span>
                    <span aria-hidden="true">·</span>
                  </>
                ) : null}
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString(locale, postDateFormat)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{t('post_reading_time', { count: readingMinutes })}</span>
              </div>
              {tags && tags.length > 0 ? (
                <div className="flex flex-wrap justify-center pt-3">
                  {tags.map((tag) => (
                    <Tag key={tag} text={tag} />
                  ))}
                </div>
              ) : null}
            </div>
            {series && series.posts ? (
              <div className="not-prose mt-4">
                <PostSeriesBox
                  data={
                    series as {
                      title: string
                      posts: Array<{
                        title: string
                        slug: string
                        language: string
                        isCurrent: boolean
                      }>
                    }
                  }
                />
              </div>
            ) : null}
            <div className="prose dark:prose-invert max-w-none py-4">{children}</div>
            <Share title={title} slug={slug} />
            {author ? (
              <AuthorCard
                author={author}
                aboutHref={`/${locale}/about`}
                labels={{ heading: t('post_about_author'), more: t('post_more_about_me') }}
              />
            ) : null}
            <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
              {siteMetadata.iswaline === true && <WalineComments />}
              {siteMetadata.comments && siteMetadata.iscomments === true ? (
                <Comments slug={slug} />
              ) : null}
            </div>
            <footer className="mb-10">
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.slug ? (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${locale}/blog/${prev.slug}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                ) : null}
                {next && next.slug ? (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${locale}/blog/${next.slug}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Next post: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                ) : null}
              </div>
            </footer>
          </div>
        </article>
      </SectionContainer>
    </>
  )
}
