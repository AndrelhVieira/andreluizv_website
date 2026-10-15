/* eslint-disable no-console -- CLI script, console is the UI */
/**
 * Imports data/blog/{locale}/*.mdx into the database and uploads the images they
 * reference from public/static/blog to Vercel Blob.
 *
 * Idempotent: posts are upserted by (locale, slug) and images already in the
 * `assets` table are not uploaded again. Safe to re-run after new posts land on main.
 *
 *   yarn workspace @andreluizv/api import:mdx              # import everything
 *   yarn workspace @andreluizv/api import:mdx --dry-run    # parse and report only
 *   yarn workspace @andreluizv/api import:mdx --skip-images  # keep /static paths
 *   DB_TARGET=production yarn workspace @andreluizv/api import:mdx  # production database
 */
import { put } from '@vercel/blob'
import { sql } from 'drizzle-orm'
import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { createDb } from '../src/db/client.js'
import { assets, posts, type NewPostRow } from '../src/db/schema.js'
import { databaseHost, findRepoRoot, getDatabaseEnv } from '../src/env.js'
import { findAssetPaths, parseMdxFile, rewriteAssetPaths } from '../src/import/mdx.js'
import { revalidateSite } from '../src/revalidate.js'

const { values: args } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'skip-images': { type: 'boolean', default: false },
  },
})

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

const root = findRepoRoot()
const blogDir = join(root, 'data', 'blog')

async function readPosts(): Promise<NewPostRow[]> {
  const parsed: NewPostRow[] = []
  const errors: string[] = []
  for (const locale of await readdir(blogDir)) {
    if (!(await stat(join(blogDir, locale))).isDirectory()) continue
    for (const file of await readdir(join(blogDir, locale))) {
      if (extname(file) !== '.mdx') continue
      const path = join('data', 'blog', locale, file)
      try {
        const raw = await readFile(join(root, path), 'utf8')
        parsed.push(parseMdxFile({ locale, slug: basename(file, '.mdx'), raw }))
      } catch (error) {
        errors.push(`${path}: ${(error as Error).message}`)
      }
    }
  }
  if (errors.length > 0) {
    throw new Error(`Could not parse ${errors.length} file(s):\n${errors.join('\n')}`)
  }
  return parsed
}

async function main() {
  const env = getDatabaseEnv()
  const dryRun = args['dry-run']
  console.log(`Database: ${databaseHost(env.DATABASE_URL_UNPOOLED)}`)
  const parsed = await readPosts()
  const assetPaths = [...new Set(parsed.flatMap(findAssetPaths))].sort()

  const byLocale = Object.groupBy(parsed, (p) => p.locale)
  console.log(
    `Parsed ${parsed.length} posts (${Object.entries(byLocale)
      .map(([l, list]) => `${l}: ${list?.length}`)
      .join(', ')}), ${assetPaths.length} referenced images`
  )

  const { db, close } = createDb(env.DATABASE_URL_UNPOOLED)
  try {
    const urls = new Map<string, string>()

    if (!args['skip-images']) {
      const known = await db.select({ sourcePath: assets.sourcePath, url: assets.url }).from(assets)
      for (const a of known) if (a.sourcePath) urls.set(a.sourcePath, a.url)

      const pending = assetPaths.filter((p) => !urls.has(p))
      console.log(`Images: ${urls.size} already uploaded, ${pending.length} to upload`)

      for (const sourcePath of pending) {
        const contentType = CONTENT_TYPES[extname(sourcePath).toLowerCase()]
        if (!contentType) throw new Error(`Unsupported image type: ${sourcePath}`)
        if (dryRun) continue

        const file = await readFile(join(root, 'public', sourcePath))
        const pathname = sourcePath.replace(/^\/static\//, '')
        const blob = await put(pathname, file, {
          access: 'public',
          contentType,
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        await db
          .insert(assets)
          .values({ pathname, url: blob.url, contentType, size: file.byteLength, sourcePath })
          .onConflictDoUpdate({
            target: assets.pathname,
            set: { url: blob.url, contentType, size: file.byteLength, sourcePath },
          })
        urls.set(sourcePath, blob.url)
        console.log(`  ↑ ${sourcePath}`)
      }
    }

    const rows = parsed.map((p) => rewriteAssetPaths(p, urls))

    if (dryRun) {
      console.log('Dry run: nothing written.')
      return
    }

    await db.transaction(async (tx) => {
      for (const row of rows) {
        await tx
          .insert(posts)
          .values(row)
          .onConflictDoUpdate({ target: [posts.locale, posts.slug], set: row })
      }
    })

    const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(posts)
    console.log(`Upserted ${rows.length} posts. Table now has ${total?.count} posts.`)

    const revalidation = await revalidateSite()
    console.log(
      revalidation.status === 'revalidated'
        ? 'Site cache revalidated.'
        : `Site not revalidated: ${revalidation.reason}.`
    )
  } finally {
    await close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
