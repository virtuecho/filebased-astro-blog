export type ContentDefaults = {
  untitledDraft: string;
  unnamedPost: string;
  category: string;
  author: string;
  body: string;
};

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

const fallbackDefaults: ContentDefaults = {
  untitledDraft: 'Untitled Draft',
  unnamedPost: 'Untitled Post',
  category: 'Uncategorized',
  author: 'Author',
  body: '## Section Heading\n\nStart writing your post here.\n'
};

export function todayLocalDate(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createPostId(randomUuid?: () => string) {
  if (randomUuid) return randomUuid();
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function fallbackSlugFromPostId(postId: string) {
  return `post-${String(postId || 'draft').slice(0, 8)}`;
}

export function normalizeSlug(value = '') {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugify(value = '', fallback = '') {
  return normalizeSlug(value) || fallback;
}

export function slugFromTitle(title = '', postId = '') {
  return slugify(title, fallbackSlugFromPostId(postId));
}

export function assetDirForPostId(postId: string) {
  return `/images/posts/${postId}/`;
}

export function publicAssetDir(assetDir: string) {
  return `public${assetDir}`;
}

export function postFileName(postId: string) {
  return `${postId}.md`;
}

export function postUrl(data: { slug?: unknown; postId?: unknown }, fallbackId = '') {
  return `/posts/${String(data.slug || fallbackId || data.postId)}/`;
}

function stripQuotes(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function parseScalar(value: string) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === '[]') return [];
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return stripQuotes(trimmed);
    }
  }
  return stripQuotes(trimmed);
}

export function parseMarkdown(markdown: string): { data: PostFrontmatter; body: string } {
  if (!markdown.startsWith('---')) {
    return { data: {}, body: markdown };
  }

  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: markdown };

  const raw = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).replace(/^\r?\n/, '');
  const data: PostFrontmatter = {};
  const lines = raw.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    const value = match[2].trim();

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

function yamlString(value: unknown) {
  return JSON.stringify(value ?? '');
}

function appendScalar(lines: string[], key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  if (typeof value === 'boolean') {
    lines.push(`${key}: ${value}`);
    return;
  }
  lines.push(`${key}: ${yamlString(value)}`);
}

export function normalizePostData(data: PostFrontmatter, defaults: Partial<ContentDefaults> = {}) {
  const mergedDefaults = { ...fallbackDefaults, ...defaults };
  const postId = String(data.postId || createPostId());
  const title = String(data.title || mergedDefaults.untitledDraft);
  const date = data.date instanceof Date ? todayLocalDate(data.date) : String(data.date || todayLocalDate());
  const assetDir = String(data.assetDir || assetDirForPostId(postId));
  const tags = Array.isArray(data.tags) ? data.tags.map(String).filter(Boolean) : [];

  return {
    ...data,
    postId,
    slug: String(data.slug || slugFromTitle(title, postId)),
    title,
    description: data.description ? String(data.description) : undefined,
    date,
    updated: data.updated instanceof Date ? todayLocalDate(data.updated) : data.updated ? String(data.updated) : undefined,
    category: String(data.category || mergedDefaults.category),
    tags,
    author: String(data.author || mergedDefaults.author),
    assetDir,
    cover: data.cover ? String(data.cover) : undefined,
    draft: data.draft !== false
  } satisfies PostFrontmatter;
}

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

  if (tags.length > 0) {
    lines.push('tags:');
    for (const tag of tags) lines.push(`  - ${tag}`);
  } else {
    lines.push('tags: []');
  }

  appendScalar(lines, 'author', normalized.author);
  appendScalar(lines, 'assetDir', normalized.assetDir);
  appendScalar(lines, 'cover', normalized.cover);
  lines.push(`draft: ${normalized.draft}`);

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
    'assetDir',
    'cover',
    'draft'
  ]);

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
