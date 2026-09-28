# AGENTS.md

This file is the navigation map for coding agents working in this repository.
Read it before making changes, then follow the deeper docs it points to.

## Project Identity

`filebased-astro-blog` is a static Astro blog generated from Obsidian-friendly
Markdown notes:

- Astro builds static HTML.
- Every `.md` file under `src/content/posts/` is public when built.
- A note's relative file path determines its `/posts/` URL.
- Obsidian wikilinks, Markdown note links, callouts, highlights, comments, tags,
  math, task markers, and optional YAML properties are supported.
- There is no local writing page, draft state, or attachment manager.
- `src/site-settings.json` is the user-editable source of truth for site copy,
  language, theme, and typography.

Keep private or unpublished notes outside `src/content/posts/`. Do not redesign
the product during hygiene, tooling, docs, or small feature work.

## Non-negotiable Rules

- Do not push, deploy, or commit unless the user explicitly asks.
- Use pnpm only. Do not add npm or yarn lockfiles.
- Keep TypeScript strict mode enabled.
- Do not add a database, login system, server backend, or cloud CMS unless
  explicitly requested.
- Keep posts as plain Markdown files.
- Keep `README.md` and `README.zh-CN.md` structurally aligned.
- Keep `src/site-settings.json` as the user-editable site settings source.
- Do not commit generated folders such as `dist/`, `.astro/`, or `node_modules/`.

## Source Of Truth Docs

- `README.md` and `README.zh-CN.md` for setup and content workflows
- `docs/engineering/ARCHITECTURE.md` for architecture boundaries
- `docs/engineering/CI_AND_HOOKS.md` for validation, CI, and hooks
- `docs/engineering/COMMIT_CONVENTION.md` for commit messages
- `docs/engineering/AI_CODE_REVIEW_CHECKLIST.md` for review criteria
- `docs/prompts/AGENT_TASK_TEMPLATE.md` for future agent tasks
- `docs/prompts/CODE_REVIEW_PROMPT.md` for review prompts

## Preferred Stack

- Astro
- TypeScript
- pnpm
- Prettier
- ESLint flat config
- markdownlint-cli2
- Husky
- lint-staged
- GitHub Actions

Use TypeScript for new source files unless a framework entry point requires
JavaScript.

## Directory Structure

```text
src/pages/             Astro pages and generated routes
src/content/posts/     Published Obsidian-friendly Markdown notes
src/markdown/          Markdown rendering helpers
src/components/        Reusable Astro components
src/layouts/           Page and post layouts
src/site-settings.json User-editable settings and localized copy
scripts/               Repository checks and Git hooks
public/                Static files served as-is
docs/engineering/      Engineering policy and architecture docs
docs/prompts/          Reusable agent and review prompts
```

## Content Rules

- Notes must be `.md` files. Frontmatter is optional; title and creation date
  are derived from the file when those properties are omitted. Committed notes
  use their first Git addition date; uncommitted notes use filesystem creation
  time.
- The relative note path determines its public URL and wikilink target.
- Category and tags are optional; locale defaults are in `site-settings.json`.
- Every note under `src/content/posts/` is public; do not add draft/private
  filtering.
- Do not add post attachment upload, copy, processing, or embedding workflows.
- Preserve support for Obsidian wikilinks, Markdown note links, callouts,
  highlights, comments, tags, math, task markers, and ordinary Markdown.

## Validation Commands

```bash
pnpm install
pnpm dev
pnpm format
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm docs:lint
pnpm settings:check
pnpm check
pnpm build
```

Run `pnpm check` and `pnpm build` before a requested commit. Report exactly
which validation commands ran.

## Commit Rules

Use Conventional Commit headers:

```text
<type>(optional-scope): <description>
```

Allowed types: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`,
`build`, `ops`, and `chore`.

Do not amend already pushed commits unless explicitly requested.

## Agent Workflow

1. Read relevant files before editing.
2. Plan first when the task is ambiguous or large.
3. If implementation is explicitly requested, make reviewable changes without
   waiting for another approval step.
4. Preserve unrelated user changes.
5. Prefer existing patterns over new abstractions.
6. Update both README files when user-facing workflows change.
7. Update docs when repository policy changes.
8. Run relevant validation and report exactly what ran.
9. Do not push, deploy, publish, or commit unless explicitly asked.

## JavaScript Exceptions

JavaScript files remain only where framework or tooling conventions require
it:

- `astro.config.mjs`
- `.mjs` scripts in `scripts/`
- `src/pages/rss.xml.js`
- `src/pages/sitemap.xml.js`
