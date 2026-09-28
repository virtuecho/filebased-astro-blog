# CI And Hooks

The repository uses local hooks and CI to keep routine engineering checks
mechanical.

## pnpm-only Policy

Use pnpm for all Node package work. Do not add `package-lock.json` or
`yarn.lock`. Keep `pnpm-lock.yaml` and the pnpm version in `package.json`.

## Validation Commands

```bash
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

`pnpm check` runs formatting, type-checking, lint, tests, documentation lint, and
settings checks. `pnpm build` separately verifies the static site output.

## Formatting And Linting

Prettier formats code, JSON, Markdown, CSS, HTML, and YAML. ESLint uses the flat
config in `eslint.config.js` for TypeScript, JavaScript, and Astro files.
Markdownlint checks user-facing and engineering documentation.

## Tests And Settings Checks

`pnpm test` runs the built-in Node test runner through `tsx` for Obsidian syntax
rendering helpers. `pnpm settings:check` checks that English and Chinese site
copy keys match and the configured default locale is supported.

## Husky And lint-staged

Husky installs Git hooks through `pnpm prepare`. The pre-commit hook runs
`pnpm exec lint-staged`, which formats and lints staged files. The commit message
hook validates Conventional Commit headers with
`scripts/validate-commit-msg.mjs`.

## GitHub Actions

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It
installs from the frozen pnpm lockfile, runs the quality checks, and builds the
static site. CI fetches full Git history because the first commit date supplies
the creation date for notes without a `date` property. CI does not run
`pnpm dev`, deploy, publish, or push.

## Before Committing

Run:

```bash
pnpm check
pnpm build
```
