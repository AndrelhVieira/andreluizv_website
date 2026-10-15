import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

export function createDb(url: string): {
  db: PostgresJsDatabase<typeof schema>
  close: () => Promise<void>
} {
  // prepare: false is required behind Neon's pooler (PgBouncer in transaction mode)
  const client = postgres(url, { prepare: false, max: 5 })
  return { db: drizzle(client, { schema }), close: () => client.end() }
}

export type Db = ReturnType<typeof createDb>['db']
