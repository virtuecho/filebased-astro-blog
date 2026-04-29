# Astro File Blog Template

This is a static blog template for people who want a simple, durable blog without a database.

The idea is inspired by classic livedoor-style blogs: a clear blog title, a short description, plain navigation, archive/category/tag pages, a sidebar, and an article-first layout. It does not copy livedoor code or branding.

Chinese documentation: [README.zh-CN.md](./README.zh-CN.md)

## What This Project Is

This project turns local files into a website.

```text
Markdown files        -> blog posts
public image folders  -> images and attachments
Astro                 -> builds HTML pages
static hosting        -> publishes the generated site
```

There is no database and no remote admin server. The current admin page is a local writing tool: it writes Markdown and assets into this repository after your browser gets folder permission.

The recommended writing entrypoint is:

```text
http://localhost:4321/admin/
```

The command line tools are kept for automation and advanced use.

## Project Structure

The important folders are:

```text
src/pages/              Astro pages: homepage, archive pages, admin page, RSS
src/content/posts/      Markdown post files
public/images/posts/    one asset folder per post
public/images/site/     site-wide images, such as header or background images
src/site.config.ts      site copy, language copy, navigation labels, theme settings
src/content-workflow.ts shared post rules used by /admin/ and CLI scripts
```

A real post has this shape:

```text
src/content/posts/{postId}.md
public/images/posts/{postId}/
```

`postId` is the stable identity. Do not treat the title or URL slug as the stable identity.

## Install And Run

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the public site:

```text
http://localhost:4321
```

Open the local writing admin:

```text
http://localhost:4321/admin/
```

Use Chrome or Edge for `/admin/`, because it uses the browser File System Access API.

To preview the production build:

```bash
npm run build
npm run preview
```

`npm run dev` is for editing. `npm run build` checks and generates `dist/`. `npm run preview` serves the generated `dist/` output.

## Site Copy, Language, And Theme

Site copy is in:

```text
src/site.config.ts
```

Default language:

```ts
defaultLocale: 'en'
```

Chinese copy is under:

```ts
'zh-CN'
```

To switch the visible site/admin/CLI copy to Chinese:

```ts
defaultLocale: 'zh-CN'
```

This is copy-level language support. It is not full multilingual post routing yet.

The blog header uses classic blog semantics:

```html
<h1 class="blog-title">...</h1>
<h2 class="blog-description">...</h2>
```

Title and description come from:

```ts
site: {
  title: 'File-Based Astro Blog',
  description: 'A quiet static blog template powered by Markdown files.'
}
```

Background and header images are configured in:

```ts
theme: {
  bodyBackgroundImage: '/images/site/body.jpg',
  siteBackgroundImage: '',
  headerBackgroundImage: '/images/site/header.jpg',
  headerMinHeight: '160px',
  headerTextColor: '#111111',
  headerDescriptionColor: '#555555'
}
```

Empty strings mean no image is used.

CSS lives in:

```text
src/styles.css
```

Useful selectors:

```css
body
.site
.header
.blog-title
.blog-description
```

Post cover images are configured per post:

```md
cover: "/images/posts/{postId}/cover.jpg"
```

## First Post In /admin/

1. Run `npm run dev`.
2. Open `http://localhost:4321/admin/` in Chrome or Edge.
3. Click `Choose Project Folder`.
4. Select the project root folder, the folder containing `package.json`.
5. Click `New Post`.

When you click `New Post`, the admin immediately does three things:

```text
1. creates a random postId UUID
2. creates src/content/posts/{postId}.md
3. creates public/images/posts/{postId}/
```

The new post starts as a draft:

```md
draft: true
```

Drafts do not appear on the public site, archive pages, category pages, tag pages, RSS, or sitemap.

When you are ready to publish, uncheck the draft option in `/admin/`, or change the Markdown frontmatter to:

```md
draft: false
```

## Editing A Post In /admin/

1. Open `/admin/`.
2. Click `Choose Project Folder`.
3. Click a post in the post list.
4. Edit the frontmatter fields.
5. Edit the Markdown body.
6. Use the live preview pane while writing.
7. Click `Save Post`.

The admin edits normal Markdown files. Nothing is hidden in a database.

## Uploading Assets In /admin/

Assets belong to a post, so a post must exist before assets can be uploaded.

That is why the upload control is disabled before you create or select a post. There is no normal "upload without UUID" state.

After a post is selected:

1. Click the file picker in the Assets section.
2. Choose images or files.
3. Optionally enable `Convert supported images to WebP`.
4. Optionally enable `Strip metadata from supported images`.
5. Click `Upload To Asset Folder`.
6. The files are copied into `public/images/posts/{postId}/`.
7. Click `Insert` beside an uploaded file to insert Markdown like:

