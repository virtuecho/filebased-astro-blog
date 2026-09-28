# Astro File-Based Blog

A static blog built from Obsidian-friendly Markdown files. Write notes in Obsidian or any text editor; Astro turns them into HTML for static hosting.

## What This Project Does

```text
Markdown notes -> Astro -> static website
```

There is no local writing page, database, draft state, or attachment manager. Every Markdown file under `src/content/posts/` is included in the public site when it is built. Keep private or unpublished notes outside that folder.

## Content Model

Each post is one `.md` file. Its path determines its public URL. YAML frontmatter is optional:

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

Folder paths are preserved and each path segment is slugified. For example, `src/content/posts/notes/First Note.md` becomes `/posts/notes/first-note/`. The homepage and post lists sort by creation date, newest first; file names only determine URLs. Committed notes use the date of their first Git commit, and uncommitted notes use the filesystem creation time. CI fetches Git history so this order survives a build checkout. Rename the file to change its public URL and update links that refer to it.

Without frontmatter, the original file name supplies the title, including when multiple notes share that name. The list shows each note's creation date and sorts newest first.

## Obsidian Markdown

Astro renders standard Markdown and GitHub Flavored Markdown. Obsidian-specific support includes:

- Note links and aliases: `[[Getting Started]]`, `[[Getting Started#Setup|setup]]`, or `[setup](Getting%20Started.md#Setup)`
- A short wikilink such as `[[Note]]` works only when that note name is unique in the whole collection. If multiple files are named `Note.md`, use a folder-qualified link such as `[[projects/Note]]`; ambiguous short links fail the build instead of pointing to the wrong post.
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
