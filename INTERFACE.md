# Interface and Site Settings

The JSON code block below is the single source for interface copy, theme, and
typography. Edit its values while keeping the keys and value types unchanged.
These values are both the active settings and the template defaults. The build
reads only the `json site-settings` block; Markdown text and comments outside it
are ignored.

Standard JSON does not allow comments. Put explanations in the Markdown body
outside the settings block.

```json site-settings
{
  "site": {
    "title": "File-Based Astro Blog",
    "description": "A quiet static blog template powered by Markdown files.",
    "footer": "Built with Astro. Deployable to any static hosting platform."
  },
  "nav": {
    "home": "Home",
    "archives": "Archives",
    "categories": "Categories",
    "tags": "Tags",
    "about": "About"
  },
  "home": {
    "title": "Latest Posts",
    "empty": "No posts yet."
  },
  "about": {
    "title": "About This Site",
    "paragraphs": [
      "A static blog generated from Obsidian-friendly Markdown files.",
      "Astro turns each note into a public page and builds the archives, categories, tags, and sitemap."
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
    "tagsTitle": "Tags"
  },
  "contentDefaults": {
    "category": "Uncategorized"
  },
  "theme": {
    "bodyBackgroundImage": "",
    "siteBackgroundImage": "",
    "headerBackgroundImage": "",
    "headerMinHeight": "120px",
    "headerTextColor": "",
    "headerDescriptionColor": "",
    "typography": {
      "fontFamily": "",
      "baseFontSize": "",
      "lineHeight": "",
      "headingFontFamily": "",
      "headingFontWeight": "",
      "codeFontFamily": ""
    }
  }
}
```
