# Agent Task Template

Use this template when asking a coding agent to change this repository.

````md
# Task: <short title>

Repository: `virtuecho/filebased-astro-blog`

## Goal

Describe the user-visible or engineering outcome.

## Preserve

- Astro static output
- Markdown posts under `src/content/posts/{postId}/index.md`
- Per-post assets co-located with `index.md`
- `src/site-settings.json` as user-editable source of truth
- `/admin/` as a local browser writing tool
- CLI scripts for advanced local workflows
- README.md and README.zh-CN.md structural parity
- TypeScript strict mode

## Non-goals

- No database unless explicitly requested
- No login system unless explicitly requested
- No server-hosted admin unless explicitly requested
- No package manager other than pnpm

## Implementation Notes

- Read relevant files first.
- Prefer existing patterns.
- Keep changes small and reviewable.
- Use TypeScript for new source files.
- Document any intentional JavaScript exceptions.

## Validation

Run:

```bash
pnpm install
pnpm format
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm docs:lint
pnpm arch:check
pnpm check
pnpm build
```

Report failures and fixes.

## Git Rules

- Do not push.
- Do not deploy.
- Do not publish packages.
- Do not commit unless explicitly asked.
````
