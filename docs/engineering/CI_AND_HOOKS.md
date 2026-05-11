# CI And Hooks

The repository uses local hooks and CI to keep routine engineering hygiene
mechanical.

## pnpm-only Policy

Use pnpm for all Node package work.

```bash
pnpm install
pnpm dev
pnpm build
```

Do not add `package-lock.json` or `yarn.lock`. The architecture check requires
`pnpm-lock.yaml` and verifies `package.json` declares `packageManager` with
`pnpm@`.

## Required Scripts

The main validation commands are:

```bash
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

`pnpm check` runs the standard pre-commit quality gate:

```bash
pnpm format:check && pnpm typecheck && pnpm lint && pnpm test && pnpm docs:lint && pnpm arch:check
```

`pnpm build` is kept separate so CI can prove the static output still builds.

## Formatting

Prettier formats code, JSON, Markdown, CSS, HTML, and YAML. Generated and vendor
folders are excluded through `.prettierignore`.

Use:

```bash
pnpm format
pnpm format:check
```

## Linting

ESLint uses a flat config in `eslint.config.js`. It covers TypeScript, existing
JavaScript modules, `.mjs` CLI scripts, and Astro files.

Use:

```bash
pnpm lint
```

## Documentation Linting

Markdown is treated as source. `markdownlint-cli2` checks README files,
engineering docs, prompt templates, and `AGENTS.md`.

Use:

```bash
pnpm docs:lint
```

## Architecture Check

`scripts/check-architecture.ts` turns repository conventions into mechanical
checks. It verifies package manager policy, strict TypeScript configuration,
required docs, generated folder policy, JavaScript allowlists, post identity,
published slug uniqueness, and locale key parity.

Use:

```bash
pnpm arch:check
```

## Husky And lint-staged

Husky installs Git hooks through:

```bash
pnpm prepare
```

The pre-commit hook runs:

```bash
pnpm exec lint-staged
```

`lint-staged` formats and lints only staged files. It is a fast local guard, not
a replacement for `pnpm check`.

The commit message hook validates Conventional Commit headers with
`scripts/validate-commit-msg.mjs`.

## GitHub Actions

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`.

CI runs:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm docs:lint
pnpm arch:check
pnpm build
```

CI does not run `pnpm dev`, deploy, publish, or push.

## Before Committing

Run:

```bash
pnpm check
pnpm build
```

For content-only changes, `pnpm check` is still recommended because docs,
settings, and post metadata are part of the product surface.
