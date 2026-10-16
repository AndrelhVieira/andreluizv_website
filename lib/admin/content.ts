import 'server-only'

import type { Locale, Post, PostSummary, TagCounts } from '@andreluizv/shared'
import { adminEnv } from './env'

/**
 * Content API client for /admin. Always authenticated and uncached: the editor must see
 * drafts and its own writes immediately. Public pages keep using lib/content.
 */

export type WriteError =
  | { kind: 'frontmatter'; message: string; fields: Record<string, string[]> }
  | { kind: 'missingAssets'; message: string; paths: string[] }
  | { kind: 'mdx'; message: string }
  | { kind: 'other'; message: string }

export type WriteResult = { ok: true; revalidated: boolean } | { ok: false; error: WriteError }

async function call(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(new URL(path, adminEnv.contentApiUrl()), {
    ...init,
    headers: { 'x-api-key': adminEnv.contentApiKey(), ...init.headers },
    cache: 'no-store',
  })
}

async function expectJson<T>(response: Response, what: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${what} failed with ${response.status}`)
  }
  return (await response.json()) as T
}

export async function listAllPosts(): Promise<PostSummary[]> {
  return expectJson(await call('/posts?drafts=true'), 'Listing posts')
}

export async function getPostForEditing(locale: Locale, slug: string): Promise<Post | null> {
  const response = await call(`/posts/${locale}/${encodeURIComponent(slug)}?drafts=true`)
  if (response.status === 404) {
    return null
  }
  return expectJson(response, 'Loading the post')
}

export async function getTagCountsForLocale(locale: Locale): Promise<TagCounts> {
  return expectJson(await call(`/tags?locale=${locale}&drafts=true`), 'Loading tags')
}

export async function savePost(locale: Locale, slug: string, mdx: string): Promise<WriteResult> {
  const response = await call(`/posts/${locale}/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mdx }),
  })
  const body = (await response.json().catch(() => ({}))) as {
    error?: string
    issues?: { formErrors?: string[]; fieldErrors?: Record<string, string[]> }
    missingAssets?: string[]
    mdxError?: string
    revalidation?: { ok?: boolean }
  }
  if (response.ok) {
    return { ok: true, revalidated: body.revalidation?.ok !== false }
  }
  if (body.mdxError) {
    return { ok: false, error: { kind: 'mdx', message: body.mdxError } }
  }
  if (body.missingAssets) {
    return {
      ok: false,
      error: { kind: 'missingAssets', message: body.error ?? '', paths: body.missingAssets },
    }
  }
  if (body.issues) {
    return {
      ok: false,
      error: {
        kind: 'frontmatter',
        message: [body.error, ...(body.issues.formErrors ?? [])].filter(Boolean).join(' — '),
        fields: body.issues.fieldErrors ?? {},
      },
    }
  }
  return {
    ok: false,
    error: { kind: 'other', message: body.error ?? `Request failed with ${response.status}` },
  }
}

export async function deletePost(locale: Locale, slug: string): Promise<void> {
  await expectJson(
    await call(`/posts/${locale}/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
    'Deleting the post'
  )
}

export interface AssetItem {
  url: string
  sourcePath: string
  size: number
  createdAt: string
}

export async function listAssets(offset: number, limit = 48): Promise<AssetItem[]> {
  const items = await expectJson<Array<AssetItem & Record<string, unknown>>>(
    await call(`/assets?limit=${limit}&offset=${offset}`),
    'Listing images'
  )
  return items.map(({ url, sourcePath, size, createdAt }) => ({ url, sourcePath, size, createdAt }))
}

/** Uploads to Vercel Blob through the API; returns the public URL. */
export async function uploadAsset(sourcePath: string, file: Blob): Promise<string> {
  const form = new FormData()
  // The API reads sourcePath before the file
  form.append('sourcePath', sourcePath)
  form.append('file', file, sourcePath.split('/').pop())
  const { url } = await expectJson<{ url: string }>(
    await call('/assets', { method: 'POST', body: form }),
    'Uploading the image'
  )
  return url
}
