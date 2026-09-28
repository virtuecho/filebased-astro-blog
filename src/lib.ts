import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { getCollection } from 'astro:content';
import { dateLocale } from './site.config';

const postsRoot = resolve(process.cwd(), 'src/content/posts');
let createdDates: Map<string, Date> | undefined;

function hasMarkdownNotes() {
  if (!existsSync(postsRoot)) return false;

  const entries = readdirSync(postsRoot, { withFileTypes: true });
  const folder = entries.find(
    (entry) => entry.isDirectory() && !entry.name.startsWith('.'),
  );
  if (folder) {
    throw new Error(
      `Keep Markdown posts directly inside "src/content/posts/"; found subfolder "${folder.name}".`,
    );
  }
  return entries.some((entry) => entry.isFile() && entry.name.endsWith('.md'));
}

function getCommittedCreationDates() {
  if (createdDates) return createdDates;

  createdDates = new Map();
  try {
    const output = execFileSync(
      'git',
      [
        'log',
        '-z',
        '--diff-filter=A',
        '--no-renames',
        '--format=%x00%cI',
        '--name-only',
        '--',
        'src/content/posts',
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );

    let date: Date | undefined;
    for (const token of output.split('\0')) {
      const line = token.replace(/^\r?\n/, '');
      if (/^\d{4}-\d{2}-\d{2}T/.test(line)) {
        date = new Date(line);
      } else if (
        date &&
        line.startsWith('src/content/posts/') &&
        line.endsWith('.md')
      ) {
        const path = line.replace(/^src\/content\/posts\//, '');
        if (!path.includes('/') && !createdDates.has(path))
          createdDates.set(path, date);
      }
    }
  } catch {
    // File creation time below still works outside a Git checkout.
  }

  return createdDates;
}

function fileCreationDate(filePath?: string) {
  if (!filePath) return undefined;

  const path = basename(filePath);
  const committedDate = getCommittedCreationDates().get(path);
  if (committedDate) return committedDate;

  try {
    const created = statSync(filePath).birthtime;
    return created.getTime() > 0 ? created : undefined;
  } catch {
    return undefined;
  }
}

export async function getPosts() {
  if (!hasMarkdownNotes()) return [];

  const entries = await getCollection('posts');
  const posts = entries.map((post) => ({
    ...post,
    data: {
      ...post.data,
      title:
        post.data.title?.trim() ||
        basename(post.filePath || post.id).replace(/\.md$/i, ''),
      date: post.data.date || fileCreationDate(post.filePath),
    },
  }));

  return posts.sort((a, b) => {
    const aDate = a.data.date?.getTime();
    const bDate = b.data.date?.getTime();
    if (aDate === undefined)
      return bDate === undefined ? a.id.localeCompare(b.id) : 1;
    if (bDate === undefined) return -1;
    return bDate - aDate || a.id.localeCompare(b.id);
  });
}

export function postUrl(post: { id: string }) {
  return `/posts/${encodeURIComponent(post.id)}/`;
}

export function formatDate(date?: Date) {
  if (!date) return '';
  return new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function groupByMonth(posts: Awaited<ReturnType<typeof getPosts>>) {
  const map = new Map<string, typeof posts>();
  for (const post of posts) {
    if (!post.data.date) continue;
    const y = post.data.date.getFullYear();
    const m = String(post.data.date.getMonth() + 1).padStart(2, '0');
    const key = `${y}/${m}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return map;
}

export function countItems(items: string[]) {
  const map = new Map<string, number>();
  for (const item of items) map.set(item, (map.get(item) ?? 0) + 1);
  return [...map.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
}
