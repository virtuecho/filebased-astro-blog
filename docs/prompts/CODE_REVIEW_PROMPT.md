# Code Review Prompt

Use this prompt to review a branch or patch in this repository.

````md
# Task: Review filebased-astro-blog changes

Review the change as a code reviewer. Prioritize bugs, behavioral regressions,
missing validation, and repository hygiene issues. Put findings first.

Check:

- Product behavior changed intentionally and is documented.
- The static Astro boundary is preserved.
- No database, login system, server backend, or cloud CMS was added unless the
  task explicitly requested it.
- Posts still live under `src/content/posts/{postId}/index.md`.
- Post assets are still co-located with the Markdown file.
- `src/site-settings.json` remains the user-editable source of truth.
- Existing `.mjs` CLI scripts still work.
- Package manager usage is pnpm-only.
- `package-lock.json` and `yarn.lock` were not added.
- Generated folders such as `dist/`, `.astro/`, `.post-preview/`, and
  `node_modules/` were not committed.
- README.md and README.zh-CN.md stayed structurally aligned.
- New docs pass Markdown lint.
- New source is TypeScript unless a JavaScript exception is documented.
- Tests and validation commands were run, or the gap is called out.

Validation commands to look for:

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

Output format:

1. Findings ordered by severity with file and line references.
2. Open questions or assumptions.
3. Brief change summary.
4. Validation gaps.
````
