# Translate Post

Translate an existing blog post to another language.

**Arguments:** `$ARGUMENTS` — source file path and target language, e.g. `data/blog/en/react-hooks.mdx to pt`

---

## Instructions

### 1. Read the source file

Read the file provided in `$ARGUMENTS`. Extract:
- Current language from frontmatter `language` field
- Slug (filename without `.mdx`)
- All frontmatter fields
- Full post body

### 2. Determine target path

- Target file: `data/blog/{target_language}/{slug}.mdx`
- If the target file already exists, read it first and ask whether to overwrite

### 3. Translate the frontmatter

Translate these fields:
- `title` — translate naturally, not word-for-word; keep the same punch
- `summary` — translate; keep it one sentence
- `tags` — translate tags to the target language conventions:
  - English tags: lowercase, hyphen-separated, English words
  - Portuguese tags: lowercase, Portuguese words, e.g. `desenvolvimento`, `qualidade-de-código`
  - Spanish tags: lowercase, Spanish words

Update:
- `language` → target language code
- `canonicalUrl` → update locale prefix if pt/es: `https://andreluizv.dev.br/{lang}/blog/{slug}`
  - For English, no locale prefix: `https://andreluizv.dev.br/blog/{slug}`

Keep unchanged:
- `date`, `images`, `authors`, `draft`, `featured`, `layout`

### 4. Translate the post body

**Translation rules:**

- Translate prose naturally — rewrite phrases to sound native, not like translated text
- Code blocks: translate inline comments only; keep code and variable names in English
- Headers (`##`, `###`): translate the heading text
- Preserve all markdown formatting: `---` dividers, tables, code blocks, lists
- Keep `❌` and `✅` symbols
- Preserve link text but don't change URLs

**Tone adaptation by target language:**

**→ Portuguese (pt):**
- Warmer, more personal tone than English
- Can add a motivational sentence or two if it fits naturally
- Use "você" (informal) consistently
- Technical terms can stay in English when they're industry-standard (e.g. "bundle", "deploy", "hook", "render")
- End with a call-to-action or reflection if the original ends flatly

**→ English (en):**
- More direct and tutorial-focused
- Strip motivational filler if the Portuguese version has it
- Use imperative mood for instructions: "Add this", "Run the command"

**→ Spanish (es):**
- Similar warmth to Portuguese
- Use "tú" (informal) consistently
- Technical terms stay in English when industry-standard

### 5. Output

Write the translated file to `data/blog/{target_language}/{slug}.mdx`.

After writing, tell André:
- Source and target file paths
- Any terms left untranslated (technical jargon) and why
