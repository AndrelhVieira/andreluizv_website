/* eslint-disable no-console -- CLI, console is the UI */
/**
 * Publishing CLI for the content API.
 *
 *   yarn blog push <file.mdx> [--prod] [--replace-images] [--plan <id>]
 *   yarn blog pull <locale>/<slug> [--prod] [--out <dir>] [--force]
 *   yarn blog delete <locale>/<slug> [--prod] [--yes]
 *   yarn blog list [--locale <en|pt|es>] [--prod]
 *   yarn blog email <locale>/<slug> [<locale>/<slug> …] [--note "…"] [--prod]
 *   yarn blog email welcome <locale> [--prod]
 *   yarn blog ideas [--prod]
 *   yarn blog ideas add "<title>" [--notes "…"] [--tags a,b] [--locales pt,en] [--prod]
 *
 * Targets the local API (yarn api:dev) by default; --prod uses .env.production.local.
 *
 * Drafts live in drafts/{locale}/{slug}.mdx (gitignored). New images go in drafts/images/
 * and are referenced in the MDX as /static/blog/<file> — the API uploads them on push and
 * rewrites the references to their Blob URLs.
 *
 * `email` writes a newsletter email to drafts/emails/ to paste into Buttondown: one post gives
 * the new-post email, several give a roundup, `welcome` gives the welcome email.
 *
 * `ideas` lists the admin's blog schedule with each theme's id; `ideas add` suggests a theme (a
 * Claude session, for example). `push --plan <id>` links the pushed post to that theme. Suggestions wait in the admin's Cronograma tab to be accepted or discarded.
 */
