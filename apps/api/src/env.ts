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
 * - .env.local:             pulled from Vercel with `vercel env pull`
 */
function loadEnvFiles(): void {
  if (process.env.VERCEL) {
    return
  }
  const root = findRepoRoot()
  for (const file of ['.env.development.local', '.env.local']) {
    const path = join(root, file)
    if (existsSync(path)) {
      process.loadEnvFile(path)
    }
  }
}

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_URL_UNPOOLED: z.url(),
  CONTENT_API_KEY: z.string().regex(/^[0-9a-f]{64}$/, 'must be 64 hex chars'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('127.0.0.1'),
})
export type Env = z.infer<typeof EnvSchema>

let cached: Env | undefined

export function getEnv(): Env {
  if (!cached) {
    loadEnvFiles()
    const result = EnvSchema.safeParse(process.env)
    if (!result.success) {
      throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`)
    }
    cached = result.data
  }
  return cached
}
