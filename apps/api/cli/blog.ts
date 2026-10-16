/* eslint-disable no-console -- CLI, console is the UI */
/**
 * Publishing CLI for the content API.
 *
 *   yarn blog push <file.mdx> [--prod] [--replace-images]
 *   yarn blog pull <locale>/<slug> [--prod] [--out <dir>] [--force]
 *   yarn blog delete <locale>/<slug> [--prod] [--yes]
 *   yarn blog list [--locale <en|pt|es>] [--prod]
 *
 * Targets the local API (yarn api:dev) by default; --prod uses .env.production.local.
 *
 * Drafts live in drafts/{locale}/{slug}.mdx (gitignored). New images go in drafts/images/
 * and are referenced in the MDX as /static/blog/<file> — the API uploads them on push and
 * rewrites the references to their Blob URLs.
 */
import type { Post, PostSummary } from '@andreluizv/shared'
import matter from 'gray-matter'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename, dirname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { findRepoRoot, getClientEnv, isProductionTarget } from '../src/env.js'
import { findStaticBlogPaths } from '../src/posts/mdx-file.js'

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    prod: { type: 'boolean', default: false },
    'replace-images': { type: 'boolean', default: false },
    out: { type: 'string' },
    force: { type: 'boolean', default: false },
    yes: { type: 'boolean', default: false },
    locale: { type: 'string' },
  },
})

if (flags.prod) {
  process.env.DB_TARGET = 'production'
}

const root = findRepoRoot()
const draftsDir = join(root, 'drafts')
const imagesDir = join(draftsDir, 'images')
// `yarn workspace` resets INIT_CWD to apps/api, so the root `blog` script passes the folder
// you ran it from as BLOG_CWD. File arguments are relative to that folder.
const cwd = process.env.BLOG_CWD || process.env.INIT_CWD || process.cwd()
const { siteUrl } = createRequire(import.meta.url)(join(root, 'data/siteMetadata.js')) as {
  siteUrl: string
}

class CliError extends Error {}

interface ApiResult<T> {
  status: number
  body: T & { error?: string; [key: string]: unknown }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const { CONTENT_API_URL, CONTENT_API_KEY } = getClientEnv()
  let response: Response
  try {
    response = await fetch(new URL(path, CONTENT_API_URL), {
      ...init,
      headers: { 'x-api-key': CONTENT_API_KEY, ...init.headers },
    })
  } catch {
    const hint = isProductionTarget()
      ? ''
      : ' Is the local API running? Start it with `yarn api:dev`.'
    throw new CliError(`Could not reach ${CONTENT_API_URL}.${hint}`)
  }
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : {} }
}

function fail(result: ApiResult<unknown>, action: string): never {
  const { error, ...details } = result.body
  const extra = Object.keys(details).length ? `\n${JSON.stringify(details, null, 2)}` : ''
  throw new CliError(`${action} failed (${result.status}): ${error ?? 'unknown error'}${extra}`)
}

// The local API is what `yarn dev` reads, on localhost:3000
const postUrl = (locale: string, slug: string): string =>
  `${isProductionTarget() ? siteUrl : 'http://localhost:3000'}${locale === 'en' ? '' : `/${locale}`}/blog/${slug}`

function parseTarget(target: string | undefined): { locale: string; slug: string } {
  const [, locale, slug] = target?.match(/^(en|pt|es)\/([\w-]+)$/) ?? []
  if (!locale || !slug) {
    throw new CliError('Expected <locale>/<slug>, e.g. pt/feature-flags-in-frontend')
  }
  return { locale, slug }
}

function announceTarget(): void {
  const { CONTENT_API_URL } = getClientEnv()
  console.log(`${isProductionTarget() ? '⚠️  PRODUCTION' : 'Local'} API: ${CONTENT_API_URL}`)
}

async function uploadImage(sourcePath: string): Promise<void> {
  const file = join(imagesDir, basename(sourcePath))
  if (!existsSync(file)) {
    throw new CliError(`Image not found: ${sourcePath} (expected at ${file})`)
  }
  const form = new FormData()
  form.append('sourcePath', sourcePath) // must come before the file
  form.append('file', new Blob([await readFile(file)]), basename(file))
  const result = await api<{ url: string }>('/assets', { method: 'POST', body: form })
  if (result.status !== 201) fail(result, `Upload of ${sourcePath}`)
  console.log(`  ↑ ${sourcePath}`)
}

