import { defineConfig } from 'drizzle-kit'
import { getEnv } from './src/env'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  // Neon also creates a `neon_auth` schema; drizzle must never touch it
  schemaFilter: ['public'],
  dbCredentials: { url: getEnv().DATABASE_URL_UNPOOLED },
  strict: true,
})
