@AGENTS.md

# Claude Code notes

Project context lives in `AGENTS.md` (imported above). Only Claude-specific notes go here.

## Skills

| Skill            | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `new-post`       | Write a new blog post in MDX                   |
| `translate-post` | Translate an existing post to another language |
| `review-post`    | Review a post for quality, tone and formatting |

They live in `.claude/skills/` and trigger on matching requests or with `/<name>`.

## Settings

- `.claude/settings.json` (committed): read-only and verification commands that don't need a prompt; reading `.env*` files is denied.
- `.claude/settings.local.json` (personal, gitignored): auto mode environment and rules for this repo — production database writes, env var changes and production deploys stay blocked.