```md
![image-name.jpg](/images/posts/{postId}/image-name.jpg)
```

Processing rules:

```text
static JPEG/PNG/WebP   can be converted or re-encoded
other file types       are copied unchanged
```

If WebP conversion is enabled, the uploaded filename changes to `.webp`, and the inserted Markdown path uses that filename.

Implementation note:

```text
/admin/ uses browser-side image processing so it still works on static hosting
CLI add-assets uses local sharp for the same options
```

The project still keeps the content model in Markdown files plus asset folders. That leaves room to later swap local file access for cloud object storage or a database-backed admin without changing how posts and assets are organized.

In Markdown paths, do not write `public`. Public files are referenced from the site root.

## Markdown And Frontmatter

Each post is one `.md` file. The top block between `---` lines is frontmatter. Frontmatter is metadata; the text after it is the post body.

Example:

```md
---
postId: "b6a1c0a6-3df8-4f6a-9e9a-44e08c1b9b42"
slug: "my-first-post"
title: "My First Post"
description: "A short summary."
date: 2026-04-28
updated: 2026-04-28
category: "Notes"
tags:
  - astro
  - markdown
author: "Author"
assetDir: "/images/posts/b6a1c0a6-3df8-4f6a-9e9a-44e08c1b9b42/"
cover: "/images/posts/b6a1c0a6-3df8-4f6a-9e9a-44e08c1b9b42/cover.jpg"
draft: true
---

Write the post body here.
```

You can edit:

```text
slug, title, description, date, updated, category, tags, author, cover, draft, body
```

Avoid changing:

```text
postId, Markdown filename, asset folder name
```

The reference file is:

```text
src/content/posts/_draft-template.md
```

It is only a reference and is not published because it has `draft: true`. If you temporarily change it to `draft: false`, it becomes available at:

```text
/posts/draft-template/
```

Change it back to `draft: true` if you want it to remain only a reference.

## postId And Slug

`postId` is a random UUID. It is generated when a post is created. It is used for:

```text
Markdown filename
asset folder
assetDir
```

`slug` is the public URL part:

```text
/posts/{slug}/
```

The slug can change when the title changes. In `/admin/`, click `Regenerate Slug`. In the CLI, run:

```bash
npm run update-slug
```

Old slugs are not stored. If the slug changes, the old URL stops working unless you add redirects yourself.

Chinese titles are not automatically converted to pinyin. Write your own English or pinyin slug if you want a readable URL. Otherwise the fallback is:

```text
post-{first-8-chars-of-postId}
```

## Navigation And Generated Pages

The top navigation is not stored in Markdown. It is built by:

```text
src/site.config.ts           navigation labels
src/components/Header.astro  header markup and links
```

Default navigation labels are in `copy.en.nav`:

```ts
nav: {
  home: 'Home',
  archives: 'Archives',
  categories: 'Categories',
  tags: 'Tags',
  about: 'About',
  admin: 'Admin',
  rss: 'RSS'
}
```

The routes are:

```text
Home        /                 src/pages/index.astro
Archives    /archives/        src/pages/archives.astro
Categories  /categories/      src/pages/categories.astro
Tags        /tags/            src/pages/tags.astro
About       /about/           src/pages/about.astro
Admin       /admin/           src/pages/admin.astro
RSS         /rss.xml          src/pages/rss.xml.js
```

The generated pages read published Markdown posts:

```text
/archives/              reads date from every published post
/archives/{year}/{mm}/  lists posts in that year/month
/categories/            reads category from every published post
/category/{category}/   lists posts with that category
/tags/                  reads all tags from every published post
/tag/{tag}/             lists posts containing that tag
```

For example:

```md
date: 2026-04-28
category: "Notes"
tags:
  - astro
  - markdown
draft: false
```

This post appears in:

```text
/archives/2026/04/
/category/Notes/
/tag/astro/
/tag/markdown/
```

`/about/` is different. It does not read posts. It reads this section in `src/site.config.ts`:

```ts
about: {
  title: 'About This Site',
  paragraphs: [...],
  principlesTitle: 'Design Principles',
  principles: [...]
}
```

## RSS

The RSS feed is:

```text
/rss.xml
```

The source file is:

```text
src/pages/rss.xml.js
```

RSS reads published posts through:

```text
src/lib.ts -> getPublishedPosts()
```

`getPublishedPosts()` reads the Astro content collection in:

```text
src/content.config.ts
```

That collection loads:

```text
src/content/posts/**/*.{md,mdx}
```

RSS only includes posts with:

```md
draft: false
```

The feed is RSS 2.0 XML generated by `@astrojs/rss`.

Each post becomes one `<item>`:

