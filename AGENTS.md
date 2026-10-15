# André Luiz Vieira — Personal Website & Blog

Multilingual personal portfolio and technical blog at https://andreluizv.dev.br. André is a frontend/backend web developer who writes about React, Next.js, system design, clean code, and developer experience.

This file is the single source of project context for every AI tool (Claude Code, GitHub Copilot, others). Keep it current; tool-specific notes go in `CLAUDE.md` or `.github/agents/`.

## Tech stack

| Layer           | Technology                                                                               |
| --------------- | ---------------------------------------------------------------------------------------- |
| Site            | Next.js 15 (App Router, RSC by default), React 19                                        |
| Content         | `lib/content` — Contentlayer2 (MDX files) or the content API, picked by `CONTENT_SOURCE` |
| Content API     | Fastify 5 + Drizzle + Neon Postgres + Vercel Blob (`apps/api`)                           |
| Shared contract | Zod schemas in `packages/shared`                                                         |
| Styling         | Tailwind CSS v4                                                                          |
| Language        | TypeScript (strict)                                                                      |
| i18n            | i18next — `en`, `pt`, `es`; routes under `app/[locale]/`                                 |
| Package manager | Yarn 4.x workspaces (use `yarn`, never `npm`)                                            |
| Node            | >=22.0.0                                                                                 |
| Hosting         | Vercel — two projects from this repo (see below)                                         |

## Commands

```bash
yarn dev          # site dev server (localhost:3000)
yarn build        # production build (CONTENT_SOURCE=api CONTENT_API_URL=... to build from the API)
yarn lint         # ESLint with auto-fix (site and API in separate runs)
yarn lint:check   # ESLint without fix
yarn format       # Prettier on app/, components/, layouts/
yarn analyze      # bundle analyzer

# Content API (apps/api)
yarn api:dev                                        # Fastify on localhost:4000
yarn api:test                                       # vitest
yarn workspace @andreluizv/api typecheck
yarn workspace @andreluizv/api db:generate          # new migration from src/db/schema.ts
yarn workspace @andreluizv/api db:migrate           # apply migrations (dev database)
yarn workspace @andreluizv/api import:mdx           # upsert data/blog/**/*.mdx + upload images to Blob
DB_TARGET=production yarn workspace @andreluizv/api db:migrate   # same, against PRODUCTION

# Publishing (talks to the API over HTTP; local API by default, --prod for production)
yarn blog push data/blog/pt/my-post.mdx [--prod] [--replace-images]   # create/update, uploads new images
yarn blog pull pt/my-post [--prod] [--out dir] [--force]               # download a post as MDX
yarn blog delete pt/my-post [--prod] --yes
yarn blog list [--locale pt] [--prod]
```

CI (`.github/workflows/ci.yml`) runs lint, both typechecks and the API tests on every PR.

## Repository structure

```
app/[locale]/              # all pages under the locale param
  layout.tsx               # root layout — analytics, cookie consent, theme
  seo.tsx                  # genPageMetadata() — used on every page
  sitemap.ts               # sitemap (reads routes from lib/content)
  blog/[...slug]/page.tsx  # post renderer
lib/content/               # ONLY entry point for blog posts and tag counts
  index.ts                 # picks the source from CONTENT_SOURCE
  contentlayer.ts          # source: data/blog MDX compiled by Contentlayer
  api.ts                   # source: content API, fetches tagged for ISR
lib/mdx/plugins.ts         # remark/rehype pipeline shared by Contentlayer and the API source
lib/mdx/compile.ts         # runtime MDX compile for API posts (output runs in pliny's MDXLayoutRenderer)
lib/rss.ts                 # RSS builder used by the feed.xml routes
app/feed.xml/, app/[locale]/feed.xml/   # RSS route handlers (ISR)
app/search.json/           # kbar search documents (ISR)
app/api/revalidate/        # webhook: POST with x-revalidate-secret → revalidateTag('posts')
scripts/vercel-ignore-build.sh  # Ignored Build Step for both Vercel projects
components/                # shared React components
  mdxcomponents/index.tsx  # MDX component registry
layouts/                   # PostBanner (default), PostLayout, PostSimple, ListLayout
data/
  blog/en|pt|es/           # posts (.mdx) — filename = URL slug
  authors/  cvs/  bragDocument/
  siteMetadata.js          # analytics, comments, newsletter, social links
public/static/blog/        # post images (.webp preferred)
apps/api/                  # content API (Fastify)
  src/server.ts            # Vercel entrypoint — must import fastify
  src/create-app.ts        # routes + error handling
  src/db/schema.ts         # Drizzle schema (posts, assets)
  scripts/import-mdx.ts    # MDX → database import
  drizzle/                 # SQL migrations
packages/shared/           # Zod contract (Post, PostSummary, TagCounts…)
next.config.js             # CSP headers, image domains
contentlayer.config.ts     # document types: Blog, Authors, Curriculum, BragDocument
```

