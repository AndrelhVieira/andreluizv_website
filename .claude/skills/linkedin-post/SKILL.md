---
name: linkedin-post
description: Write a short LinkedIn share message, in English, for one of André's published blog posts (andreluizv.dev.br) — senior-dev voice, true hooks taken from the post, no invented experiences. Use when André asks for a LinkedIn post, "post para o linkedin", "divulgar no linkedin", or after a blog post is published.
argument-hint: <locale>/<slug> (e.g. pt/coding-with-ai-agents-without-losing-control)
---

# LinkedIn post

Write the text André pastes into LinkedIn when sharing a blog post. The site's LinkedIn share button opens with an empty text box (LinkedIn no longer accepts prefilled text), so this skill gives him the text to paste.

**Arguments:** `$ARGUMENTS` — `{locale}/{slug}` of a published post. Without it, use the post just published in this session, or ask.

## 1. Read the post

- Published version, read-only: `curl -s https://andreluizv-content-api.vercel.app/posts/{locale}/{slug}` (title, summary, tags, `bodyMdx`). A 404 means it isn't published yet: say so and stop.
- Check which languages exist: `curl -s "https://andreluizv-content-api.vercel.app/posts?locale=en"` (and `es`, `pt`) and look for the slug.
- Every claim in the message must be something the post itself says. Pick the hooks from it: the problem it opens with, a concrete rule or number, a mistake it warns about, the decision guide.

## 2. Write the message

**Language:** English only, natural and spoken — a senior developer talking to peers, confident without hype.

**Shape** (aim for 400–700 characters; LinkedIn cuts at ~210 characters behind "see more", so the first two lines must carry the post):

1. **Hook (1–2 lines):** a sharp, true statement of the problem or a counter-intuitive claim from the post. No question-bait like "Have you ever…?", no "🚀 Big news".
2. **Why it matters (1–2 lines):** the cost of getting it wrong, in plain words.
3. **What's inside (2–4 short lines or bullets):** concrete takeaways from the post, each one specific (a rule, a check, a pattern). Bullets with `→` or `•`, not emoji walls.
4. **Call to read (1 line) + link.**
5. **2–4 hashtags** that match the post's tags (e.g. `#React #NextJS #WebPerformance`). No generic `#coding #developer #tech` stacks.

**Link:** the English version when it exists, otherwise the post's own language with a note in the CTA ("Full post (in Portuguese):"). Add UTM params so Vercel Web Analytics shows the traffic: `https://andreluizv.dev.br/{locale}/blog/{slug}?utm_source=linkedin&utm_medium=social`.

**Truthful triggers only** — these are fine because they come from the post: curiosity (a claim the post proves), loss aversion (the mistake it prevents), specificity (exact rules, numbers, steps), authority through clarity (opinions stated plainly: "I prefer…", "My rule is…").

## 3. Never

- Invent experiences or context: no "I recently used this at work", "on a project I'm working on", "a client asked me", "my team", "last week in production". The message stays about the post's content. Opinions and rules from the post are fine; anecdotes are not, unless they are literally in the post — and even then, never name or hint at an employer, client or product.
- Hype or filler: "game-changer", "revolutionary", "unlock", "level up", "In today's fast-paced world", "Let's dive in", "I'm excited to share", "Thoughts? 👇", engagement bait, tagging people.
- More than one emoji per message, or any emoji in the first line.
- Claims the post doesn't support, or numbers that aren't in it.

## 4. Output

Show André, ready to copy:

1. The message.
2. One alternative first line (a different hook), in case he wants to swap it.
3. The link on its own line (so he can check it).

Also save the message to `drafts/linkedin/{slug}.txt` (`drafts/` is gitignored). Nothing is posted: André publishes on LinkedIn himself.