async function push(fileArg: string | undefined): Promise<void> {
  if (!fileArg) throw new CliError('Usage: yarn blog push <file.mdx>')
  const file = resolve(cwd, fileArg)
  if (!existsSync(file)) {
    throw new CliError(`File not found: ${file}`)
  }
  const raw = await readFile(file, 'utf8')
  const locale = String(matter(raw).data.language ?? '')
  const slug = basename(file, '.mdx')
  announceTarget()
  console.log(`Publishing ${locale}/${slug}`)

  if (flags['replace-images']) {
    for (const path of findStaticBlogPaths(raw)) await uploadImage(path)
  }

  const send = () =>
    api<{ status: string; revalidation: { status: string; reason?: string } }>(
      `/posts/${locale}/${slug}`,
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mdx: raw }),
      }
    )

  let result = await send()
  const missing = result.body.missingAssets as string[] | undefined
  if (result.status === 422 && missing?.length) {
    console.log(`Uploading ${missing.length} new image(s)`)
    for (const path of missing) await uploadImage(path)
    result = await send()
  }
  if (result.status !== 200 && result.status !== 201) fail(result, 'Publish')

  const { revalidation } = result.body
  console.log(`✓ ${result.body.status}: ${postUrl(locale, slug)}`)
  if (revalidation.status === 'revalidated') {
    console.log('✓ site cache refreshed')
  } else if (isProductionTarget()) {
    console.log(`! site not refreshed (${revalidation.reason}); it updates within an hour`)
  }
}

function toFrontmatter(post: Post): Record<string, unknown> {
  const day = (iso: string) => iso.slice(0, 10)
  return Object.fromEntries(
    Object.entries({
      title: post.title,
      date: day(post.date),
      lastmod: post.lastmod ? day(post.lastmod) : undefined,
      language: post.locale,
      tags: post.tags,
      images: post.images,
      authors: post.authors,
      draft: post.draft,
      featured: post.featured,
      layout: post.layout,
      summary: post.summary ?? undefined,
      canonicalUrl: post.canonicalUrl ?? undefined,
      series: post.series ?? undefined,
      bibliography: post.bibliography ?? undefined,
    }).filter(([, value]) => value !== undefined)
  )
}

async function pull(target: string | undefined): Promise<void> {
  const { locale, slug } = parseTarget(target)
  announceTarget()
  const result = await api<Post>(`/posts/${locale}/${slug}?drafts=true`)
  if (result.status !== 200) fail(result, 'Pull')

  const out = resolve(cwd, flags.out ?? draftsDir, locale, `${slug}.mdx`)
  if (existsSync(out) && !flags.force) {
    throw new CliError(`${out} already exists. Use --force to overwrite it.`)
  }
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, matter.stringify(result.body.bodyMdx, toFrontmatter(result.body)))
  console.log(`✓ ${locale}/${slug} → ${out}`)
}

async function remove(target: string | undefined): Promise<void> {
  const { locale, slug } = parseTarget(target)
  announceTarget()
  if (!flags.yes) {
    console.log(
      `Would delete ${locale}/${slug} (${postUrl(locale, slug)}). Re-run with --yes to confirm.`
    )
    return
  }
  const result = await api<{ status: string }>(`/posts/${locale}/${slug}`, { method: 'DELETE' })
  if (result.status !== 200) fail(result, 'Delete')
  console.log(`✓ deleted ${locale}/${slug}`)
}

async function list(): Promise<void> {
  announceTarget()
  const query = flags.locale ? `&locale=${flags.locale}` : ''
  const result = await api<PostSummary[]>(`/posts?drafts=true${query}`)
  if (result.status !== 200) fail(result, 'List')
  for (const post of result.body as unknown as PostSummary[]) {
    const draft = post.draft ? ' [draft]' : ''
    console.log(`${post.date.slice(0, 10)}  ${post.locale}/${post.slug}${draft} — ${post.title}`)
  }
}

const commands: Record<string, (arg?: string) => Promise<void>> = {
  push,
  pull,
  delete: remove,
  list,
}
const [command, arg] = positionals
const run = command ? commands[command] : undefined

if (!run) {
  console.log('Usage: yarn blog <push|pull|delete|list> … (see apps/api/cli/blog.ts)')
  process.exit(1)
}

run(arg).catch((error) => {
  console.error(error instanceof CliError ? `✗ ${error.message}` : error)
  process.exit(1)
})
