---
site:
  title: File-Based Astro Blog
  description: A quiet static blog template powered by Markdown files.
  footer: Built with Astro. Deployable to any static hosting platform.
nav:
  home: Home
  archives: Archives
  categories: Categories
  tags: Tags
  about: About
  rss: RSS
home:
  title: Latest Posts
  empty: No posts yet.
about:
  title: About This Site
  paragraphs:
    - A static blog generated from Obsidian-friendly Markdown files.
    - Astro turns each note into a public page and builds the archives, categories, tags, RSS feed, and sitemap.
  principlesTitle: Design Principles
  principles:
    - Portable Markdown content
    - Readable archive, category, and tag pages
    - Static output with no database
sidebar:
  aboutTitle: About
  aboutText: 'A file-based static blog: simple, fast, and easy to migrate.'
  recentPosts: Recent Posts
  categories: Categories
  tags: Tags
  archives: Archives
labels:
  published: Published
  updated: Updated
  category: Category
  tag: Tag
  archive: Archive
  pagination: Pagination
  firstPage: First page
  previousPage: Previous
  nextPage: Next
  lastPage: Last page
pages:
  archivesTitle: Monthly Archives
  categoriesTitle: Categories
  tagsTitle: Tags
contentDefaults:
  category: Uncategorized
---

# Interface copy

Edit the values in the YAML block above to change the website's interface text. Keep the section and key names unchanged. The build uses English (`en`) and formats dates with `en-US`.

## Initial defaults (reference only)

This is the interface text and content metadata supplied by the template. It is here to help restore the original values; the build reads only the YAML frontmatter above. Theme defaults are in `.config/site-settings.json`.

```yaml
site:
  title: File-Based Astro Blog
  description: A quiet static blog template powered by Markdown files.
  footer: Built with Astro. Deployable to any static hosting platform.
nav:
  home: Home
  archives: Archives
  categories: Categories
  tags: Tags
  about: About
  rss: RSS
home:
  title: Latest Posts
  empty: No posts yet.
about:
  title: About This Site
  paragraphs:
    - A static blog generated from Obsidian-friendly Markdown files.
    - Astro turns each note into a public page and builds the archives, categories, tags, RSS feed, and sitemap.
  principlesTitle: Design Principles
  principles:
    - Portable Markdown content
    - Readable archive, category, and tag pages
    - Static output with no database
sidebar:
  aboutTitle: About
  aboutText: 'A file-based static blog: simple, fast, and easy to migrate.'
  recentPosts: Recent Posts
  categories: Categories
  tags: Tags
  archives: Archives
labels:
  published: Published
  updated: Updated
  category: Category
  tag: Tag
  archive: Archive
  pagination: Pagination
  firstPage: First page
  previousPage: Previous
  nextPage: Next
  lastPage: Last page
pages:
  archivesTitle: Monthly Archives
  categoriesTitle: Categories
  tagsTitle: Tags
contentDefaults:
  category: Uncategorized
```
