import { put } from '@vercel/blob'

export interface AssetStorage {
  /** Stores the file at a stable pathname (same name = same URL) and returns its public URL */
  upload(pathname: string, body: Buffer, contentType: string): Promise<{ url: string }>
}

/** Vercel Blob. Credentials come from BLOB_STORE_ID + OIDC (no read-write token). */
export const blobStorage: AssetStorage = {
  async upload(pathname, body, contentType) {
    const blob = await put(pathname, body, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return { url: blob.url }
  },
}

export const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}
