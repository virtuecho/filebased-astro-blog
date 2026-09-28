import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { getCollection } from 'astro:content';
import { dateLocale } from './site.config';

const postsRoot = resolve(process.cwd(), 'src/content/posts');
let createdDates: Map<string, Date> | undefined;

function hasMarkdownNotes(directory = postsRoot): boolean {
  return readdirSync(directory, { withFileTypes: true }).some((entry) => {
    if (entry.name.startsWith('.')) return false;
    if (entry.isDirectory())
      return hasMarkdownNotes(resolve(directory, entry.name));
    return entry.isFile() && entry.name.endsWith('.md');
  });
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
        if (!createdDates.has(path)) createdDates.set(path, date);
      }
    }
  } catch {
    // File creation time below still works outside a Git checkout.
  }

  return createdDates;
}

function fileCreationDate(filePath?: string) {
  if (!filePath) return undefined;

  const path = relative(postsRoot, filePath).split(sep).join('/');
  const committedDate = getCommittedCreationDates().get(path);
  if (committedDate) return committedDate;

  try {
    const created = statSync(filePath).birthtime;
    return created.getTime() > 0 ? created : undefined;
  } catch {
    return undefined;
  }
}

function notePath(filePath: string | undefined, id: string) {
  return filePath
    ? relative(postsRoot, filePath).split(sep).join('/').replace(/\.md$/i, '')
    : id;
}

function fallbackTitle(path: string) {
  return basename(path);
}

export async function getPosts() {
  if (!hasMarkdownNotes()) return [];

  const entries = await getCollection('posts');
  const paths = entries.map((post) => notePath(post.filePath, post.id));
  const posts = entries.map((post, index) => ({
    ...post,
    data: {
      ...post.data,
      title: post.data.title?.trim() || fallbackTitle(paths[index]),
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
  const path = post.id
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/posts/${path}/`;
}

export function formatDate(date?: Date) {
  if (!date) return '';
  return new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function slugifyText(text: string) {
  return encodeURIComponent(text.trim().toLowerCase().replaceAll(' ', '-'));
}

export function unslugifyText(text: string) {
  return decodeURIComponent(text);
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