## Code conventions

- Pages, layouts and routes read posts only through `lib/content` — never import `allBlogs`, `tag-data.json` or call the API directly. Both sources return the Contentlayer `Blog` shape.
- Any change to the remark/rehype pipeline goes in `lib/mdx/plugins.ts`, so Contentlayer and API posts keep rendering the same HTML.
- New components go in `components/`: TypeScript, no default props, explicit return types on exported functions.
- Tailwind only — no CSS-in-JS, no inline `style` props.
- Never hardcode user-visible strings; use `useTranslation` (translations in `app/[locale]/i18n/`).
- Any new external script domain must be added to the CSP in `next.config.js`.
- Analytics loads via `next/script strategy="afterInteractive"` and only fires in production.
- Cookie consent lives in `js-cookie` under `cookie_consent` (365 days).

```tsx
// ✅ explicit types, no comments on obvious code
export function MyComponent({ locale }: { locale: LocaleTypes }): ReactElement {
  return <div className="flex items-center gap-2">...</div>
}

// ❌ vague names, missing types, inline styles
export default function thing({ l }) {
  return <div style={{ display: 'flex' }}>...</div>
}
```

### API (apps/api)

- Read routes are public (`GET /posts`, `/posts/:locale/:slug`, `/posts/routes`, `/tags`); drafts need the API key.
- Write routes need `x-api-key`: `PUT /posts/:locale/:slug` (body `{ mdx }`, the full file with frontmatter), `DELETE /posts/:locale/:slug`, `POST /assets` (multipart: `sourcePath` field, then `file`; max 4 MB).
- `PUT` validates frontmatter (same parser as `import:mdx`), rewrites known `/static/blog/*` images to Blob URLs, answers 422 with `missingAssets` for unknown ones, and 422 with `mdxError` (body line:column) when the MDX doesn't compile. Every write calls the site's revalidation webhook; a failed revalidation is reported, never undone.

- Node ESM: relative imports need the `.js` extension (`./mappers.js`).
- Routes depend on the `PostRepository` interface; tests use an in-memory implementation with `app.inject()`.
- Drizzle is limited to the `public` schema — never touch `neon_auth`.
- `packages/shared` compiles to `dist/` on `yarn install` (postinstall). After editing it: `yarn workspace @andreluizv/shared build` (or `dev` to watch).

## Environment and secrets

- `.env.local` is owned by `vercel env pull` and is overwritten on every pull — never edit it by hand.
- `.env.development.local` holds local overrides: Neon `dev` branch URLs and `CONTENT_API_KEY`.
- `.env.production.local` holds production targets for scripts and `yarn blog --prod`: production DB URLs, `CONTENT_API_URL`, the production `CONTENT_API_KEY`, `SITE_REVALIDATE_URL`, `REVALIDATE_SECRET`. Written by hand, never touched by `vercel env pull`. `DB_TARGET=production` (or `--prod`) loads it first.
- Neon `dev` branch = local development. Neon `main` branch = production; scripts reach it only with `DB_TARGET=production` / `--prod`.
- Blob uses OIDC (`BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`); there is no `BLOB_READ_WRITE_TOKEN`. If uploads fail with auth errors, re-run `vercel env pull .env.local --yes` (the token expires after ~12h).
- Never print secret values. Check that a variable exists, not what it contains.

### Content source (site)

| Variable              | Where           | Purpose                                                                             |
| --------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `CONTENT_SOURCE`      | site            | `api` reads posts from the content API; anything else uses Contentlayer             |
| `CONTENT_API_URL`     | site            | API base URL (default `http://localhost:4000`)                                      |
| `REVALIDATE_SECRET`   | site and API    | shared secret for `POST /api/revalidate`                                            |
| `SITE_REVALIDATE_URL` | API / scripts   | e.g. `https://www.andreluizv.dev.br/api/revalidate`; `import:mdx` calls it when set |
| `CONTENT_API_KEY`     | site (dev only) | lets `yarn dev` show drafts from the API; never used in production builds           |

With `CONTENT_SOURCE=api`, API data is cached with `revalidate: 3600` and tag `posts`. Content changes show up immediately after the webhook runs, or within an hour without it.

## Deploy (Vercel)

| Project                  | Root directory | Production URL                            |
| ------------------------ | -------------- | ----------------------------------------- |
| `andreluizv-website`     | `.`            | https://andreluizv.dev.br                 |
| `andreluizv-content-api` | `apps/api`     | https://andreluizv-content-api.vercel.app |

