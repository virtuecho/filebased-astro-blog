# AI Code Review Checklist

Use this checklist when reviewing changes made by a coding agent or a human.
Start with behavioral risk, then validate tooling and docs.

## Product Boundary

- Does the change preserve the static Astro blog model?
- Does it avoid adding a database, login system, server backend, or cloud CMS
  unless explicitly requested?
- Does it keep posts file-based and assets co-located with each post?

## Astro And Static Correctness

- Does `pnpm typecheck` pass?
- Does `pnpm build` pass?
- Are generated routes still derived from published Markdown posts?
- Are RSS and sitemap routes still valid static endpoints?

## Markdown And Content Correctness

- Are post directories still shaped as `src/content/posts/{postId}/index.md`?
- Are body image paths relative to the post directory?
- Are published slugs unique?
- Are post IDs stable and unique?
- Are drafts excluded from public listings, RSS, and sitemap?

## Admin And File System Access API Safety

- Does `/admin/` remain a local browser writing tool?
- Does it ask the browser for folder permission before writing files?
- Does it avoid introducing remote writes or hidden storage?
- Are settings written to `src/site-settings.json`?

## CLI Safety

- Do CLI scripts preserve the same post and asset model as `/admin/`?
- Do asset commands avoid changing unsupported files unexpectedly?
- Do command examples use `pnpm`, not npm or yarn?

## TypeScript Quality

- Does TypeScript strict mode remain enabled?
- Are new source files TypeScript by default?
- If JavaScript remains, is it covered by the allowlist and documented?
- Are imports relative and consistent with existing patterns?

## Docs Parity

- Are `README.md` and `README.zh-CN.md` structurally aligned?
- Are new commands documented in both README files?
- Do docs avoid promising behavior that the app does not implement?
- Does `pnpm docs:lint` pass?

## Tests And Validation

- Were these commands run when relevant?

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm docs:lint
pnpm arch:check
pnpm check
pnpm build
```

- If any command failed, was the failure fixed without weakening checks?

## Git Workflow

- Are unrelated user changes preserved?
- Is the change small enough to review?
- Does the suggested commit message follow `docs/engineering/COMMIT_CONVENTION.md`?
- Was nothing pushed, deployed, or published unless explicitly requested?
