import { AdSlot } from '@/components/ads/AdSlot'
import { components } from '@/components/mdxcomponents'
import { maintitle } from '@/data/localeMetadata'
import siteMetadata from '@/data/siteMetadata'
import PostBanner from '@/layouts/PostBanner'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import { createTranslation } from 'app/[locale]/i18n/server'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { localeUrl, pageAlternates } from 'app/[locale]/seo'
import { allAuthors, type Authors } from 'contentlayer/generated'
import 'css/prism.css'
import 'katex/dist/katex.css'
import { adSlots } from 'lib/ads'
import { getPost, getPostRoutes, getPosts, toSummary } from 'lib/content'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent } from 'pliny/utils/contentlayer'
import type { ReactElement } from 'react'
import { FadeIn } from '@/components/FadeIn'

interface PageProps {
  params: Promise<{
    slug: string[]
    locale: LocaleTypes
  }>
}

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata | undefined> {
  const { slug, locale } = await params
  const dslug = decodeURI(slug.join('/'))
  const post = await getPost(locale, dslug)
  if (!post) {
    return
  }

  const author = allAuthors.filter((a) => a.language === locale).find((a) => a.default === true)
  const authorList = post.authors || author
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors
      .filter((a) => a.language === locale)
      .find((a) => a.slug.includes(author))
    return coreContent(authorResults as Authors)
  })
  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const translations = (await getPostRoutes())
    .filter((route) => route.slug === dslug && !route.draft)
    .map((route) => route.language)
  const path = `/blog/${dslug}`
  const alternates = pageAlternates(locale, path, translations)
  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    alternates: post.canonicalUrl ? { ...alternates, canonical: post.canonicalUrl } : alternates,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: maintitle[locale],
      locale: post.language,
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: localeUrl(locale, path),
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async (): Promise<{ slug: string[] }[]> => {
  const routes = await getPostRoutes()
  return routes.map((p) => ({ slug: p.slug.split('/') }))
}

export default async function Page({ params }: PageProps): Promise<ReactElement> {
  const { slug, locale } = await params
  const dslug = decodeURI(slug.join('/'))

  const sortedCoreContents = await getPosts(locale)
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === dslug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = await getPost(locale, dslug)

  if (!post) {
    return notFound()
  }

  const author = allAuthors.filter((a) => a.language === locale).find((a) => a.default === true)
  const authorList = post.authors || author
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors
      .filter((a) => a.language === locale)
      .find((a) => a.slug.includes(author))
    return coreContent(authorResults as Authors)
  })
  const mainContent = toSummary(post)
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })

  const Layout = layouts[post.layout || defaultLayout]
  const { t } = await createTranslation(locale, 'common')

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(jsonLd)}
      </script>
      <FadeIn>
        <Layout
          content={mainContent}
          authorDetails={authorDetails}
          next={next}
          prev={prev}
          params={{ locale }}
        >
          <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
          {/* Ads only ever appear on posts, never on the portfolio and CV pages */}
          <AdSlot slot={adSlots.postEnd} label={t('advertisement')} />
        </Layout>
      </FadeIn>
    </>
  )
}
