import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { z } from 'zod'

/** Walks up from cwd until it finds the monorepo root (the folder holding yarn.lock). */
export function findRepoRoot(from = process.cwd()): string {
  let dir = from
  while (!existsSync(join(dir, 'yarn.lock'))) {
    const parent = dirname(dir)
    if (parent === dir) {
      throw new Error(`Could not find the repo root from ${from}`)
    }
    dir = parent
  }
  return dir
}

/**
 * Loads env files from the repo root. Files loaded first win, and real
 * environment variables (Vercel) always win over files.
 *
 * - .env.development.local: personal overrides (dev database branch, API key)
 * - .env.local:             pulled from Vercel with `vercel env pull` (production database)
 *
 * DB_TARGET=production skips the overrides, so scripts hit the production database.
 */
let loaded = false
function loadEnvFiles(): void {
  if (loaded || process.env.VERCEL) {
    return
  }
  loaded = true
  const root = findRepoRoot()
  const files =
    process.env.DB_TARGET === 'production'
      ? ['.env.local']
      : ['.env.development.local', '.env.local']
  for (const file of files) {
    const path = join(root, file)
    if (existsSync(path)) {
      process.loadEnvFile(path)
    }
  }
}

function parse<T extends z.ZodType>(schema: T): z.infer<T> {
  loadEnvFiles()
  const result = schema.safeParse(process.env)
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`)
  }
  return result.data
}

const DatabaseEnvSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_URL_UNPOOLED: z.url(),
})

const ServerEnvSchema = DatabaseEnvSchema.extend({
  CONTENT_API_KEY: z.string().regex(/^[0-9a-f]{64}$/, 'must be 64 hex chars'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default(process.env.VERCEL ? '0.0.0.0' : '127.0.0.1'),
})

/** For scripts and migrations: only the database is needed. */
export const getDatabaseEnv = (): z.infer<typeof DatabaseEnvSchema> => parse(DatabaseEnvSchema)

export const getServerEnv = (): z.infer<typeof ServerEnvSchema> => parse(ServerEnvSchema)

/** Host of the database a command is about to touch, for logs and confirmations. */
export const databaseHost = (url: string): string => new URL(url).host
