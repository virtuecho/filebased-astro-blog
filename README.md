# Astro File-Based Blog

A static blog built from Obsidian-friendly Markdown files. Write notes in Obsidian or any text editor; Astro turns them into HTML for static hosting.

## What This Project Does

```text
Markdown notes -> Astro -> static website
```

There is no local writing page, database, draft state, or attachment manager. To publish, put Markdown files directly in the root `posts/` folder. That is the only folder blog authors need to edit; every `.md` file there is public. Keep private or unpublished notes outside it.

## Content Model

Each post is one `.md` file directly inside `posts/`. Its filename determines its public URL. Keep this folder flat; note filenames must be unique. YAML frontmatter is optional:

```text
posts/Getting Started.md  ->  /posts/getting-started/
```

When frontmatter is present, title and date can override the file-derived title and creation date. Set `category` to place a post in a category; if omitted, it uses `Uncategorized`. Categories and their post lists are generated automatically. `tags` can contain multiple values:

```md
---
title: Getting Started
date: 2026-09-28
category: Notes
tags:
  - obsidian
  - markdown
---

Write the article here.
```

Multiple notes may use the same frontmatter title. Their dates appear in the list and determine its newest-first order.

The build rejects filenames that would produce the same public URL. The homepage and post lists sort by creation date, newest first; file names only determine URLs. Committed notes use the date of their first Git commit, and uncommitted notes use the filesystem creation time. CI fetches Git history so this order survives a build checkout. Rename the file to change its public URL and update links that refer to it.

Post listing pages show 10 posts per page, with numbered links to move between pages.

The navigation includes full-text search for the displayed title (the filename
when no title is set), description, explicit category, tags, and Markdown body.
Dates and the default `Uncategorized` category are not searched. Matching
ignores letter case; each space-separated term must appear as a substring, and
all terms must match. It uses a static index generated during the build; the
browser downloads that index only when someone uses search. No database or
search service is required. Search results use the same post cards as the
homepage and show 10 posts per page with numbered pagination. Search waits
until IME composition is complete before filtering.

Without frontmatter, the original file name supplies the title. The list shows each note's creation date and sorts newest first.

## Obsidian Markdown

Astro renders standard Markdown and GitHub Flavored Markdown. Obsidian-specific support includes:

- Note links and aliases resolve by filename: `[[Getting Started]]`, `[[Getting Started#Setup|setup]]`, or `[setup](Getting%20Started.md#Setup)`. Keep notes flat and use unique filenames; folder-qualified note links are rejected.
- Callouts: `> [!tip] A title`
- Highlights: `==important text==`
- Math equations: `$x^2$` and `$$...$$`
- Task lists, including Obsidian status markers such as `[/]`
- Inline tags: `#reading/list`
- Comments: `%%hidden from the published page%%`
- YAML properties in the frontmatter block

`![[...]]` file embeds and local post images are not handled. Keep the content folder limited to Markdown notes. Standard Markdown links and externally hosted images can still be used.

## Project Structure

For regular publishing, only use `posts/`. The remaining project files are
template internals and do not need changes to add or edit articles.

The website interface is English-only. To change its labels, descriptions,
theme, or typography, edit the marked JSON code block in `INTERFACE.md`. The
values in that block are the active settings and defaults. The guide in
`INTERFACE.md` explains each theme setting. In brief:

- `theme.colors` controls the page, site canvas, header, text, links, borders,
  code blocks, highlights, callouts, and pagination colors.
- `theme.siteMaxWidth` and `theme.headerMinHeight` control the site's maximum
  width and the header's minimum height.
- `theme.typography` controls body, heading, and code fonts, font size, line
  spacing, and heading weight. Font lists are fallbacks to fonts already
  available on the visitor's device; they are not downloaded.
- For local background images, add files under `public/images/site/` and use
  their site paths, such as `/images/site/header.webp`. The `example-*.webp`
  paths in `INTERFACE.md` are placeholders and must be replaced; otherwise the
  browser requests missing images.

The settings block is standard JSON and does not support comments. Its
surrounding Markdown explains the settings and is ignored by the build.

## Local Development

```bash
pnpm install
pnpm dev
```

Open the local site at `http://localhost:4321/`. Edit `.md` files in Obsidian, then refresh the page to preview changes.

## Checks and Build

```bash
pnpm check
pnpm build
pnpm preview
```

`pnpm build` writes the static site to `dist/`; `pnpm preview` serves that build locally.

## Deployment

Use any static host with these settings:

```text
Build command: pnpm build
Output folder: dist
```
