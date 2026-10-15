import { afterEach, describe, expect, it, vi } from 'vitest'
import { revalidateSite } from '../src/revalidate.js'

const env = {
  SITE_REVALIDATE_URL: 'https://site.example/api/revalidate',
  REVALIDATE_SECRET: 's'.repeat(64),
}

afterEach(() => vi.unstubAllGlobals())

describe('revalidateSite', () => {
  it('skips when the site is not configured', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(revalidateSite({})).resolves.toMatchObject({ status: 'skipped' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts to the site with the shared secret', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(revalidateSite(env)).resolves.toEqual({ status: 'revalidated' })
    expect(fetchMock).toHaveBeenCalledWith(env.SITE_REVALIDATE_URL, {
      method: 'POST',
      headers: { 'x-revalidate-secret': env.REVALIDATE_SECRET },
    })
  })

  it('fails loudly when the site rejects the call', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Invalid secret', { status: 401 }))
    )

    await expect(revalidateSite(env)).rejects.toThrow(/401 Invalid secret/)
  })
})
