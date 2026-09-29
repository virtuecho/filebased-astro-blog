# AGENTS.md

This file is the navigation map for coding agents working in this repository.
Read it before making changes. The English and Chinese READMEs describe setup
and content workflows.

## Project Identity

`filebased-astro-blog` is a static Astro blog generated from Obsidian-friendly
Markdown notes:

- Astro builds static HTML.
- Every `.md` file directly under `posts/` is public when built.
- Blog authors only need to edit Markdown files in `posts/`; template source
  and configuration remain internal for normal publishing.
- Note filenames must be unique and determine their `/posts/` URL.
- Obsidian wikilinks, Markdown note links, callouts, highlights, comments, tags,
  math, task markers, and optional YAML properties are supported.
- There is no local writing page, draft state, or attachment manager.
- `INTERFACE.md` holds the English interface text in YAML
  frontmatter and preserves the original defaults in its Markdown body.
- `.config/site-settings.json` holds theme and typography settings.
  Blog authors do not need to edit either file when publishing posts.

Keep private or unpublished notes outside `posts/`. Do not redesign
the product during hygiene, tooling, docs, or small feature work.

## Non-negotiable Rules

- Do not push, deploy, or commit unless the user explicitly asks.
- Use pnpm only. Do not add npm or yarn lockfiles.
- Keep TypeScript strict mode enabled.
- Do not add a database, login system, server backend, or cloud CMS unless
  explicitly requested.
- Keep posts as plain Markdown files.
- Keep `README.md` and `README.zh-CN.md` structurally aligned.
- Keep `.config/site-settings.json` as the theme settings source and
  `INTERFACE.md` as the interface text source.
- Do not commit generated folders such as `dist/`, `.astro/`, or `node_modules/`.

## Preferred Stack

- Astro
- TypeScript
- pnpm
- Prettier
- ESLint flat config
- GitHub Actions

Use TypeScript for new source files unless a framework entry point requires
JavaScript.

## Directory Structure

```text
.config/              Internal tool configuration
src/pages/             Astro pages and generated routes
posts/                 Published Obsidian-friendly Markdown notes
src/components/        Reusable Astro components
src/layouts/           Page and post layouts
src/obsidian-links.ts  Obsidian link rendering
src/site.config.ts      Site settings accessor
scripts/               Repository checks
public/                Static files served as-is
```

## Content Rules

- Notes must be `.md` files. Frontmatter is optional; title and creation date
  are derived from the file when those properties are omitted. Committed notes
  use their first Git addition date; uncommitted notes use filesystem creation
  time.
- Keep notes directly in `posts/`. Their unique filenames determine
  public URLs and wikilink targets; nested note folders are unsupported.
- Category and tags are optional; the default category is `Uncategorized`.
- Every note directly under `posts/` is public; do not add draft/private
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

- `.config/astro.config.mjs`
- `.mjs` scripts in `scripts/`
- `src/pages/rss.xml.js`
- `src/pages/sitemap.xml.js`
