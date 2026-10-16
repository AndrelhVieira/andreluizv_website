import { components } from '@/components/mdxcomponents'
import { maintitle } from '@/data/localeMetadata'
import siteMetadata from '@/data/siteMetadata'
import PostBanner from '@/layouts/PostBanner'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import { fallbackLng } from 'app/[locale]/i18n/locales'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { allAuthors, type Authors } from 'contentlayer/generated'
import 'css/prism.css'
import 'katex/dist/katex.css'
import { getPost, getPostRoutes, getPosts, toSummary } from 'lib/content'
import { feedUrl } from 'lib/rss'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent } from 'pliny/utils/contentlayer'
import type { ReactElement } from 'react'

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
  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      // The middleware strips the default-locale prefix (/en/x -> /x), so the
      // canonical for the default locale must omit it to avoid pointing at a redirect.
      canonical:
        post.canonicalUrl ||
        `${siteMetadata.siteUrl}${locale === fallbackLng ? '' : `/${locale}`}/blog/${dslug}`,
      types: { 'application/rss+xml': feedUrl(locale) },
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: maintitle[locale],
      locale: post.language,
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
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

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(jsonLd)}
      </script>
      <Layout
        content={mainContent}
        authorDetails={authorDetails}
        next={next}
        prev={prev}
        params={{ locale }}
      >
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}