Every merge to `main` deploys to production — but each project only builds when its own files changed (`scripts/vercel-ignore-build.sh`, wired as `ignoreCommand` in both `vercel.json` files). Preview deployments are protected by Vercel Authentication — use `vercel curl <url>` to reach them.

Known pitfalls (each one cost real debugging time):

- **The repo is linked at the repo level** (`.vercel/repo.json`). `vercel link` inside `apps/api` fails silently and commands keep targeting the site project. Always pass `--project andreluizv-content-api` to `vercel env`, `vercel logs` and similar commands for the API.
- **Keep both `vercel.json` files in sync.** The API project once ran the root file's `buildCommand: yarn build`, so `apps/api` has its own `vercel.json` and a `build` script (typecheck); the shared ignore script works whichever file Vercel reads.
- **Vercel picks the API entrypoint** as the first of `src/app|index|server.ts` that imports `fastify`. Keep `fastify` imported in `src/server.ts`; don't add `src/app.ts` or `src/index.ts`.
- **Never `await app.listen()` at module top level** in the API. Vercel intercepts `listen()`, the promise never resolves, and every request hangs until it times out with no logs.
- **Env vars are snapshotted at deploy time.** After adding or changing one, redeploy. The ignore script always builds a redeploy of the same commit — a git diff can't see env changes.
- **`uglify-js` must stay in `serverExternalPackages`** (next.config.js). It comes with `rehype-preset-minify` and reads its own source files at import time, which fails once webpack bundles it (`EBADF` while collecting page data).
- **`.gitignore` ignores `*.xml`**, which also matches route folders like `app/feed.xml/`. The `!app/**/*.xml/` exception keeps them tracked — check `git status` when adding XML routes.
- **ESLint runs site and API in separate processes** — together they exceed Node's default heap (Drizzle types are heavy).

## Git workflow

- Branch from `main`: `feat/`, `fix/`, `perf/`, `chore/`, `post/`.
- Before opening a PR: `yarn lint:check`, both typechecks, `yarn api:test`; `yarn build` when the site changed.
- Commit messages: imperative, lowercase, no period — `feat: add google adsense banner`.
- Never commit `.env*` files or secrets.

## Blog posts

### Frontmatter

```yaml
---
title: 'Post title'
date: 'YYYY-MM-DD'
language: en # en | pt | es
tags: ['tag-1', 'tag-2']
images: ['/static/blog/post-slug.webp']
authors: ['andrevieira']
draft: false
featured: false
layout: PostBanner # PostBanner | PostLayout | PostSimple
summary: 'One sentence description for previews and SEO.'
canonicalUrl: https://andreluizv.dev.br/blog/post-slug
---
```

- `layout: PostBanner` is the default.
- `draft: true` hides the post in production.
- File name = URL slug (kebab-case): `my-post-title.mdx` → `/en/blog/my-post-title`.
- Images go in `public/static/blog/`, named after the slug.
- Each language has its own file in `data/blog/{lang}/`; translations share the same slug.

> The site reads posts from the content API. Writing a file here does **not** publish it: run `yarn blog push <file> --prod`. Images in `public/static/blog/` referenced by the post are uploaded on push. Use `yarn blog pull` to edit a post that only exists in the API.

### Writing style

Posts must sound like a developer talking to another developer — never like textbook content or generic AI output.

**Structure**

1. Short hook that states the problem directly, no build-up
2. `##` sections with tight, descriptive headers
3. `---` horizontal rules between major sections
4. Short sentences in lists; longer ones when reasoning
5. Real, runnable code — `// ❌ Wrong` / `// ✅ Correct` in code blocks
6. A "Common mistakes" section with `❌` / `✅` pairs
7. A "When to use / when to avoid" decision guide
8. An actionable closing (next steps) — never a generic conclusion

**Voice**

- First person for opinions: "I prefer…", "In my experience…"
- Direct statements: "This breaks performance", not "this may potentially affect performance"
- Concrete analogies from real projects
- Vary sentence length for rhythm

**Never write**: "In today's fast-paced world", "In conclusion", "To summarize", "It's worth noting", "As we can see", "This article will explore", "At the end of the day", "game-changer", "robust", "seamlessly", "leverage", "Let's dive in", "I hope this was helpful".

**Per-language tone**

- English: direct, tutorial-focused, opinionated; tables for comparisons
- Portuguese: warmer and more personal; metaphors welcome; ends with a call to action or reflection
- Spanish: like Portuguese — warm but technical

**Length**: 400–1500 words. Flag anything outside that range.
