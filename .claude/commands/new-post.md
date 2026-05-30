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
title: "{title}"
date: '{YYYY-MM-DD}'   # today's date
language: {language}
tags: [{tags}]
images: ['/static/blog/{slug}.webp']
authors: ['andrevieira']
draft: false
featured: false
layout: PostBanner
summary: "{one crisp sentence — describes what the reader will learn, no buzzwords}"
canonicalUrl: https://andreluizv.dev.br/{language}/blog/{slug}
---
```

### 4. Write the post body

Follow André's writing style exactly:

**Structure:**
1. One-paragraph hook — state the problem or question directly, no buildup
2. `##` sections with tight, descriptive headers
3. Use `---` horizontal rules to separate major sections
4. "Common Mistakes" section with `❌` wrong and `✅` correct examples (when relevant)
5. "When to use / When to avoid" section (when relevant)
6. Closing with concrete next steps — no generic "In conclusion" paragraph

**Voice rules (strictly follow):**
- Write like a developer talking to another developer, not like a textbook
- Short sentences in lists. Longer sentences when reasoning through something.
- Use first-person sparingly but naturally: "I prefer this approach because...", "In my projects..."
- State opinions directly: "This is slow" not "This may potentially have performance implications"
- Use real, runnable code examples — not pseudo-code
- Vary sentence length to keep rhythm; avoid walls of same-length sentences
- Never start a section with "It's worth noting that..." or "As we can see..."
- Never end with "I hope this article was helpful" or any variant

**Banned phrases (never write these):**
- "In today's fast-paced world"
- "In conclusion" / "To summarize"
- "It's worth noting"
- "As we can see"
- "This article will explore"
- "At the end of the day"
- "Game-changer" / "robust" / "seamlessly" / "leverage"
- "Let's dive in"

**Language-specific tone:**
- **English**: Direct, tutorial-focused, opinionated. Use tables for comparisons. Real examples over theory.
- **Portuguese**: Slightly warmer, more personal, can use metaphors. Still direct. End with a call-to-action or reflection.
- **Spanish**: Similar to Portuguese tone — warm but technical.

**Code blocks:**
- Always specify the language: ` ```tsx `, ` ```bash `, ` ```yaml `
- Show complete, working examples — not `// ... rest of the code`
- Add `// ❌ Wrong` and `// ✅ Correct` comments in mistake examples

### 5. Output

Write the complete file to `data/blog/{language}/{slug}.mdx`.

After writing, tell André:
- The file path
- The canonical URL
- Remind him to add an image at `public/static/blog/{slug}.webp`
