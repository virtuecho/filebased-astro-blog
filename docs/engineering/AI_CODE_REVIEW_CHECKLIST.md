# AI Code Review Checklist

Review behavioral risk first, then validation and repository hygiene.

## Product Boundary

- Does the change preserve the static Astro blog model?
- Does it avoid adding a database, login system, backend, or cloud CMS unless
  explicitly requested?
- Does it keep published content as Markdown files?
- Does it avoid reintroducing a local writing page, drafts, or attachment
  management?

## Astro And Static Correctness

- Do type-checking and `pnpm build` pass?
- Are routes generated from Markdown files?
- Are RSS and sitemap endpoints valid?
- Do Obsidian wikilinks point to the expected note routes?

## Markdown And Content Correctness

- Does a note render without frontmatter, with its title and creation date
  derived from the file when absent?
- Are Obsidian callouts, highlights, comments, tags, wikilinks, note links,
  math, and task markers rendered as documented?
- Are `README.md` and `README.zh-CN.md` structurally aligned?
- Do docs avoid promising unsupported embed or community-plugin behavior?

## TypeScript And Dependencies

- Does TypeScript strict mode remain enabled?
- Are new source files TypeScript unless a framework entry point requires JS?
- Are imports and dependencies needed for the implemented behavior?
- Does the change continue to use pnpm without adding npm or yarn lockfiles?

## Validation

Run relevant commands and report any gaps:

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

## Git Workflow

- Are unrelated user changes preserved?
- Is the change reviewable?
- Does any suggested commit message follow
  `docs/engineering/COMMIT_CONVENTION.md`?
- Was nothing pushed, deployed, published, or committed unless explicitly
  requested?
