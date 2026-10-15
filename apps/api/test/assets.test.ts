import { describe, expect, it } from 'vitest'
import { MAX_ASSET_BYTES } from '../src/assets/routes.js'
import { auth, memoryAssets, memoryStorage, testApp } from './support/memory.js'

function multipart(fields: Record<string, string>, file?: { name: string; body: Buffer }) {
  const boundary = '----test-boundary'
  const parts: Buffer[] = []
  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
      )
    )
  }
  if (file) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: application/octet-stream\r\n\r\n`
      ),
      file.body,
      Buffer.from('\r\n')
    )
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`))
  return {
    payload: Buffer.concat(parts),
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  }
}

describe('POST /assets', () => {
  it('uploads an image under its /static/blog name and records it', async () => {
    const assets = memoryAssets()
    const storage = memoryStorage()
    const { app } = testApp({ assets, storage })
    const { payload, headers } = multipart(
      { sourcePath: '/static/blog/cover.webp' },
      { name: 'cover.webp', body: Buffer.from('image-bytes') }
    )

    const res = await app.inject({
      method: 'POST',
      url: '/assets',
      payload,
      headers: { ...headers, ...auth },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual({
      sourcePath: '/static/blog/cover.webp',
      url: 'https://blob.test/blog/cover.webp',
    })
    expect(storage.files.get('blog/cover.webp')?.toString()).toBe('image-bytes')
    expect(assets.records[0]).toMatchObject({ contentType: 'image/webp', size: 11 })
  })

  it('requires the API key', async () => {
    const { app } = testApp()
    const { payload, headers } = multipart(
      { sourcePath: '/static/blog/cover.webp' },
      { name: 'cover.webp', body: Buffer.from('x') }
    )
    const res = await app.inject({ method: 'POST', url: '/assets', payload, headers })
    expect(res.statusCode).toBe(401)
  })

  it.each(['/static/other/cover.webp', '/static/blog/script.js', '../etc/passwd', ''])(
    'rejects the source path %j',
    async (sourcePath) => {
      const { app } = testApp()
      const { payload, headers } = multipart({ sourcePath }, { name: 'f', body: Buffer.from('x') })
      const res = await app.inject({
        method: 'POST',
        url: '/assets',
        payload,
        headers: { ...headers, ...auth },
      })
      expect(res.statusCode).toBe(400)
    }
  )

  it('rejects files over the size limit', async () => {
    const storage = memoryStorage()
    const { app } = testApp({ storage })
    const { payload, headers } = multipart(
      { sourcePath: '/static/blog/huge.png' },
      { name: 'huge.png', body: Buffer.alloc(MAX_ASSET_BYTES + 1) }
    )
    const res = await app.inject({
      method: 'POST',
      url: '/assets',
      payload,
      headers: { ...headers, ...auth },
    })
    expect(res.statusCode).toBe(413)
    expect(storage.files.size).toBe(0)
  })
})
