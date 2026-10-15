---
name: new-post
description: Write a new blog post for André's site as a ready-to-publish MDX file in data/blog/{lang}/. Use when asked to write, draft or create a blog post or article, in any of en, pt or es.
argument-hint: <topic> [language=en|pt|es] [tags=tag1,tag2]
---

# New Blog Post

Generate a new blog post for André's personal website.

**Arguments:** `$ARGUMENTS` — topic description and optionally: `language=en|pt|es`, `tags=tag1,tag2`

---

## Instructions

Create a complete `.mdx` blog post file. Follow these steps:

### 1. Parse the request

Extract from `$ARGUMENTS`:

- **Topic**: what the post is about
- **Language**: default to `en` unless specified (`pt` or `es`)
- **Tags**: infer from the topic if not provided (use lowercase, hyphen-separated, e.g. `react`, `clean-code`, `nextjs`)

### 2. Determine the file path

- File goes in `data/blog/{language}/`
- File name = kebab-case slug of the title, e.g. `understanding-react-suspense.mdx`
- Image path convention: `/static/blog/{slug}.webp` (André adds images manually)
- Canonical URL: `https://andreluizv.dev.br/{language}/blog/{slug}` (omit `/{language}` prefix for `en`)

### 3. Build the frontmatter

```yaml
---
title: '{title}'
date: '{YYYY-MM-DD}' # today's date
language: { language }
tags: [{ tags }]
images: ['/static/blog/{slug}.webp']
authors: ['andrevieira']
draft: false
featured: false
layout: PostBanner
summary: '{one crisp sentence — describes what the reader will learn, no buzzwords}'
canonicalUrl: https://andreluizv.dev.br/{language}/blog/{slug}
---
```

### 4. Write the post body

Follow the structure below and the "Writing style" section of `AGENTS.md`:

**Structure:**

1. One-paragraph hook — state the problem or question directly, no buildup
2. `##` sections with tight, descriptive headers
3. Use `---` horizontal rules to separate major sections
4. "Common Mistakes" section with `❌` wrong and `✅` correct examples (when relevant)
5. "When to use / When to avoid" section (when relevant)
6. Closing with concrete next steps — no generic "In conclusion" paragraph

**Voice, banned phrases and per-language tone:** follow the "Writing style" section of `AGENTS.md` exactly — it is the single source for these rules.

**Code blocks:**

- Always specify the language: ` ```tsx `, ` ```bash `, ` ```yaml `
- Show complete, working examples — not `// ... rest of the code`
- Add `// ❌ Wrong` and `// ✅ Correct` comments in mistake examples

### 5. Output

Write the complete file to `data/blog/{language}/{slug}.mdx`.

After writing, tell André:

- The file path
- The canonical URL
- Remind André to add an image at `public/static/blog/{slug}.webp` before publishing

### Publishing

Writing the file does **not** publish it — the site reads posts from the content API.

- Images referenced as `/static/blog/<image>` are read from `public/static/blog/` and uploaded automatically on push.
- To check it locally first: `yarn api:dev`, then `yarn blog push data/blog/{language}/{slug}.mdx` and open it with `CONTENT_SOURCE=api yarn dev`.
- To publish, give André this command — never run `--prod` yourself, production writes are his call:

  ```
  ! yarn blog push data/blog/{language}/{slug}.mdx --prod
  ```

  It prints the live URL and refreshes the site cache. If it fails with an MDX error, fix the reported body line and push again.
