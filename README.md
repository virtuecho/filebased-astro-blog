# Astro File-Based Blog

A static blog built from Obsidian-friendly Markdown files. Write notes in Obsidian or any text editor; Astro turns them into HTML for static hosting.

## What This Project Does

```text
Markdown notes -> Astro -> static website
```

There is no local writing page, database, draft state, or attachment manager. Every `.md` file directly inside `src/content/posts/` is included in the public site when it is built. Keep private or unpublished notes outside that folder.

## Content Model

Each post is one `.md` file directly inside `src/content/posts/`. Its filename determines its public URL. Keep this folder flat; note filenames must be unique. YAML frontmatter is optional:

```text
src/content/posts/Getting Started.md  ->  /posts/getting-started/
```

When frontmatter is present, title and date can override the file-derived title and creation date. Category and tags are optional:

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

```text
src/content/posts/  Published Markdown notes
src/pages/          Static pages, archives, RSS, and sitemap
src/components/     Shared page components
src/site-settings.json  Site copy, locale, theme, and typography
public/             Static files served as-is
```

## Local Development

```bash
pnpm install
pnpm dev
```

Open the local site at `http://localhost:4321/`. Edit `.md` files in Obsidian, then refresh the page to preview changes.

## Site Settings

Edit `src/site-settings.json` to change site copy, language, colors, backgrounds, or typography. Site settings are separate from post content.

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
