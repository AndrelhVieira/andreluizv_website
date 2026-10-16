import { desc, inArray } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { assets } from '../db/schema.js'

export interface AssetRecord {
  pathname: string
  url: string
  contentType: string
  size: number
  /** The /static/blog/... path posts use to reference this file */
  sourcePath: string
}

export interface AssetListItem extends AssetRecord {
  /** ISO 8601 */
  createdAt: string
}

export interface AssetRepository {
  /** sourcePath -> public URL, for the paths that were already uploaded */
  urlsBySourcePath(sourcePaths: string[]): Promise<Map<string, string>>
  save(asset: AssetRecord): Promise<void>
  /** Newest first, for the admin image gallery */
  list(options: { limit: number; offset: number }): Promise<AssetListItem[]>
}

export function createAssetRepository(db: Db): AssetRepository {
  return {
    async urlsBySourcePath(sourcePaths) {
      if (sourcePaths.length === 0) {
        return new Map()
      }
      const rows = await db
        .select({ sourcePath: assets.sourcePath, url: assets.url })
        .from(assets)
        .where(inArray(assets.sourcePath, sourcePaths))
      return new Map(rows.flatMap((r) => (r.sourcePath ? [[r.sourcePath, r.url] as const] : [])))
    },

    async list({ limit, offset }) {
      const rows = await db
        .select()
        .from(assets)
        .orderBy(desc(assets.createdAt), desc(assets.pathname))
        .limit(limit)
        .offset(offset)
      return rows.map((row) => ({
        pathname: row.pathname,
        url: row.url,
        contentType: row.contentType,
        size: row.size,
        sourcePath: row.sourcePath ?? '',
        createdAt: row.createdAt.toISOString(),
      }))
    },

    async save(asset) {
      const { url, contentType, size, sourcePath } = asset
      await db.insert(assets).values(asset).onConflictDoUpdate({
        target: assets.pathname,
        set: { url, contentType, size, sourcePath },
      })
    },
  }
}
