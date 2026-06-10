# André Luiz Vieira — Personal Website & Blog

This is a multilingual personal portfolio and technical blog. André writes about React, Next.js, system design, clean code, and developer experience.

## Tech stack

- **Framework:** Next.js 15.5 (App Router, RSC by default)
- **Content:** Contentlayer2 + MDX
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript (strict mode)
- **i18n:** i18next (locales: `en`, `pt`, `es`) — routes live under `app/[locale]/`
- **Package manager:** Yarn 4.x (use `yarn`, never `npm`)
- **Node:** >=22.0.0
- **Deployment:** Vercel (`vercel.json` in root)

## Commands

```bash
yarn dev          # dev server on localhost:3000
yarn build        # production build + postbuild script
yarn lint         # ESLint with auto-fix
yarn lint:check   # ESLint without fix (CI-safe)
yarn format       # Prettier on app/, components/, layouts/
yarn analyze      # Bundle analyzer (ANALYZE=true next build)
```

## Repository structure

```
app/[locale]/           # All pages under locale param (en, pt, es)
  layout.tsx            # Root layout — Analytics, CookieConsent, ThemeProvider
  seo.tsx               # genPageMetadata() helper — used on every page
  sitemap.ts            # Auto-generated sitemap
  blog/[...slug]/       # Blog post renderer
components/             # Shared React components
  CookieConsent.tsx     # Cookie banner (js-cookie, i18n via 'cookies' namespace)
  navigation/           # Header, Footer, MobileNav
  mdxcomponents/        # MDX component registry
layouts/                # MDX layout wrappers (PostBanner, PostLayout, PostSimple)
data/
  blog/en|pt|es/        # Blog posts (.mdx) — filename = URL slug
  siteMetadata.js       # Analytics IDs, social links, feature flags
public/static/blog/     # Post images (.webp preferred)
next.config.js          # CSP headers, image domains, webpack
contentlayer.config.ts  # Document schemas (Blog, Authors, Curriculum)
```

## Key conventions

- All new components go in `components/` — use TypeScript, no default props, explicit return types on public functions.
- Tailwind only for styling — no CSS-in-JS, no inline `style` props.
- Translations live in `app/[locale]/i18n/` — always use the `useTranslation` hook; never hardcode user-visible strings.
- Google Analytics is loaded via `next/script strategy="afterInteractive"` in `app/[locale]/layout.tsx` and only fires in production.
- CSP headers are in `next.config.js` — any new external script domain must be added there.
- Cookie consent state is stored in `js-cookie` under key `cookie_consent` (expires 365 days).
- Blog posts use frontmatter: `title`, `date`, `language`, `tags`, `images`, `authors`, `draft`, `featured`, `layout`, `summary`, `canonicalUrl`.

## Code style

```tsx
// ✅ Preferred: explicit types, no comments on obvious code
export function MyComponent({ locale }: { locale: LocaleTypes }): ReactElement {
  return <div className="flex items-center gap-2">...</div>
}

// ❌ Avoid: vague names, missing types, inline styles
export default function thing({ l }) {
  return <div style={{ display: 'flex' }}>...</div>
}
```

## Git workflow

- Branch from `main` — branch names: `feat/`, `fix/`, `perf/`, `chore/`
- Run `yarn lint:check && yarn build` before committing
- Commit messages: imperative mood, lowercase, no period — e.g. `feat: add google adsense banner`
- Never commit `.env` files or secrets
