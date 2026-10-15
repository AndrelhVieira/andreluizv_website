import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

/**
 * Compiles the body the same way the site parses it, so a post that would break the
 * site's build or ISR render is rejected before it is saved. Returns the error message
 * (with line and column) or null when the MDX is valid.
 */
export async function findMdxError(body: string): Promise<string | null> {
  try {
    await compile(body, { remarkPlugins: [remarkGfm, remarkMath] })
    return null
  } catch (error) {
    // VFileMessage carries the position separately; lines count from the start of the body
    const { line, column, reason, message } = error as {
      line?: number
      column?: number
      reason?: string
      message?: string
    }
    const text = reason ?? message ?? String(error)
    return line ? `body line ${line}:${column ?? 1} — ${text}` : text
  }
}
