# Agent Task Template

Use this template when asking a coding agent to change this repository.

````md
# Task: <short title>

Repository: `virtuecho/filebased-astro-blog`

## Goal

Describe the user-visible or engineering outcome.

## Preserve

- Astro static output
- Markdown notes under `src/content/posts/`
- Obsidian Markdown rendering
- `src/site-settings.json` as the site settings source of truth
- README.md and README.zh-CN.md structural parity
- TypeScript strict mode

## Non-goals

- No local writing page, draft state, or attachment manager
- No database unless explicitly requested
- No login system or server backend unless explicitly requested
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
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm docs:lint
pnpm settings:check
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
