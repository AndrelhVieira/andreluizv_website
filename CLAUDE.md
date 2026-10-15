# André Luiz Vieira — Personal Website & Blog

## Project overview

Personal portfolio and multilingual technical blog. André is a frontend/backend web developer who writes about React, Next.js, system design, clean code, and developer experience.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Content | Contentlayer2 (MDX) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript (strict) |
| i18n | i18next (en, pt, es) |
| Package manager | Yarn 4.x |
| Node | >=22.0.0 |

## Running the project

```bash
yarn dev      # dev server (localhost:3000)
yarn build    # production build
yarn lint     # lint all TS/JS files
yarn format   # format with prettier

# Content API (apps/api)
yarn api:dev                                        # Fastify on localhost:4000
yarn api:test                                       # vitest
yarn workspace @andreluizv/api db:generate          # new migration from src/db/schema.ts
yarn workspace @andreluizv/api db:migrate           # apply migrations
yarn workspace @andreluizv/api import:mdx           # upsert data/blog/**/*.mdx + upload images to Blob
DB_TARGET=production yarn workspace @andreluizv/api db:migrate   # same commands against the production database
```

## Monorepo and environment

- Yarn workspaces: the site stays at the repo root; `apps/api` (Fastify + Drizzle + Neon) and `packages/shared` (Zod contract shared by API and site)
- `.env.local` is owned by `vercel env pull` and gets overwritten — never edit it by hand
- `.env.development.local` holds local overrides: Neon `dev` branch URLs and `CONTENT_API_KEY`
- Blob uses OIDC (`BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`); there is no `BLOB_READ_WRITE_TOKEN`. Re-run `vercel env pull` if uploads fail with auth errors (token expires ~12h)
- Drizzle is limited to the `public` schema; never touch `neon_auth`
- `packages/shared` compiles to `dist/` on `yarn install` (postinstall). After editing it, run `yarn workspace @andreluizv/shared build` (or `dev` for watch mode)
- API code is Node ESM: relative imports need the `.js` extension (`./mappers.js`)
- Vercel detects the API entrypoint as the first of `src/app|index|server.ts` that imports `fastify` — keep `fastify` imported in `src/server.ts` and don't add `src/app.ts` or `src/index.ts`

## Repository structure

```
app/[locale]/           # App router — all pages under locale param
  blog/                 # Blog list and individual post pages
  about/                # About + author profiles
  contact/              # Contact form
  projects/             # Projects showcase
  skills/               # Tech stack showcase
  curriculum/           # CV/Resume
  freelancing/          # Freelance services
components/             # Shared React components
layouts/                # MDX layout wrappers (PostBanner, PostLayout, PostSimple)
data/
  blog/
    en/                 # English posts (.mdx)
    pt/                 # Portuguese posts (.mdx)
    es/                 # Spanish posts (.mdx)
  authors/              # Author profiles per language
  siteMetadata.js       # Site-wide config (analytics, comments, social)
public/static/blog/     # Blog post images (.webp, .png)
```

## Blog post frontmatter schema

```yaml
---
title: "Post title"
date: 'YYYY-MM-DD'
language: en            # en | pt | es
tags: ['tag-1', 'tag-2']
images: ['/static/blog/post-slug.webp']
authors: ['andrevieira']
draft: false
featured: false
layout: PostBanner      # PostBanner | PostLayout | PostSimple
summary: "One sentence description for previews and SEO."
canonicalUrl: https://andreluizv.dev.br/blog/post-slug
---
```

- `layout: PostBanner` is the default and preferred for most posts
- `draft: true` excludes the post from production builds
- File name = URL slug (kebab-case): `my-post-title.mdx` → `/en/blog/my-post-title`
- Images go in `public/static/blog/` — name them the same as the file slug

## Multilingual conventions

- Each language has its own file in `data/blog/{lang}/`
- English and Portuguese versions of the same post share the same slug filename
- The `language` field in frontmatter is what contentlayer uses for filtering
- Tone differs per language: English = direct + tutorial-style, Portuguese = motivational + warm

## Writing style (important)

André's posts follow a specific voice. When generating posts, match this style:

**Structure pattern (most recent style):**
- Short intro that states the problem, no buildup
- Sections with clear `##` headers
- Use `---` horizontal rules between major sections
- Short sentences and tight paragraphs
- Lists for comparisons, steps, and "do/don't" pairs
- Code blocks with real, runnable examples
- "Common mistakes" section with `❌` / `✅` patterns
- "When to use / when not to use" decision table
- Actionable "What to do next" closing — no generic conclusions

**Voice:**
- First-person when giving opinions: "I prefer...", "In my experience..."
- Direct statements over hedging: "This breaks performance" not "This may potentially affect performance"
- Concrete analogies grounded in real projects
- No AI-sounding filler: avoid "In today's fast-paced world", "It's worth noting", "As we can see", "In conclusion"
- Short sentences in lists, longer sentences in explanations — vary the rhythm

## Contentlayer notes

- `contentlayer.config.ts` defines document types (`Blog`, `Authors`, `Curriculum`)
- After adding new posts, contentlayer regenerates `.contentlayer/generated/` automatically on `yarn dev`
- Tags are counted per-language in the config

## Key component paths

- `lib/content.ts` — single entry point for blog posts and tag counts; never import `allBlogs` or `tag-data.json` directly in pages/layouts
- `components/mdxcomponents/index.tsx` — MDX component registry (custom elements available in posts)
- `layouts/PostBanner.tsx` — most-used post layout
- `app/[locale]/blog/[...slug]/page.tsx` — post page renderer
- `data/siteMetadata.js` — analytics, comments, newsletter, social links

## Custom Claude Code commands

| Command | Purpose |
|---|---|
| `/new-post` | Generate a new blog post in MDX format |
| `/translate-post` | Translate an existing post to another language |
| `/review-post` | Review a post for quality, tone, and formatting |
