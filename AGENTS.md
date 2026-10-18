# André Luiz Vieira — Personal Website & Blog

Multilingual personal portfolio and technical blog at https://andreluizv.dev.br. André is a frontend/backend web developer who writes about React, Next.js, system design, clean code, and developer experience.

This file is the single source of project context for every AI tool (Claude Code, GitHub Copilot, others). Keep it current; tool-specific notes go in `CLAUDE.md` or `.github/agents/`.

## Tech stack

| Layer           | Technology                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Site            | Next.js 15 (App Router, RSC by default), React 19                                                                      |
| Content         | Blog posts: the content API, read through `lib/content`. Authors, CV and brag document: Contentlayer2 (MDX in `data/`) |
| Content API     | Fastify 5 + Drizzle + Neon Postgres + Vercel Blob (`apps/api`)                                                         |
| Shared contract | Zod schemas in `packages/shared`                                                                                       |
| Styling         | Tailwind CSS v4                                                                                                        |
| Language        | TypeScript (strict)                                                                                                    |
| i18n            | i18next — `en`, `pt`, `es`; routes under `app/[locale]/`                                                               |
| Package manager | Yarn 4.x workspaces (use `yarn`, never `npm`)                                                                          |
| Node            | >=22.0.0                                                                                                               |
| Hosting         | Vercel — two projects from this repo (see below)                                                                       |

## Commands

```bash
yarn dev          # site dev server (localhost:3000), reads posts from CONTENT_API_URL (default: local API)
yarn build        # production build — needs a reachable CONTENT_API_URL
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
DB_TARGET=production yarn workspace @andreluizv/api db:migrate   # same, against PRODUCTION

# Publishing (talks to the API over HTTP; local API by default, --prod for production)
yarn blog push drafts/pt/my-post.mdx [--prod] [--replace-images]      # create/update, uploads new images
yarn blog pull pt/my-post [--prod] [--out dir] [--force]               # download into drafts/ to edit
yarn blog delete pt/my-post [--prod] --yes
yarn blog list [--locale pt] [--prod]
yarn blog ideas [--prod]                                               # the admin's post schedule
yarn blog ideas add "Title" [--notes "…"] [--tags a,b] [--locales pt,en] [--prod]   # suggest a theme (shows up in /admin/schedule to accept)
yarn blog email pt/my-post [--note "…"] [--prod]                     # newsletter email for a post (several targets → roundup)
yarn blog email welcome pt [--prod]                                    # welcome email with the latest posts
```

CI (`.github/workflows/ci.yml`) runs lint, both typechecks and the API tests on every PR.

## Repository structure

```
app/[locale]/              # all pages under the locale param
  layout.tsx               # root layout — analytics, cookie consent, theme
  seo.tsx                  # genPageMetadata() — used on every page
  sitemap.ts               # sitemap (reads routes from lib/content)
  blog/[...slug]/page.tsx  # post renderer
app/admin/                 # writing panel (own root layout, Sign in with Vercel) — see "Admin panel"
app/api/admin/auth/        # Sign in with Vercel: login (PKCE) and callback
lib/admin/                 # admin-only server code: session, content API client (with write key), preview
lib/content/               # ONLY entry point for blog posts and tag counts
  index.ts                 # public functions + types
  api.ts                   # content API client, fetches tagged for ISR
lib/mdx/plugins.ts         # remark/rehype pipeline shared by Contentlayer (authors, CV) and API posts
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
  authors/  cvs/  bragDocument/   # Contentlayer documents (blog posts live in the API)
  siteMetadata.js          # analytics, comments, newsletter, social links
drafts/                    # gitignored: post drafts ({locale}/{slug}.mdx) and new images (images/)
apps/api/                  # content API (Fastify)
  src/server.ts            # Vercel entrypoint — must import fastify
  src/create-app.ts        # routes + error handling
  src/db/schema.ts         # Drizzle schema (posts, assets, post_plans)
  scripts/import-mdx.ts    # MDX → database import
  drizzle/                 # SQL migrations
packages/shared/           # Zod contract (Post, PostSummary, TagCounts…)
next.config.js             # CSP headers, image domains
contentlayer.config.ts     # document types: Blog, Authors, Curriculum, BragDocument
```

