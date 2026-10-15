import { inArray } from 'drizzle-orm'
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

export interface AssetRepository {
  /** sourcePath -> public URL, for the paths that were already uploaded */
  urlsBySourcePath(sourcePaths: string[]): Promise<Map<string, string>>
  save(asset: AssetRecord): Promise<void>
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

    async save(asset) {
      const { url, contentType, size, sourcePath } = asset
      await db.insert(assets).values(asset).onConflictDoUpdate({
        target: assets.pathname,
        set: { url, contentType, size, sourcePath },
      })
    },
  }
}
