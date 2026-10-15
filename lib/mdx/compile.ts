import { compile } from '@mdx-js/mdx'
import { extractTocHeadings } from 'pliny/mdx-plugins/index.js'
import { mdxPlugins } from './plugins'

export interface CompiledMdx {
  /** Same calling convention as Contentlayer output, so pliny's MDXLayoutRenderer can run it */
  code: string
  toc: Awaited<ReturnType<typeof extractTocHeadings>>
}

/**
 * Compiles raw MDX from the content API at build/revalidation time.
 *
 * pliny's MDXLayoutRenderer evaluates `new Function('React', 'ReactDOM', '_jsx_runtime', code)`
 * (the mdx-bundler format Contentlayer emits). @mdx-js/mdx's function-body output reads the
 * runtime from `arguments[0]` instead, so it is wrapped to receive `_jsx_runtime` there.
 */
export async function compileMdx(
  source: string,
  { bibliography }: { bibliography?: string | null } = {}
): Promise<CompiledMdx> {
  const file = await compile(source, {
    outputFormat: 'function-body',
    development: false,
    ...mdxPlugins({ citation: Boolean(bibliography) }),
  })

  return {
    code: `return (function () {\n${String(file)}\n})(_jsx_runtime)`,
    toc: await extractTocHeadings(source),
  }
}
