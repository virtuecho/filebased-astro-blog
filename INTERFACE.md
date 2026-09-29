# Interface and Site Settings

The JSON code block below is the single source for interface copy, theme, and
typography. Edit its values while keeping the keys and value types unchanged.
These values are both the active settings and the template defaults. The build
reads only the `json site-settings` block; Markdown text and comments outside it
are ignored.

Standard JSON does not allow comments. Put explanations in the Markdown body
outside the settings block.

## Search text

`nav.search` and `pages.searchTitle` name the navigation link and search page.
The `search` values control the field label, placeholder, help, loading, empty
result, result count, and error messages. Keep `{count}` in `search.results`;
the page replaces it with the number of matches. Search matches the displayed
title (which falls back to the filename), description, explicit category, tags,
and Markdown body. It ignores dates and the default `Uncategorized` category.
Matching ignores letter case; each space-separated term must appear as a
substring somewhere in the searchable text.

## Theme settings

The `theme` values control the site's main appearance without editing CSS.

### Background images

`bodyBackgroundImage`, `siteBackgroundImage`, and `headerBackgroundImage` set
images behind the page, the site canvas, and the header. The paths below are
examples and do not exist yet. Local images belong in `public/`; for example,
`/images/site/header.webp` refers to `public/images/site/header.webp`. Replace
each example path with a real image path. Until then, the browser will request
a missing image.

### Colors

The `colors` object contains CSS colors used by the site:

| Setting                       | Used for                                          |
| ----------------------------- | ------------------------------------------------- |
| `pageBackground`              | Area behind the site canvas                       |
| `siteBackground`              | Main site canvas                                  |
| `headerBackground`            | Header background                                 |
| `text`                        | Main text                                         |
| `mutedText`                   | Secondary text, such as dates                     |
| `border`                      | Dividers and borders                              |
| `link`                        | Links and the active pagination button background |
| `softBackground`              | Navigation, tags, and secondary surfaces          |
| `subtleText`                  | Excerpts and tag text                             |
| `codeBackground` / `codeText` | Code block background and text                    |
| `highlightBackground`         | Highlighted text                                  |
| `calloutAccent`               | Obsidian callout accent border                    |
| `paginationActiveText`        | Text on the active pagination button              |

`headerTextColor` and `headerDescriptionColor` also accept CSS colors.
`var(--text)` and `var(--muted)` reuse the values in the `colors` object.

### Layout and typography

`siteMaxWidth` and `headerMinHeight` are CSS lengths, such as `1120px` and
`120px`. `baseFontSize` is a CSS font size, and `lineHeight` controls line
spacing. `headingFontFamily: "inherit"` reuses the body font;
`headingFontWeight: "700"` makes headings bold.

`typography.fontFamily` is a fallback list. The browser uses the first font
available on the device; it does not download these fonts. `system-ui` means
the operating system's interface font. `codeFontFamily` is a fallback list for
monospace fonts used by code.

Detailed component spacing and layout rules remain in `src/styles.css`.

```json site-settings
{
  "site": {
    "title": "File-Based Astro Blog",
    "description": "A quiet static blog template powered by Markdown files.",
    "footer": "Built with Astro. Deployable to any static hosting platform."
  },
  "nav": {
    "home": "Home",
    "search": "Search",
    "archives": "Archives",
    "categories": "Categories",
    "tags": "Tags",
    "about": "About"
  },
  "home": {
    "title": "Latest Posts",
    "empty": "No posts yet."
  },
  "search": {
    "inputLabel": "Search posts",
    "placeholder": "Search titles and article text",
    "help": "Search titles, descriptions, categories, tags, and Markdown text. All words must match.",
    "loading": "Loading search index...",
    "noResults": "No matching posts.",
    "results": "{count} posts found.",
    "error": "Could not load the search index. Please try again."
  },
  "about": {
    "title": "About This Site",
    "paragraphs": [
      "A static blog generated from Obsidian-friendly Markdown files.",
      "Astro turns each note into a public page and builds the archives, categories, and tags."
    ],
    "principlesTitle": "Design Principles",
    "principles": [
      "Portable Markdown content",
      "Readable archive, category, and tag pages",
      "Static output with no database"
    ]
  },
  "sidebar": {
    "aboutTitle": "About",
    "aboutText": "A file-based static blog: simple, fast, and easy to migrate.",
    "recentPosts": "Recent Posts",
    "categories": "Categories",
    "tags": "Tags",
    "archives": "Archives"
  },
  "labels": {
    "published": "Published",
    "updated": "Updated",
    "category": "Category",
    "tag": "Tag",
    "archive": "Archive",
    "pagination": "Pagination",
    "firstPage": "First page",
    "previousPage": "Previous",
    "nextPage": "Next",
    "lastPage": "Last page"
  },
  "pages": {
    "archivesTitle": "Monthly Archives",
    "categoriesTitle": "Categories",
    "tagsTitle": "Tags",
    "searchTitle": "Search Posts"
  },
  "contentDefaults": {
    "category": "Uncategorized"
  },
  "theme": {
    "bodyBackgroundImage": "/images/site/example-body-background.webp",
    "siteBackgroundImage": "/images/site/example-site-background.webp",
    "headerBackgroundImage": "/images/site/example-header-background.webp",
    "headerMinHeight": "120px",
    "headerTextColor": "var(--text)",
    "headerDescriptionColor": "var(--muted)",
    "siteMaxWidth": "1120px",
    "colors": {
      "pageBackground": "#eeeeee",
      "siteBackground": "#ffffff",
      "headerBackground": "#ffffff",
      "text": "#222222",
      "mutedText": "#777777",
      "border": "#d8d8d8",
      "link": "#0645ad",
      "softBackground": "#f7f7f7",
      "subtleText": "#444444",
      "codeBackground": "#f6f8fa",
      "codeText": "#1f2328",
      "highlightBackground": "#fff1a8",
      "calloutAccent": "#8a9bb0",
      "paginationActiveText": "#ffffff"
    },
    "typography": {
      "fontFamily": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', 'Noto Sans JP', sans-serif",
      "baseFontSize": "16px",
      "lineHeight": "1.75",
      "headingFontFamily": "inherit",
      "headingFontWeight": "700",
      "codeFontFamily": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    }
  }
}
```
