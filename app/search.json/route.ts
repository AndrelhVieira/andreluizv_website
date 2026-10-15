import { getAllPosts } from 'lib/content'

export const revalidate = 3600

/** Documents for the kbar search (siteMetadata.search.kbarConfig.searchDocumentsPath) */
export async function GET(): Promise<Response> {
  return Response.json(await getAllPosts())
}
