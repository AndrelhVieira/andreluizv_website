---
name: new-post
description: Write a new blog post for André's site as an MDX draft in drafts/{lang}/ (gitignored), sent to the admin panel with `yarn blog push` to get its cover and be published. Use when asked to write, draft or create a blog post or article, in any of en, pt or es.
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

- File goes in `drafts/{language}/`
- File name = kebab-case slug of the title, e.g. `understanding-react-suspense.mdx`
- No cover and no `canonicalUrl`: the cover is made in the admin panel, and the post page builds the canonical URL

### 3. Build the frontmatter

```yaml
---
title: '{title}'
date: '{YYYY-MM-DD}' # today's date
language: { language }
tags: [{ tags }]
images: []
authors: ['andrevieira']
draft: true
featured: false
layout: PostBanner
summary: '{one crisp sentence — describes what the reader will learn, no buzzwords}'
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

Write the complete file to `drafts/{language}/{slug}.mdx`.

After writing, tell André:

- The file path and the word count
- **A cover illustration subject**: one English sentence describing a visual metaphor for the post (objects and how they relate, no text), e.g. "a React component tree splitting into lazy-loaded chunks". He pastes it into the panel's cover studio.
- Where images would help, as `<!-- image: what it should show -->` comments in the body; he pastes the images in the panel.

### Publishing

Writing the file does **not** publish it — the site reads posts from the content API, and the post is finished in the admin panel.

1. Give André this command to send the draft (it stays hidden, `draft: true`). Never run `--prod` yourself, production writes are his call:

   ```
   ! yarn blog push drafts/{language}/{slug}.mdx --prod
   ```

   If it fails with an MDX error, fix the reported body line and push again.

2. In `https://www.andreluizv.dev.br/admin` the post shows up as ✏️ in that language. There he creates the cover (**✨ Criar capa**, using the subject above), pastes the images, checks the preview and clicks **Publicar**.
