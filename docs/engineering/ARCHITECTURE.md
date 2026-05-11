# Architecture

This project is a static Astro blog template built around durable local files.
The product boundary is intentionally small: Markdown posts, co-located assets,
site settings in JSON, and static output that can be hosted anywhere.

## Static Astro Boundary

Astro builds the site to static files in `dist/`. Runtime behavior on the public
site should not require a database, login server, remote admin service, or cloud
CMS. The development server is local tooling only.

Important routes live in `src/pages/`:

```text
/                         homepage
/posts/{slug}/            published posts
/archives/                archive index
/archives/{year}/{month}/ monthly archive
/categories/              category index
/category/{category}/     category listing
/tags/                    tag index
/tag/{tag}/               tag listing
/about/                   configured about page
/admin/                   local writing tool
/rss.xml                  RSS feed
/sitemap.xml              sitemap
```

## Markdown Content Model

Posts live under:

```text
src/content/posts/{postId}/index.md
src/content/posts/{postId}/attachments...
```

Each post is a directory. `index.md` contains frontmatter plus Markdown body.
Attachments sit beside the Markdown file so a post can be copied or backed up as
one folder.

The content collection is defined in `src/content.config.ts` with a glob over
`src/content/posts/**/*.{md,mdx}`. Astro resolves relative image paths in
Markdown during build.

## Post Identity And URL Identity

`postId` is stable identity. It is generated when a post is created and should
not change after creation. The post directory name uses this identity.

`slug` is public URL identity:

```text
/posts/{slug}/
```

Slugs may change when a title changes. Old slugs are not stored by the template,
so redirects are a deployment concern if a published slug changes.

## Asset Co-location

Post assets belong in the same directory as `index.md`.

```text
src/content/posts/{postId}/
  index.md
  cover.jpg
  photo.png
```

Body images use relative Markdown paths such as:

```md
![photo](./photo.png)
```

Site-wide assets live separately in `public/images/site/`.

## Site Settings Source Of Truth

`src/site-settings.json` is the user-editable source of truth for:

- site title, description, footer, navigation, and helper copy
- active locale and supported locales
- theme color and image settings
- typography settings
- admin and CLI copy

`src/site.config.ts` is a thin wrapper that imports this JSON and re-exports
typed helpers such as `siteConfig`, `copy`, `contentDefaults`, `dateLocale`, and
`getCopy()`.

When adding a locale, update `copy`, `supportedLocales`, and `dateLocales`.
Locale key parity is enforced by `scripts/check-architecture.ts`.

## Admin Boundary

`src/pages/admin.astro` is a local browser writing tool. It uses the File System
Access API after the user grants folder permission. It writes normal files into
the repository:

```text
/admin/ -> File System Access API -> src/content/posts/
```

The admin page is not a remote dashboard. It does not add authentication,
server-side storage, or a database.

`src/admin/local-file-storage.js` remains JavaScript because it is consumed as a
browser module from the admin page. `src/admin/sharp-image-processing.js`
remains JavaScript because the current CLI scripts are `.mjs` modules that
consume it directly.

## CLI Boundary

CLI scripts live in `scripts/` and are run through `tsx`.

```text
pnpm new-post
pnpm edit-post
pnpm update-slug
pnpm preview-post
pnpm open-assets
pnpm add-assets
pnpm site-config
pnpm site-assets
```

The CLI is advanced local tooling. It should preserve the same content model as
the admin UI.

## RSS And Generated Routes

`src/lib.ts` reads published posts from the Astro content collection.
Generated pages, RSS, and sitemap consume that shared post model.

`src/pages/rss.xml.js` and `src/pages/sitemap.xml.js` remain JavaScript because
Astro endpoint filenames map directly to XML routes.

## Future Extension Points

The current template leaves room for future adapters without changing the post
folder model:

- Git-backed CMS
- object storage for assets
- remote admin API
- database-backed admin
- slug redirect registry
- richer multilingual routing

## Non-goals

These are outside the current template unless explicitly requested:

- database storage
- login or account system
- server-hosted admin dashboard
- cloud CMS rewrite
- moving posts away from local Markdown files
- separating post assets from their post directory by default
