# AGENTS.md

## Project overview

This is an Astro static blog template. Content lives in plain Markdown files — no database. Posts and their attachments are co-located in one directory per post, making migration trivial. The admin page (`/admin/`) is a local browser writing tool that uses the File System Access API.

- **Framework**: Astro (static output)
- **Language**: TypeScript (`.ts`, `.astro`), JavaScript (`.mjs` CLI scripts)
- **Content**: Markdown in `src/content/posts/{postId}/index.md`
- **Config**: `src/site-settings.json` (user-editable); `src/site.config.ts` (thin wrapper re-export)

## Setup commands

```bash
npm install          # install dependencies
npm run dev          # start Astro dev server at http://localhost:4321
npm run build        # type-check + static build to dist/
npm run preview      # preview dist/ locally
```

## Key architecture

### Post structure (co-located)

```
src/content/posts/{postId}/
  index.md           # the post (required)
  cover.jpg          # attachments live here
  photo.png
```

- `postId` is a UUID generated at post creation time — it is the **stable identity**
- Admin creates: directory + `index.md` in one step
- Attachments are uploaded into the same directory
- Body images use **relative paths**: `![img](./img.jpg)`
- Cover path in frontmatter: `cover: "./cover.jpg"` — any filename works, `cover.jpg` is only a default suggestion in the CLI template

### Content collection

- Defined in `src/content.config.ts` with `glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' })`
- Astro resolves relative image paths in markdown automatically

### Config architecture

- **`src/site-settings.json`**: the single source of truth for all user-facing settings (theme, typography, copy for all locales, language). Edit this file directly or via admin/CLI.
- **`src/site.config.ts`**: thin wrapper that imports the JSON and re-exports `siteConfig`, `copy`, `contentDefaults`, `dateLocale`, `activeLocale`, `getCopy()`, `SupportedLocale` type.
- Adding a new locale: add a key under `copy`, add to `supportedLocales` array, add to `dateLocales`.

### Vote dev server for post images

`astro.config.mjs` includes a Vite plugin that:
- Serves `/images/posts/{postId}/file` from `src/content/posts/{postId}/file` during dev
- Copies non-`.md` files to `dist/images/posts/` during build

### Admin page (`src/pages/admin.astro`)

- Uses browser File System Access API (Chrome/Edge only)
- Two tabs: Posts | Settings
- `local-file-storage.js` handles IndexedDB persistence for the root handle
- Settings tab reads/writes `src/site-settings.json`
- Site images are uploaded to `public/images/site/`

### CLI scripts

All in `scripts/`, run via `tsx`:

| Script | Purpose |
|--------|---------|
| `new-post.mjs` | Create draft post directory + index.md |
| `edit-post.mjs` | Open post in `$EDITOR` |
| `update-slug.mjs` | Regenerate slug from title |
| `preview-post.mjs` | Render standalone HTML preview |
| `open-assets.mjs` | Open post directory in file manager |
| `add-assets.mjs` | Copy/process images into post directory |
| `site-config.mjs` | View/edit site settings (interactive or `--flags`) |
| `site-assets.mjs` | Copy images to `public/images/site/` |

### Image processing

- **Admin (browser)**: Canvas API for WebP conversion / metadata stripping
- **CLI**: `sharp` via `src/admin/sharp-image-processing.js`
- Both paths support `--webp` and `--strip-metadata` flags
- Only static JPEG/PNG/WebP images are processed

## Verification

```bash
npx astro check     # TypeScript type-check only
npm run build       # check + full static build
```

No test suite exists yet. Verify manually:
- `npm run dev` → open `http://localhost:4321` and `http://localhost:4321/admin/`
- Run CLI scripts to confirm they work

## Commit message conventions

Follow the existing format:

```
type(scope): description
```

Types used: `feat`, `fix`, `refactor`, `docs`, `chore`

Scopes used: `config`, `admin`, `assets`, `posts`, `readme`, `site-config`

Examples:
- `feat(config): add admin Settings panel and CLI site-config with full site editing`
- `refactor(posts): co-locate posts and attachments in one directory per post`
- `fix(admin): show project folder picker on both Posts and Settings tabs`

## Language / i18n notes

- Two supported locales: `en` (default) and `zh-CN`
- All UI copy lives in `site-settings.json` under `copy.en` / `copy['zh-CN']`
- When adding a new config key to one locale, add it to both
- README exists in both English (`README.md`) and Chinese (`README.zh-CN.md`) — keep them in sync

## Code style

- All existing code uses **comments** unless explicitly requested — follow this pattern
- TypeScript: strict mode (extends `astro/tsconfigs/strict`)
- Astro components: frontmatter script at top, HTML below
- CLI scripts: `.mjs` extension, run via `tsx`
- Imports: use relative paths from the importing file's location
- Follow existing naming conventions and patterns when adding new files

## Agent workflow rules

**Before implementing any change:**

1. Read the relevant files and understand the existing patterns
2. Propose a clear plan — explain what will change and why
3. Wait for the user to approve before writing code

**When the user asks for changes to be committed:**

- Summarize the changes in a commit message that follows the project's conventions
- Do NOT commit automatically unless the user explicitly asks you to
- Suggest the commit message for the user to review

**Never run these commands unless the user explicitly asks for them:**

- `git push` or any variant that pushes to a remote
- `git commit --amend` on already-pushed commits
- Force push of any kind
- `npm publish` or any deployment command