## Code conventions

- Pages, layouts and routes read posts only through `lib/content` — never call the content API directly.
- Any change to the remark/rehype pipeline goes in `lib/mdx/plugins.ts`, so Contentlayer and API posts keep rendering the same HTML.
- New components go in `components/`: TypeScript, no default props, explicit return types on exported functions.
- Tailwind only — no CSS-in-JS, no inline `style` props.
- Never hardcode user-visible strings; use `useTranslation` (translations in `app/[locale]/i18n/`).
- Any new external script domain must be added to the CSP in `next.config.js`.
- Google Analytics loads via `next/script strategy="afterInteractive"`, only in production and only after cookie consent (`components/ConsentAnalytics.tsx`); custom events go through `trackEvent` (`components/util/analytics.ts`).
- Vercel Web Analytics and Speed Insights (`components/VercelInsights.tsx`) are cookieless and load for every visitor; they keep only `utm_*` query params. The middleware matcher must keep excluding `_vercel`.
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
- `/plans` (the admin's post schedule) is private, every route needs the key: `GET /plans`, `GET /plans/:id`, `POST /plans` (only `title` required), `PATCH /plans/:id` (fields sent change), `DELETE /plans/:id`. Plans never show on the site, so they don't call the revalidation webhook.
- `PUT` validates frontmatter (the shared parser in `src/posts/mdx-file.ts`), rewrites known `/static/blog/*` images to Blob URLs, answers 422 with `missingAssets` for unknown ones, and 422 with `mdxError` (body line:column) when the MDX doesn't compile. Every write calls the site's revalidation webhook; a failed revalidation is reported, never undone.

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

| Variable              | Where           | Purpose                                                                       |
| --------------------- | --------------- | ----------------------------------------------------------------------------- |
| `CONTENT_API_URL`     | site            | API base URL (default `http://localhost:4000`)                                |
| `REVALIDATE_SECRET`   | site and API    | shared secret for `POST /api/revalidate`                                      |
| `SITE_REVALIDATE_URL` | API             | e.g. `https://www.andreluizv.dev.br/api/revalidate`; called after every write |
| `CONTENT_API_KEY`     | site (dev only) | lets `yarn dev` show drafts from the API; never used in production builds     |

### Admin panel (site)

| Variable                   | Purpose                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `VERCEL_APP_CLIENT_ID`     | Sign in with Vercel app (team Settings → Apps → `andreluizv-admin`)                               |
| `VERCEL_APP_CLIENT_SECRET` | its client secret (`client_secret_post`)                                                          |
| `ADMIN_SESSION_SECRET`     | HS256 key for the admin session cookie, ≥32 chars (`openssl rand -hex 32`)                        |
| `ADMIN_VERCEL_USER_IDS`    | comma-separated Vercel user ids (ID token `sub`) allowed in; the login page shows yours           |
| `ADMIN_CONTENT_API_KEY`    | content API write key, read only by `lib/admin`; in `yarn dev` it falls back to `CONTENT_API_KEY` |

API data is cached with `revalidate: 3600` and tag `posts`. Content changes show up immediately after the webhook runs, or within an hour without it.

## Admin panel

`/admin` is a private writing tool with tabs (`components/admin/AdminTabs.tsx`):

- **Posts** (`/admin`): post list with per-locale status, frontmatter form, MDX editor and a live preview rendered with the real layouts (`lib/admin/preview.tsx`, same `compileMdx` as the post page).
- **Cronograma** (`/admin/schedule`): themes stored in the API's `post_plans`. Undated ideas sit in the backlog; dated ones are grouped by month. Status is derived, never stored (`lib/admin/schedule.ts`): 💡 idea → 📅 scheduled (has a date) → ✏️ draft / ✅ published (from the linked post, matched by slug). "+ pt" opens `/admin/new/pt?plan=<id>`, prefilled from the plan, and the first save links the plan to the post's slug. `yarn blog ideas add` creates `suggested` plans that wait in the Sugestões column to be accepted or discarded.

- Security: the Vercel app only lets team members sign in; the callback verifies the ID token (JWKS, `iss`, `aud`, `nonce`) and requires `sub` in `ADMIN_VERCEL_USER_IDS`; the admin then has its own signed cookie (8h) and keeps no Vercel tokens. **Every admin page and server action calls `requireAdmin()`** — server actions are public POST endpoints, the middleware doesn't run on `/admin` at all.
- The content API keeps one copy per post, so a published post's edits stay in the browser (localStorage) until "Atualizar publicado". Drafts and new posts are saved to the API with `draft: true`.
- `/admin` is outside `[locale]` and has its own root layout; the middleware matcher skips it, robots.txt disallows it, and `next.config.js` sends `X-Frame-Options: DENY` and `no-store` for it.
- Images: paste or drop into the MDX editor, or use the cover field. Everything is resized and re-encoded to WebP in the browser (`lib/admin/image-client.ts`) before `uploadImageAction` sends it to `POST /assets`; the gallery reads `GET /assets`. Server actions accept up to 5 MB (`experimental.serverActions.bodySizeLimit`), the API up to 4 MB.
- Covers follow one layout (`lib/admin/cover-canvas.ts`, 1600×800): navy background, `▎BLOG POST` label, title with the first words in coral, illustration on the right. **The title is drawn by the canvas, never by an AI** (AI-written titles had typos). The illustration is made outside the admin, for free: the studio copies a fixed prompt (`lib/admin/cover-prompt.ts`) and offers the style reference (`public/static/admin/cover-style-reference.jpg`) to use in any image tool; the result is pasted or uploaded back. There is deliberately no paid image API.
- Admin UI strings are Portuguese and inline: it is a single-user tool, so it doesn't go through i18next.

## Newsletter (Buttondown)

- Free plan: no custom template, CSS, welcome/confirmation editing, RSS-to-email or tags (tags are a paid add-on). Emails are sent by hand.
- `app/api/newsletter/route.ts` subscribes with the site language as a tag (`pt`, `en`, `es`); if Buttondown refuses the tag (403, plan without tags), it subscribes without it. Needs `BUTTONDOWN_API_KEY`.
- `yarn blog email` (`apps/api/cli/newsletter-email.ts`) writes `drafts/emails/<name>.html` in the site's look (navy header, coral, Space Grotesk, inline styles and tables for email clients) plus a `.preview.html` to open in a browser. Paste the `.html` into a Buttondown email in Markdown mode. Use `--prod` so the posts come from production; links always point to the live site.
- `{{ unsubscribe_url }}` in the footer is filled by Buttondown.

## Deploy (Vercel)

| Project                  | Root directory | Production URL                            |
| ------------------------ | -------------- | ----------------------------------------- |
| `andreluizv-website`     | `.`            | https://andreluizv.dev.br                 |
| `andreluizv-content-api` | `apps/api`     | https://andreluizv-content-api.vercel.app |

Every merge to `main` deploys to production — but each project only builds when its own files changed (`scripts/vercel-ignore-build.sh`, wired as `ignoreCommand` in both `vercel.json` files). Preview deployments are protected by Vercel Authentication — use `vercel curl <url>` to reach them.

Versioning: every push to `main` runs `.github/workflows/release.yml`, which bumps `package.json` (`feat:` → minor, `feat!:`/`BREAKING CHANGE` → major, anything else → patch), commits `chore(release): vX.Y.Z` and tags it. The footer shows that version (`NEXT_PUBLIC_APP_VERSION`, set in `next.config.js`). The site's production deploy skips the merge commit and builds the release commit; the API skips release commits that only change the version. If the release workflow fails, the site doesn't deploy that merge — re-run the workflow from the Actions tab. Never bump `package.json` by hand.

Known pitfalls (each one cost real debugging time):

- **The repo is linked at the repo level** (`.vercel/repo.json`). `vercel link` inside `apps/api` fails silently and commands keep targeting the site project. Always pass `--project andreluizv-content-api` to `vercel env`, `vercel logs` and similar commands for the API.
- **Keep both `vercel.json` files in sync.** The API project once ran the root file's `buildCommand: yarn build`, so `apps/api` has its own `vercel.json` and a `build` script (typecheck); the shared ignore script works whichever file Vercel reads.
- **Vercel picks the API entrypoint** as the first of `src/app|index|server.ts` that imports `fastify`. Keep `fastify` imported in `src/server.ts`; don't add `src/app.ts` or `src/index.ts`.
- **Never `await app.listen()` at module top level** in the API. Vercel intercepts `listen()`, the promise never resolves, and every request hangs until it times out with no logs.
- **Env vars are snapshotted at deploy time.** After adding or changing one, redeploy. The ignore script always builds a redeploy of the same commit — a git diff can't see env changes.
- **`uglify-js` must stay in `serverExternalPackages`** (next.config.js). It comes with `rehype-preset-minify` and reads its own source files at import time, which fails once webpack bundles it (`EBADF` while collecting page data).
- **Sign in with Vercel callback URLs must be added without a project selected.** With `andreluizv-website` chosen in the dropdown, the entry only matches the project's deployment domains, so `https://www.andreluizv.dev.br/api/admin/auth/callback` and `localhost` failed with "The app redirect URL is invalid". Add them as plain URLs (team Settings → Apps → `andreluizv-admin`).
- **`.gitignore` ignores `*.xml`**, which also matches route folders like `app/feed.xml/`. The `!app/**/*.xml/` exception keeps them tracked — check `git status` when adding XML routes.
- **ESLint runs site and API in separate processes** — together they exceed Node's default heap (Drizzle types are heavy).

## Git workflow

- Branch from `main`: `feat/`, `fix/`, `perf/`, `chore/`, `post/`.
- Before opening a PR: `yarn lint:check`, both typechecks, `yarn api:test`; `yarn build` when the site changed.
- Commit messages: imperative, lowercase, no period — `feat: add google adsense banner`.
- Never commit `.env*` files or secrets.

## Blog posts

### Writing and publishing

Posts live in the content API, not in this repo. The main tool is the **admin panel** (`/admin`, see "Admin panel"):

1. Write in the editor (or start from a Claude draft, below) and check the live preview.
2. Paste or drop images into the text; they are converted to WebP and uploaded.
3. **✨ Criar capa**: describe the illustration, copy the prompt, generate it in any free image tool with the style reference attached, paste it back. The panel draws the title and layout.
4. **Salvar rascunho**, then **Publicar**.

Drafts written with Claude (`new-post`, `translate-post`) go to `drafts/{lang}/{slug}.mdx` (gitignored) with `draft: true`. Send one to the panel with `! yarn blog push drafts/{lang}/{slug}.mdx --prod`: it shows up in `/admin` as a draft, where the cover and images are added and it gets published. `yarn blog pull/push/delete/list` keep working for anything the panel doesn't cover.

### Frontmatter

```yaml
---
title: 'Post title'
date: 'YYYY-MM-DD'
language: en # en | pt | es
tags: ['tag-1', 'tag-2']
images: [] # the cover, set in the panel
authors: ['andrevieira']
draft: true # until published from the panel
layout: PostBanner # PostBanner | PostLayout | PostSimple
summary: 'One sentence description for previews and SEO.'
---
```

- `layout: PostBanner` is the default.
- `draft: true` hides the post in production.
- Slug = URL (kebab-case): `my-post-title` → `/en/blog/my-post-title`. Translations share the slug.
- Leave out `canonicalUrl`: the post page builds the right one per locale. Set it only for posts first published elsewhere.
- Covers are 2:1 (1600×800) and carry the title, so each translation gets its own cover from the panel's studio.
- Images: paste them in the panel. With the CLI, files in `drafts/images/` referenced as `/static/blog/<file>` are uploaded by `yarn blog push`.

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
