import { LocaleSchema, PostSummarySchema } from '@andreluizv/shared'
import type { FastifyInstance } from 'fastify'
import { ZodError, z } from 'zod'
import type { AssetRepository } from '../assets/repository.js'
import { requireApiKey } from '../auth.js'
import { httpError } from '../http-error.js'
import { findAssetPaths, parseMdxFile, rewriteAssetPaths } from '../import/mdx.js'
import type { RevalidateResult } from '../revalidate.js'
import type { PostRepository } from './repository.js'
import { findMdxError } from './validate-mdx.js'

export interface WriteRoutesOptions {
  repository: PostRepository
  assets: AssetRepository
  apiKey: string
  revalidate: () => Promise<RevalidateResult>
}

const PostParams = z.object({ locale: LocaleSchema, slug: z.string().min(1) })
const NewSlug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case (a-z, 0-9 and dashes)')
const PutBody = z.object({ mdx: z.string().min(1) })

export async function writeRoutes(
  app: FastifyInstance,
  { repository, assets, apiKey, revalidate }: WriteRoutesOptions
): Promise<void> {
  app.addHook('preHandler', requireApiKey(apiKey))

  /**
   * Creates or replaces a post from a full MDX file (frontmatter + body).
   * Images must be referenced as /static/blog/<file>; unknown ones are reported in
   * `missingAssets` (422) so the client can upload them and retry.
   */
  app.put('/posts/:locale/:slug', async (request, reply) => {
    const { locale, slug } = PostParams.parse(request.params)
    NewSlug.parse(slug)
    const { mdx } = PutBody.parse(request.body)

    let row
    try {
      row = parseMdxFile({ locale, slug, raw: mdx })
    } catch (error) {
      if (error instanceof ZodError) throw error
      throw httpError(400, (error as Error).message)
    }

    const referenced = findAssetPaths(row)
    const urls = await assets.urlsBySourcePath(referenced)
    const missingAssets = referenced.filter((path) => !urls.has(path))
    if (missingAssets.length > 0) {
      throw httpError(422, 'Upload the referenced images first', { missingAssets })
    }

    const rewritten = rewriteAssetPaths(row, urls)
    const mdxError = await findMdxError(rewritten.bodyMdx)
    if (mdxError) {
      throw httpError(422, 'The MDX body does not compile', { mdxError })
    }

    const { created, post } = await repository.save(rewritten)
    return reply.code(created ? 201 : 200).send({
      status: created ? 'created' : 'updated',
      // parse() drops the fields a summary doesn't have (body, bibliography)
      post: PostSummarySchema.parse(post),
      revalidation: await revalidate(),
    })
  })

  app.delete('/posts/:locale/:slug', async (request) => {
    const { locale, slug } = PostParams.parse(request.params)
    if (!(await repository.remove(locale, slug))) {
      throw httpError(404, 'Post not found')
    }
    return { status: 'deleted', revalidation: await revalidate() }
  })
}
