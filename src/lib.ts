import { getCollection } from 'astro:content';
import { dateLocale } from './site.config';

export async function getPublishedPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function slugifyText(text: string) {
  return encodeURIComponent(text.trim().toLowerCase().replaceAll(' ', '-'));
}

export function unslugifyText(text: string) {
  return decodeURIComponent(text);
}

export function groupByMonth(posts: Awaited<ReturnType<typeof getPublishedPosts>>) {
  const map = new Map<string, typeof posts>();
  for (const post of posts) {
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
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
