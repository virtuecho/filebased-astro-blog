# Architecture

This is a static blog generated from Obsidian-friendly Markdown files. Astro
reads the notes and site settings, then builds the website, RSS feed, and
sitemap. There is no local writing page, draft workflow, attachment manager,
database, or server backend.

```text
src/content/posts/**/*.md + src/site-settings.json
                     |
                    Astro
                     |
        static pages + RSS + sitemap
                     |
             static hosting
```

## Content

Every `.md` file under `src/content/posts/` becomes a public post. Its relative
path, without the `.md` extension, is the post route and the target used by
Obsidian wikilinks. For example:

```text
src/content/posts/notes/First Note.md -> /posts/notes/first-note/
```

The homepage and post listings sort by resolved creation date, newest first. File
names determine URLs and do not determine display order. A basename wikilink
such as `[[Note]]` must match exactly one note in the full collection. Use a
folder-qualified path when names repeat, such as `[[projects/Note]]`; ambiguous
short links fail the build. Slug collisions between different paths also fail
the build.

YAML frontmatter is optional. When omitted, the title comes from the file name.
An explicit `date` property overrides the note's creation date. For committed
notes, the first Git commit that added the file supplies that date; uncommitted
notes use the filesystem creation time. Category and author have locale
defaults, and tags default to an empty list. Repeated filenames keep the same
display title; their creation dates are shown in the list, sorted newest first.

There is no draft state. Only put content intended for publication in the
collection directory. Binary files and Obsidian `![[...]]` embeds are not
managed or published as post attachments.

## Obsidian Markdown

Astro provides standard Markdown and GitHub Flavored Markdown. Remark plugins
parse wikilinks, highlights, comments, tags, math, and Obsidian task markers;
rehype plugins render callouts and math. Wikilinks and Markdown links to notes
map to `/posts/` routes, tags and highlights render inline, and comments are
removed from published HTML.

Supported examples:

```md
[[Other Note]]
[[Other Note#A Heading|read this section]]

> [!tip] A callout
> Helpful information.

==Highlighted text==
#topic
$$x^2$$

- [/] In progress
  %%Private author note%%
```

File embeds, block references, and community-plugin syntax such as Dataview are
outside this template's scope.

## Site Settings

`src/site-settings.json` is the user-editable source of truth for localized site
copy, locale, theme, and typography. `src/site.config.ts` provides typed access
to those settings.

## Static Routes

Astro pages build the homepage, post pages, archive pages, categories, tags,
about page, RSS feed, and sitemap from the content collection. Post routes use
the note's relative file path. The directory path is preserved in the public
URL, and renaming a note changes that URL.

## Non-goals

- Local browser-based writing or settings UI
- Draft and unpublished-content filtering
- Post attachment management or image processing
- Database, login system, backend, or cloud CMS