```text
item title        <- post frontmatter title
item description  <- post frontmatter description
item pubDate      <- post frontmatter date
item link         <- /posts/{slug}/
```

The channel fields at the top of RSS:

```xml
<title>File-Based Astro Blog</title>
<description>A quiet static blog template powered by Markdown files.</description>
<link>https://your-domain.com/</link>
```

come from two places:

```text
<title>        src/site.config.ts -> copy.site.title
<description>  src/site.config.ts -> copy.site.description
<link>         astro.config.mjs -> site
```

Before deployment, edit:

```js
export default defineConfig({
  site: 'https://your-domain.com',
  output: 'static'
});
```

To inspect RSS locally, run `npm run dev` and open:

```text
http://localhost:4321/rss.xml
```

## Asset Folders

There are two built-in image areas:

```text
public/images/posts/{postId}/  assets for one specific post
public/images/site/            site-wide images
```

Use `public/images/posts/{postId}/` for post images, downloads, screenshots, scans, and post cover images.

Use `public/images/site/` for global images such as:

```text
public/images/site/header.jpg
public/images/site/body.jpg
```

This template does not create date folders by default. Archive pages are generated from frontmatter `date`; they are not physical folders.

If you want date-based organization, create subfolders inside a post asset folder:

```text
public/images/posts/{postId}/2026-04-28/photo.jpg
```

That file is still connected to the post through `postId`.

## Prompt Copy Configuration

Prompt and helper copy is configured in [`src/site.config.ts`](./src/site.config.ts).

This file contains both locales:

```ts
copy.en
copy['zh-CN']
```

The homepage notice is configured by:

```ts
copy.en.home.notice
copy['zh-CN'].home.notice
```

Set a field to an empty string to hide that block in the rendered page:

```ts
notice: ''
```

The following copy fields can also be hidden the same way:

```text
copy.en.site.description
copy['zh-CN'].site.description

copy.en.site.footer
copy['zh-CN'].site.footer

copy.en.sidebar.aboutTitle
copy['zh-CN'].sidebar.aboutTitle

copy.en.sidebar.aboutText
copy['zh-CN'].sidebar.aboutText

copy.en.home.notice
copy['zh-CN'].home.notice

copy.en.admin.intro
copy['zh-CN'].admin.intro

copy.en.admin.rootHelp
copy['zh-CN'].admin.rootHelp

copy.en.admin.assetHintBeforePost
copy['zh-CN'].admin.assetHintBeforePost
```

Notes:

1. English and Chinese are configured separately. Clear both locale values if both versions should be hidden.
2. Buttons, navigation labels, field labels, and status messages are also defined in `src/site.config.ts`, but they are part of the working UI and are not intended to be hidden.

## CLI Commands

```bash
npm run dev           # local dev server
npm run build         # check and build dist/
npm run preview       # preview dist/
npm run new-post      # create a draft post and asset folder
npm run edit-post     # open a Markdown post
npm run update-slug   # regenerate slug from title
npm run preview-post  # render one post to .post-preview/
npm run open-assets   # open or print a post asset folder
npm run add-assets    # copy files into a post asset folder
```

Examples:

```bash
npm run edit-post -- 1
npm run update-slug -- my-post
npm run preview-post -- my-post --no-open
npm run open-assets -- my-post --print
npm run add-assets -- my-post ./cover.jpg
npm run add-assets -- my-post ./cover.jpg --webp
npm run add-assets -- my-post ./cover.jpg ./photo.png --strip-metadata
npm run add-assets -- my-post ./cover.jpg ./scan.png --webp --strip-metadata
```

`add-assets` options:

```text
--webp             convert supported static JPEG/PNG/WebP images to .webp
--strip-metadata   re-encode supported static JPEG/PNG/WebP images without metadata
```

Files that are not static JPEG, PNG, or WebP are copied unchanged.

Implementation note:

```text
CLI processing uses local sharp
/admin/ processing uses browser APIs for static-hosting compatibility
```

## Deployment

Build command:

```bash
npm run build
```

Output folder:

```text
dist/
```

Generic static hosting settings:

```text
Install command: npm install
Build command:   npm run build
Output folder:   dist
```

Root-domain deployment:

```js
export default defineConfig({
  site: 'https://your-domain.com',
  output: 'static'
});
```

GitHub Pages project site:

```js
export default defineConfig({
  site: 'https://your-name.github.io',
  base: '/repo-name',
  output: 'static'
});
```

User or organization GitHub Pages site usually does not need `base`.

## Future Extension Points

Current storage:

```text
/admin/ -> File System Access API -> local Markdown and assets
```

The local storage boundary is:

```text
src/admin/local-file-storage.js
```

Future storage adapters can target an API, database, object storage, or Git-backed CMS. This template keeps that path open, but does not implement cloud storage yet.
