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
- **Schedule theme**: with no topic, list the Cronograma with `yarn blog ideas --prod` (read-only) and offer the dated themes and suggestions. When the post comes from a theme, keep its id (the `[…]` at the end of the line) for the push.

### 2. Determine the file path

- File goes in `drafts/{language}/`
- File name = kebab-case slug of the title **in English**, even for a pt or es post, e.g. `understanding-react-suspense.mdx`: translations share the slug
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
- Where images would help, as `{/* image: what it should show */}` comments in the body (MDX comments: an HTML `<!-- -->` comment fails to compile); he pastes the images in the panel.

### 6. Review before sending

Run the checks of the `review-post` skill (sections 1–5 of `.claude/skills/review-post/SKILL.md`) on the draft yourself. Fix what is objective right away (banned phrases, untagged code blocks, a title over 60 characters, a summary that isn't one sentence, length outside 400–1500 words). List anything that is a matter of taste for André instead of changing it.

### Publishing

Writing the file does **not** publish it — the site reads posts from the content API, and the post is finished in the admin panel. André asked (2026-10-22) for every new post to be sent to the panel automatically, as a hidden draft, as soon as it is written:

1. Check the post is safe to push. All three must hold, otherwise stop and ask him:
   - the frontmatter has `draft: true`;
   - the MDX compiles (a quick `@mdx-js/mdx` `compile` of the body is enough);
   - the slug is new in that language: `yarn blog list --locale {language} --prod` doesn't list it (pushing over an existing post would replace it, published or not).

2. Push it to production as a draft:

   ```bash
   yarn blog push drafts/{language}/{slug}.mdx --prod [--plan <theme id>]
   ```

   Pass `--plan` when the post came from a Cronograma theme: it links the theme to the post, so its status follows the post.

   If it fails with an MDX error, fix the reported body line and push again. Never push a file with `draft: false`, never use `--replace-images`, and never push again after André starts editing in the panel (the file would overwrite his edits).

3. Confirm it stayed hidden: `curl -s -o /dev/null -w '%{http_code}' https://andreluizv-content-api.vercel.app/posts/{language}/{slug}` answers 404.

4. Tell André it is in `https://www.andreluizv.dev.br/admin` as ✏️ in that language. There he creates the cover (**✨ Criar capa**, paste the illustration inside the studio), pastes the images, checks the preview and clicks **Publicar**. If the post didn't come from a Cronograma theme but one matches it, he can link it there (edit the theme → "Post ligado (slug)").

5. After he publishes, offer the next steps: the translations with `translate-post` (same slug), and the newsletter email with `yarn blog email {language}/{slug} --prod` (read-only: it only writes `drafts/emails/`, he pastes it into Buttondown).