import { LocaleSchema, type Post, type PostPlan, type PostSummary } from '@andreluizv/shared'
import matter from 'gray-matter'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename, dirname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { findRepoRoot, getClientEnv, isProductionTarget } from '../src/env.js'
import { findStaticBlogPaths } from '../src/posts/mdx-file.js'
import {
  renderNewPostEmail,
  renderRoundupEmail,
  renderWelcomeEmail,
  previewPage,
  type EmailPost,
  type RenderedEmail,
} from './newsletter-email.js'

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    prod: { type: 'boolean', default: false },
    'replace-images': { type: 'boolean', default: false },
    out: { type: 'string' },
    force: { type: 'boolean', default: false },
    yes: { type: 'boolean', default: false },
    locale: { type: 'string' },
    note: { type: 'string' },
    notes: { type: 'string' },
    tags: { type: 'string' },
    locales: { type: 'string' },
    plan: { type: 'string' },
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
  const draft = matter(raw).data.draft === true
  console.log(`${draft ? 'Sending draft' : 'Publishing'} ${locale}/${slug}`)

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

  if (flags.plan) {
    const linked = await api<PostPlan>(`/plans/${encodeURIComponent(flags.plan)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (linked.status !== 200) fail(linked, 'Linking the schedule theme')
    console.log(`✓ linked to the schedule theme: ${linked.body.title}`)
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

// Emails always link to the live site, whichever API the posts came from
const livePostUrl = (locale: string, slug: string): string =>
  `${siteUrl}${locale === 'en' ? '' : `/${locale}`}/blog/${slug}`

async function fetchEmailPost(target: string): Promise<EmailPost> {
  const { locale, slug } = parseTarget(target)
  const result = await api<Post>(`/posts/${locale}/${slug}`)
  if (result.status !== 200) fail(result, `Fetch of ${target}`)
  return { post: result.body, url: livePostUrl(locale, slug) }
}

async function saveEmail(name: string, email: RenderedEmail): Promise<void> {
  const out = join(draftsDir, 'emails', `${name}.html`)
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, email.html)
  // A full page (charset, Space Grotesk) to open in a browser before pasting
  const preview = out.replace(/\.html$/, '.preview.html')
  await writeFile(preview, previewPage(email))
  console.log(`✓ ${out}`)
  console.log(`  subject: ${email.subject}`)
  console.log(`  preview: ${preview}`)
  console.log('  Paste the file into a Buttondown email in Markdown mode, then check the preview.')
}

async function email(): Promise<void> {
  const targets = positionals.slice(1)
  if (!targets.length) {
    throw new CliError(
      'Usage: yarn blog email <locale>/<slug> [...] | yarn blog email welcome <locale>'
    )
  }
  announceTarget()

  const [first, second] = targets
  if (first === 'welcome') {
    const locale = second
    if (locale !== 'en' && locale !== 'pt' && locale !== 'es') {
      throw new CliError('Usage: yarn blog email welcome <en|pt|es>')
    }
    const result = await api<PostSummary[]>(`/posts?locale=${locale}`)
    if (result.status !== 200) fail(result, 'List')
    const latest = (result.body as unknown as PostSummary[])
      .slice(0, 3)
      .map((post) => ({ post, url: livePostUrl(post.locale, post.slug) }))
    await saveEmail(`welcome-${locale}`, renderWelcomeEmail(locale, latest, siteUrl))
    return
  }

  const posts = await Promise.all(targets.map(fetchEmailPost))
  const [newest, ...rest] = posts.toSorted((a, b) => b.post.date.localeCompare(a.post.date))
  if (!newest) return
  const { locale, slug } = newest.post
  if (rest.some(({ post }) => post.locale !== locale)) {
    throw new CliError('All posts in one email must share a language')
  }
  if (!rest.length) {
    await saveEmail(`${locale}-${slug}`, renderNewPostEmail(newest, siteUrl, flags.note))
    return
  }
  await saveEmail(`roundup-${locale}`, renderRoundupEmail(locale, [newest, ...rest], siteUrl))
}

const splitList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

async function ideas(subcommand: string | undefined): Promise<void> {
  announceTarget()
  if (subcommand === 'add') {
    const title = positionals[2]
    if (!title) {
      throw new CliError('Usage: yarn blog ideas add "<title>" [--notes "…"] [--tags a,b]')
    }
    const locales = splitList(flags.locales).map((l) => {
      const parsed = LocaleSchema.safeParse(l)
      if (!parsed.success) throw new CliError(`Unknown locale: ${l}`)
      return parsed.data
    })
    const result = await api<PostPlan>('/plans', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title,
        notes: flags.notes ?? null,
        tags: splitList(flags.tags).map((t) => t.toLowerCase().replace(/\s+/g, '-')),
        locales,
        suggested: true,
      }),
    })
    if (result.status !== 201) fail(result, 'Adding the idea')
    console.log(`✓ suggested: ${result.body.title} (accept it in /admin/schedule)`)
    return
  }
  if (subcommand) {
    throw new CliError('Usage: yarn blog ideas [add "<title>" …]')
  }

  const result = await api<PostPlan[]>('/plans')
  if (result.status !== 200) fail(result, 'Listing ideas')
  for (const plan of result.body as unknown as PostPlan[]) {
    const when = plan.plannedDate ?? 'backlog   '
    const mark = plan.suggested ? ' [suggestion]' : ''
    const post = plan.slug ? ` → ${plan.slug}` : ''
    const langs = plan.locales.length ? ` (${plan.locales.join(', ')})` : ''
    console.log(`${when}  ${plan.title}${langs}${post}${mark}  [${plan.id}]`)
  }
}

const commands: Record<string, (arg?: string) => Promise<void>> = {
  push,
  pull,
  delete: remove,
  list,
  email,
  ideas,
}
const [command, arg] = positionals
const run = command ? commands[command] : undefined

if (!run) {
  console.log('Usage: yarn blog <push|pull|delete|list|email|ideas> … (see apps/api/cli/blog.ts)')
  process.exit(1)
}

run(arg).catch((error) => {
  console.error(error instanceof CliError ? `✗ ${error.message}` : error)
  process.exit(1)
})
