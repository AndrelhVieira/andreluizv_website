import { createHash, timingSafeEqual } from 'node:crypto'
import type { FastifyRequest, preHandlerAsyncHookHandler } from 'fastify'
import { httpError } from './http-error.js'

export const API_KEY_HEADER = 'x-api-key'

const digest = (value: string) => createHash('sha256').update(value).digest()

/** Constant-time comparison; hashing first makes both buffers the same length. */
export function hasValidApiKey(request: FastifyRequest, apiKey: string): boolean {
  const received = request.headers[API_KEY_HEADER]
  if (typeof received !== 'string' || received.length === 0) {
    return false
  }
  return timingSafeEqual(digest(received), digest(apiKey))
}

/** preHandler for routes that change content */
export function requireApiKey(apiKey: string): preHandlerAsyncHookHandler {
  return async (request) => {
    if (!hasValidApiKey(request, apiKey)) {
      throw httpError(401, 'A valid API key is required')
    }
  }
}
