---
name: review-post
description: Review an existing blog post MDX file for frontmatter, structure, voice, code quality and SEO, then offer to apply fixes. Use when asked to review, check, proofread or improve a post.
argument-hint: <path to post, e.g. data/blog/en/my-post.mdx>
---

# Review Post

Review a blog post for quality, tone, writing style, and formatting.

**Arguments:** `$ARGUMENTS` — path to the post file, e.g. `data/blog/en/my-post.mdx`

---

## Instructions

Read the file at the path provided in `$ARGUMENTS` and perform a structured review.

### 1. Frontmatter check

Verify:

- [ ] `title` is descriptive and specific (not vague like "A guide to X")
- [ ] `date` is in `YYYY-MM-DD` format
- [ ] `language` matches the file's directory (`en/`, `pt/`, `es/`)
- [ ] `tags` are lowercase, relevant, and not too broad
- [ ] `summary` is one sentence, concrete, no buzzwords
- [ ] `images` path follows convention: `/static/blog/{slug}.webp`
- [ ] `authors` is `['andrevieira']`
- [ ] `layout` is set (default `PostBanner`)
- [ ] `canonicalUrl` matches the slug and language

### 2. Structure check

- Does the post start with a clear hook (not a generic introduction)?
- Are `##` headers descriptive and action-oriented?
- Are `---` dividers used appropriately between major sections?
- Is there a "Common Mistakes" or "What to avoid" section?
- Does the post end with concrete next steps (not a generic conclusion)?
- Is the post between 400–1500 words? (flag if too short or too long)

### 3. Voice & tone check

Flag every phrase from the "Never write" list in the "Writing style" section of `AGENTS.md`, and any tone that doesn't match that section's per-language rules.

Check for:

- [ ] Sentences that hedge unnecessarily ("may potentially", "could possibly")
- [ ] Passive voice overuse
- [ ] Paragraphs longer than 4 sentences (break them up)
- [ ] Repeated sentence structure (monotone rhythm)

### 4. Code quality check (if post has code)

- Are all code blocks language-tagged?
- Are examples complete and runnable (no `// ... rest of code`)?
- Do mistake examples use `// ❌` and `// ✅`?
- Is the code realistic (uses real variable names, not `foo`/`bar` unless for demonstration)?

### 5. SEO check

- Is the `title` under 60 characters?
- Does the `summary` include the main keyword naturally?
- Are there any broken markdown link formats?

### 6. Output format

Report findings as:

**Frontmatter** — pass/fail list with specific fixes
**Structure** — what's missing or off
**Voice issues** — exact quotes from the post that need rewriting, with suggested rewrites
**Code issues** — specific blocks that need fixing
**SEO** — any issues

Then ask: "Want me to apply all fixes and rewrite the flagged sections?"

If yes, apply fixes directly to the file using Edit.
