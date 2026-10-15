import { defineConfig } from 'drizzle-kit'
import { getDatabaseEnv } from './src/env.js'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  // Neon also creates a `neon_auth` schema; drizzle must never touch it
  schemaFilter: ['public'],
  dbCredentials: { url: getDatabaseEnv().DATABASE_URL_UNPOOLED },
  strict: true,
})
