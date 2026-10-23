---
name: translate-post
description: Translate an existing blog post MDX file into another language (en, pt, es), adapting tone and tags and writing it to drafts/{lang}/ with the same slug. Use when asked to translate or localize a post.
argument-hint: <source path> to <en|pt|es>
---

# Translate Post

Translate an existing blog post to another language.

**Arguments:** `$ARGUMENTS` — source file path and target language, e.g. `drafts/en/react-hooks.mdx to pt`

---

## Instructions

### 1. Read the source file

Read the file provided in `$ARGUMENTS`. If it doesn't exist locally, the post may only live in the content API: fetch it with `yarn blog pull {lang}/{slug} --prod` (read-only, writes to `drafts/{lang}/{slug}.mdx`).

Extract:

- Current language from frontmatter `language` field
- Slug (filename without `.mdx`)
- All frontmatter fields
- Full post body

### 2. Determine target path

- Target file: `drafts/{target_language}/{slug}.mdx`
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

Remove `canonicalUrl` if the source has one pointing at this site: the post page builds the right one per locale.

Set `draft: true`: the translation is published from the admin panel.

Keep unchanged:

- `date`, `authors`, `featured`, `layout`
- `images` for now — but the cover has the title printed on it, so the translation needs its own cover (see Publishing)

### 4. Translate the post body

**Translation rules:**

- Translate prose naturally — rewrite phrases to sound native, not like translated text
- Code blocks: translate inline comments only; keep code and variable names in English
- Headers (`##`, `###`): translate the heading text
- Preserve all markdown formatting: `---` dividers, tables, code blocks, lists
- Keep `❌` and `✅` symbols
- Preserve link text but don't change URLs

**Tone adaptation by target language** (complements the "Writing style" section of `AGENTS.md`):

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

Write the translated file to `drafts/{target_language}/{slug}.mdx`.

After writing, tell André:

- Source and target file paths
- Any terms left untranslated (technical jargon) and why
- The translated title as it should appear on the new cover

### Publishing

Writing the file does **not** publish it — the site reads posts from the content API, and the translation is finished in the admin panel. Like `new-post`, send the draft to the panel yourself as soon as it is written (André's request, 2026-10-22):

1. Run the checks of the `review-post` skill (sections 1–5) on the translation and fix what is objective.

2. Check it is safe to push. All three must hold, otherwise stop and ask him:
   - the frontmatter has `draft: true`;
   - the MDX compiles;
   - the slug is new in the target language: `yarn blog list --locale {target_language} --prod` doesn't list it (pushing over an existing post would replace it).

3. Push it as a draft, then confirm it stayed hidden (the public API answers 404):

   ```bash
   yarn blog push drafts/{target_language}/{slug}.mdx --prod
   curl -s -o /dev/null -w '%{http_code}' https://andreluizv-content-api.vercel.app/posts/{target_language}/{slug}
   ```

   If it fails with an MDX error, fix the reported body line and push again. Never push a file with `draft: false`, and never push again after André starts editing in the panel.

4. Tell André it is in `https://www.andreluizv.dev.br/admin` as ✏️. There he makes its cover with the translated title (**✨ Criar capa** — the source cover's illustration can be reused through "Enviar ilustração"), checks the preview and clicks **Publicar**. A Cronograma theme linked to the slug picks the translation up on its own.

The panel's "+ {lang}" badge is the alternative without Claude: it copies the source post into the editor for a manual translation.
