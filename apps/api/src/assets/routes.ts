import multipart from '@fastify/multipart'
import type { FastifyInstance } from 'fastify'
import { extname } from 'node:path'
import { requireApiKey } from '../auth.js'
import { httpError } from '../http-error.js'
import { isStaticBlogPath } from '../import/mdx.js'
import type { AssetRepository } from './repository.js'
import { IMAGE_CONTENT_TYPES, type AssetStorage } from './storage.js'

export interface AssetRoutesOptions {
  assets: AssetRepository
  storage: AssetStorage
  apiKey: string
}

/** Vercel Functions reject request bodies over 4.5 MB */
export const MAX_ASSET_BYTES = 4 * 1024 * 1024

export async function assetRoutes(
  app: FastifyInstance,
  { assets, storage, apiKey }: AssetRoutesOptions
): Promise<void> {
  await app.register(multipart, { limits: { fileSize: MAX_ASSET_BYTES, files: 1, fields: 1 } })
  app.addHook('preHandler', requireApiKey(apiKey))

  /**
   * multipart/form-data with a `sourcePath` field (/static/blog/<file>, sent before the
   * file) and a `file`. Re-uploading the same sourcePath replaces the file in place.
   */
  app.post('/assets', async (request, reply) => {
    const upload = await request.file()
    if (!upload) {
      throw httpError(400, 'Send the image as a multipart "file" field')
    }

    const field = upload.fields.sourcePath
    const sourcePath = field && 'value' in field ? String(field.value) : ''
    if (!isStaticBlogPath(sourcePath)) {
      throw httpError(400, 'sourcePath must look like /static/blog/<name>.<image extension>', {
        sourcePath,
      })
    }

    const body = await upload.toBuffer()
    if (upload.file.truncated) {
      throw httpError(413, `Images are limited to ${MAX_ASSET_BYTES / 1024 / 1024} MB`)
    }

    const contentType = IMAGE_CONTENT_TYPES[extname(sourcePath).toLowerCase()]
    if (!contentType) {
      throw httpError(400, 'Unsupported image type', { sourcePath })
    }
    const pathname = sourcePath.replace(/^\/static\//, '')
    const { url } = await storage.upload(pathname, body, contentType)
    await assets.save({ pathname, url, contentType, size: body.byteLength, sourcePath })

    return reply.code(201).send({ sourcePath, url })
  })
}
