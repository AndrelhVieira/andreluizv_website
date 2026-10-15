import { buildApp } from './app'
import { createDb } from './db/client'
import { getEnv } from './env'
import { createPostRepository } from './posts/repository'

const env = getEnv()
const { db, close } = createDb(env.DATABASE_URL)

const app = buildApp(
  { repository: createPostRepository(db), apiKey: env.CONTENT_API_KEY },
  { logger: true }
)

app.addHook('onClose', close)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => void app.close())
}

await app.listen({ port: env.PORT, host: env.HOST })
