# AGENTS.md

This file is the navigation map for coding agents working in this repository.
Read it before making changes, then follow the deeper docs it points to.

## Project Identity

`filebased-astro-blog` is an Astro static blog template. It is intentionally
file-based and simple:

- Astro builds static HTML.
- Posts are Markdown files.
- Each post owns one directory with `index.md` and its attachments.
- `/admin/` is a local browser writing tool using the File System Access API.
- `src/site-settings.json` is the user-editable source of truth for copy,
  language, theme, typography, and admin text.
- CLI scripts exist for advanced local workflows.

Do not redesign the product while doing hygiene, tooling, docs, or small feature
work.

## Non-negotiable Rules

- Do not push unless the user explicitly asks.
- Do not commit unless the user explicitly asks.
- Use pnpm only. Do not add npm or yarn lockfiles.
- Keep TypeScript strict mode enabled.
- Do not introduce a database, login system, server backend, or cloud CMS unless
  explicitly requested.
- Keep posts file-based.
- Keep post content and assets co-located in `src/content/posts/{postId}/`.
- Keep `README.md` and `README.zh-CN.md` structurally in sync.
- Keep `src/site-settings.json` as the user-editable settings source.
- Do not commit generated folders such as `dist/`, `.astro/`,
  `.post-preview/`, or `node_modules/`.

## Source Of Truth Docs

Start here:

- `README.md` for English user-facing setup and workflows
- `README.zh-CN.md` for Chinese user-facing setup and workflows
- `docs/engineering/ARCHITECTURE.md` for product and architecture boundaries
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

Use TypeScript for new source files by default. Existing JavaScript remains only
where documented by `scripts/check-architecture.ts`.

## Directory Structure

```text
src/pages/              Astro pages and generated routes
src/content/posts/      Markdown post content
src/content/posts/{id}/ one post directory: index.md plus attachments
src/admin/              local admin storage and image helpers
src/components/         reusable Astro components
src/layouts/            page and post layouts
src/site-settings.json  user-editable settings and localized copy
scripts/                local CLI tools and repository checks
docs/engineering/       engineering policy and architecture docs
docs/prompts/           reusable agent and review prompts
public/images/site/     site-wide images
templates/              post templates
```

## Naming Conventions

- `postId` is stable identity and should not change after creation.
- `slug` is public URL identity and may change intentionally.
- Post directories use `postId`.
- Post entry files are named `index.md`.
- Body images use relative paths such as `./photo.jpg`.
- Site-wide images go under `public/images/site/`.
- CLI scripts use `.mjs` while the current CLI remains JavaScript-based.

## Validation Commands

Install dependencies:

```bash
pnpm install
```

Run local development:

```bash
pnpm dev
```

Run focused checks:

```bash
pnpm format
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm docs:lint
pnpm arch:check
pnpm build
```

Run the standard quality gate:

```bash
pnpm check
```

Before committing, prefer:

```bash
pnpm check
pnpm build
```

## Commit Rules

Use Conventional Commit headers:

```text
<type>(optional-scope): <description>
```

Allowed types:

```text
feat
fix
refactor
perf
style
test
docs
build
ops
chore
```

Examples:

```text
build: migrate package management to pnpm
ops(ci): add quality gates and local hooks
docs(agents): document repository workflow
build(architecture): add repository cleanliness checks
```

Do not amend already pushed commits unless explicitly requested.

## Agent Workflow

1. Read relevant files before editing.
2. Plan first when the task is ambiguous or large.
3. If the user already explicitly requested implementation, make small,
   reviewable changes without waiting for another approval step.
4. Preserve unrelated user changes.
5. Prefer existing patterns over new abstractions.
6. Keep app behavior unchanged unless behavior change is the task.
7. Update both README files when user-facing commands or workflows change.
8. Add or update docs when repository policy changes.
9. Run the relevant validation commands and report exactly what ran.
10. Do not push, deploy, publish, or commit unless explicitly asked.

## JavaScript Exceptions

This repository still has intentional JavaScript files:

- `.mjs` CLI scripts in `scripts/`
- `src/admin/local-file-storage.js`
- `src/admin/sharp-image-processing.js`
- `src/pages/rss.xml.js`
- `src/pages/sitemap.xml.js`

New source files should be TypeScript unless there is a documented reason to do
otherwise.
