import {
  ComputedFields,
  defineDocumentType,
  defineNestedType,
  makeSource,
} from 'contentlayer2/source-files'
import { writeFileSync } from 'fs'
import { slug } from 'github-slugger'
import readingTime from 'reading-time'
import { extractTocHeadings } from 'pliny/mdx-plugins/index.js'
import { fallbackLng, secondLng, thirdLng } from './app/[locale]/i18n/locales'
import { mdxPlugins } from './lib/mdx/plugins'
import siteMetadata from './data/siteMetadata'

const isProduction = process.env.NODE_ENV === 'production'

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => {
      // Split the flattenedPath by '/' and take the last part
      const pathParts = doc._raw.flattenedPath.split('/')
      return pathParts.slice(2).join('/')
    },
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'string', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 * Add logic to your own locales and project
 */

function createTagCount(allBlogs) {
  const tagCount = {
    [fallbackLng]: {},
    [secondLng]: {},
    [thirdLng]: {},
  }

  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag: string) => {
        const formattedTag = slug(tag)
        if (file.language === fallbackLng) {
          tagCount[fallbackLng][formattedTag] = (tagCount[fallbackLng][formattedTag] || 0) + 1
        } else if (file.language === secondLng) {
          tagCount[secondLng][formattedTag] = (tagCount[secondLng][formattedTag] || 0) + 1
        } else if (file.language === thirdLng) {
          tagCount[thirdLng][formattedTag] = (tagCount[thirdLng][formattedTag] || 0) + 1
        }
      })
    }
  })

  writeFileSync('./app/[locale]/tag-data.json', JSON.stringify(tagCount))
}

export const Series = defineNestedType(() => ({
  name: 'Series',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    order: {
      type: 'number',
      required: true,
    },
  },
}))

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    series: { type: 'nested', of: Series },
    date: { type: 'date', required: true },
    language: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    featured: { type: 'boolean' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' }, required: true },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },
  computedFields: {
    ...computedFields,

    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc.language}/blog/${doc.slug}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    language: { type: 'string', required: true },
    default: { type: 'boolean' },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

export const Curriculum = defineDocumentType(() => ({
  name: 'Curriculum',
  filePathPattern: 'cvs/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    language: { type: 'string' },
    title: { type: 'string', required: true },
    series: { type: 'nested', of: Series },
    date: { type: 'date', required: true },
  },
  computedFields,
}))

export const BragDocument = defineDocumentType(() => ({
  name: 'BragDocument',
  filePathPattern: 'bragDocument/**/*.mdx',
  contentType: 'mdx',
  fields: {
    language: { type: 'string' },
    title: { type: 'string' },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors, Curriculum, BragDocument],
  mdx: {
    cwd: process.cwd(),
    ...mdxPlugins(),
  },
  onSuccess: async (importData) => {
    const { allBlogs } = await importData()
    createTagCount(allBlogs)
  },
})
