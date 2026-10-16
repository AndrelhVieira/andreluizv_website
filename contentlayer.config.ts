import {
  ComputedFields,
  defineDocumentType,
  defineNestedType,
  makeSource,
} from 'contentlayer2/source-files'
import readingTime from 'reading-time'
import { extractTocHeadings } from 'pliny/mdx-plugins/index.js'
import { mdxPlugins } from './lib/mdx/plugins'

// Blog posts live in the content API (apps/api), not here
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
  documentTypes: [Authors, Curriculum, BragDocument],
  mdx: {
    cwd: process.cwd(),
    ...mdxPlugins(),
  },
})
