import Fastify from 'fastify'
import { configureApp } from './create-app.js'
import { createDb } from './db/client.js'
import { getServerEnv } from './env.js'
import { createPostRepository } from './posts/repository.js'

const env = getServerEnv()
const { db, close } = createDb(env.DATABASE_URL)

// Vercel detects the entrypoint by the file that imports fastify, so the instance is created here
const app = configureApp(Fastify({ logger: true }), {
  repository: createPostRepository(db),
  apiKey: env.CONTENT_API_KEY,
})

app.addHook('onClose', close)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => void app.close())
}

// Not awaited: on Vercel, listen() is intercepted and a top-level await would block module loading
app.listen({ port: env.PORT, host: env.HOST }).catch((error: unknown) => {
  app.log.error(error)
  process.exit(1)
})
