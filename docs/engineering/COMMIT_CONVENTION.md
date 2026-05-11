# Commit Convention

Use Conventional Commit headers:

```text
<type>(optional-scope): <description>
```

Examples:

```text
build: migrate package manager to pnpm
ops(ci): add cleanliness gate
docs(agents): document pnpm and validation workflow
fix(admin): keep project folder picker available
```

## Allowed Types

- `feat`
- `fix`
- `refactor`
- `perf`
- `style`
- `test`
- `docs`
- `build`
- `ops`
- `chore`

## Description Rules

Descriptions are mandatory.

Write the description in imperative mood:

```text
fix(admin): preserve draft state while editing
```

Start the description with a lowercase letter:

```text
docs(readme): add pnpm quality gates
```

Do not add a trailing period:

```text
chore: refresh lockfile
```

## Scope Guidance

Use a scope when it makes the change easier to scan.

Common scopes:

- `admin`
- `assets`
- `config`
- `posts`
- `readme`
- `site-config`
- `ci`
- `agents`
- `architecture`

## Git Rules

Do not push unless explicitly asked.

Do not commit unless explicitly asked.

Do not amend already pushed commits unless explicitly asked and the risk is
understood.
