import tagData from 'app/[locale]/tag-data.json'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { withSeries, type ContentSource, type TagCounts } from './types'

/** Posts compiled at build time from data/blog/**\/*.mdx */
export const contentlayerSource: ContentSource = {
  async getAllPosts() {
    return allCoreContent(sortPosts(allBlogs))
  },

  async getPosts(locale) {
    return allCoreContent(sortPosts(allBlogs.filter((p) => p.language === locale)))
  },

  async getPost(locale, slug) {
    const post = allBlogs.find((p) => p.language === locale && p.slug === slug)
    return post ? withSeries(post, allBlogs) : null
  },

  async getPostRoutes() {
    return allBlogs.map(({ slug, language, date, lastmod, draft }) => ({
      slug,
      language,
      date,
      lastmod,
      draft,
    }))
  },

  async getTagCounts(locale) {
    return (tagData as Record<string, TagCounts>)[locale] ?? {}
  },
}
