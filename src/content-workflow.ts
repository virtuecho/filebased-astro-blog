// Default values used when creating a new post
export type ContentDefaults = {
  untitledDraft: string;
  unnamedPost: string;
  category: string;
  author: string;
  body: string;
};

// Shape of the YAML frontmatter block in a post's index.md
export type PostFrontmatter = {
  postId?: string;
  slug?: string;
  title?: string;
  description?: string;
  date?: string | Date;
  updated?: string | Date;
  category?: string;
  tags?: string[];
  author?: string;
  assetDir?: string;
  cover?: string;
  draft?: boolean;
  [key: string]: unknown;
};

// Hardcoded fallback defaults used when no site config is available
const fallbackDefaults: ContentDefaults = {
  untitledDraft: 'Untitled Draft',
  unnamedPost: 'Untitled Post',
  category: 'Uncategorized',
  author: 'Author',
  body: '## Section Heading\n\nStart writing your post here.\n'
};

// Format a Date as YYYY-MM-DD in local time
export function todayLocalDate(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate a UUID v4 post ID; accepts an optional override for testing
export function createPostId(randomUuid?: () => string) {
  if (randomUuid) return randomUuid();
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Fallback to Math.random when crypto API is unavailable
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Set UUID v4 variant (10xx) and version (0100) bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Derive a human-readable slug from a post ID when no title is available
export function fallbackSlugFromPostId(postId: string) {
  return `post-${String(postId || 'draft').slice(0, 8)}`;
}

// Convert arbitrary text into a clean URL-safe slug
export function normalizeSlug(value = '') {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD') // Decompose accented characters to base + combining marks
    .replace(/[^\w\s-]/g, '') // Remove everything except word chars, spaces, hyphens
    .replace(/[\s_]+/g, '-') // Replace whitespace/underscores with hyphens
    .replace(/-+/g, '-') // Collapse consecutive hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

// Create a slug from a string, falling back to a default if the result is empty
export function slugify(value = '', fallback = '') {
  return normalizeSlug(value) || fallback;
}

// Generate a slug from a title, falling back to a post-ID-based slug
export function slugFromTitle(title = '', postId = '') {
  return slugify(title, fallbackSlugFromPostId(postId));
}

// Filename used for every post's markdown entry point
export const INDEX_FILE = 'index.md';

// Build the public URL path for a post from its slug or ID
export function postUrl(data: { slug?: unknown; postId?: unknown }, fallbackId = '') {
  return `/posts/${String(data.slug || fallbackId || data.postId)}/`;
}

// Remove surrounding single or double quotes from a string
function stripQuotes(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

// Parse a raw frontmatter value into its proper JS type (bool, array, string)
function parseScalar(value: string) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === '[]') return [];
  // Handle quoted strings — attempt JSON parse for escape handling, fall back to stripping
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return stripQuotes(trimmed);
    }
  }
  return stripQuotes(trimmed);
}

// Parse a markdown string with YAML frontmatter into structured data and body
export function parseMarkdown(markdown: string): { data: PostFrontmatter; body: string } {
  // No frontmatter delimiter — treat entire content as body
  if (!markdown.startsWith('---')) {
    return { data: {}, body: markdown };
  }

  // Find the closing frontmatter delimiter
  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: markdown };

  // Extract the raw frontmatter block and the markdown body
  const raw = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).replace(/^\r?\n/, '');
  const data: PostFrontmatter = {};
  const lines = raw.split(/\r?\n/);

  // Walk every line of the frontmatter to build the data object
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    const value = match[2].trim();

    // Tags can span multiple lines as a YAML list
    if (key === 'tags') {
      const tags: string[] = [];
      if (value === '[]') {
        data.tags = [];
        continue;
      }
      while (lines[i + 1]?.trim().startsWith('- ')) {
        i += 1;
        tags.push(stripQuotes(lines[i].trim().replace(/^- /, '').trim()));
      }
      data.tags = tags;
      continue;
    }

    data[key] = parseScalar(value);
  }

  return { data, body };
}

// Serialize a value as a YAML-safe string via JSON.stringify
function yamlString(value: unknown) {
  return JSON.stringify(value ?? '');
}

// Append a key: value YAML line to lines[], skipping falsy/empty values
function appendScalar(lines: string[], key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  // Booleans are written without quotes for cleaner YAML
  if (typeof value === 'boolean') {
    lines.push(`${key}: ${value}`);
    return;
  }
  lines.push(`${key}: ${yamlString(value)}`);
}

// Apply defaults and normalize types for all frontmatter fields
export function normalizePostData(data: PostFrontmatter, defaults: Partial<ContentDefaults> = {}) {
  const mergedDefaults = { ...fallbackDefaults, ...defaults };
  const postId = String(data.postId || createPostId());
  const title = String(data.title || mergedDefaults.untitledDraft);
  const date = data.date instanceof Date ? todayLocalDate(data.date) : String(data.date || todayLocalDate());

  return {
    ...data,
    postId,
    slug: String(data.slug || slugFromTitle(title, postId)),
    title,
    description: data.description ? String(data.description) : undefined,
    date,
    updated: data.updated instanceof Date ? todayLocalDate(data.updated) : data.updated ? String(data.updated) : undefined,
    category: String(data.category || mergedDefaults.category),
    tags: Array.isArray(data.tags) ? data.tags.map(String).filter(Boolean) : [],
    author: String(data.author || mergedDefaults.author),
    cover: data.cover ? String(data.cover) : undefined,
    // Drafts are true by default; explicitly setting false opts out
    draft: data.draft !== false
  } satisfies PostFrontmatter;
}

// Serialize frontmatter + body back into a full index.md string
export function buildMarkdown(data: PostFrontmatter, body: string, defaults: Partial<ContentDefaults> = {}) {
  const normalized = normalizePostData(data, defaults);
  const tags = Array.isArray(normalized.tags) ? normalized.tags : [];
  const lines = [
    '---',
    `postId: ${yamlString(normalized.postId)}`,
    `slug: ${yamlString(normalized.slug)}`,
    `title: ${yamlString(normalized.title)}`
  ];

  appendScalar(lines, 'description', normalized.description);
  lines.push(`date: ${normalized.date}`);
  if (normalized.updated) lines.push(`updated: ${normalized.updated}`);
  appendScalar(lines, 'category', normalized.category);

  // Render tags as a YAML list or empty inline array
  if (tags.length > 0) {
    lines.push('tags:');
    for (const tag of tags) lines.push(`  - ${tag}`);
  } else {
    lines.push('tags: []');
  }

  appendScalar(lines, 'author', normalized.author);
  appendScalar(lines, 'cover', normalized.cover);
  lines.push(`draft: ${normalized.draft}`);

  // Emit known fields so we can skip them when iterating custom fields
  const knownFields = new Set([
    'postId',
    'slug',
    'title',
    'description',
    'date',
    'updated',
    'category',
    'tags',
    'author',
    'cover',
    'draft'
  ]);

  // Serialize any unrecognized / user-defined frontmatter keys
  for (const [key, value] of Object.entries(data)) {
    if (knownFields.has(key) || !/^[A-Za-z0-9_]+$/.test(key)) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) lines.push(`${key}: []`);
      else {
        lines.push(`${key}:`);
        for (const item of value) lines.push(`  - ${item}`);
      }
      continue;
    }
    appendScalar(lines, key, value);
  }

  lines.push('---', '', body.trimStart());
  return `${lines.join('\n')}\n`;
}
