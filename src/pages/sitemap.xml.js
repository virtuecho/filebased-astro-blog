import { getPublishedPosts, groupByMonth } from '../lib';
import { postUrl } from '../content-workflow';

export async function GET({ site }) {
  const posts = await getPublishedPosts();
  const urls = new Set(['/', '/archives/', '/categories/', '/tags/', '/about/']);

  for (const post of posts) {
    urls.add(postUrl(post.data, post.id));
    urls.add(`/category/${encodeURIComponent(post.data.category)}/`);
    for (const tag of post.data.tags) urls.add(`/tag/${encodeURIComponent(tag)}/`);
  }

  for (const key of groupByMonth(posts).keys()) {
    const [year, month] = key.split('/');
    urls.add(`/archives/${year}/${month}/`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls]
    .map((url) => `  <url><loc>${new URL(url, site).toString()}</loc></url>`)
    .join('\n')}\n</urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
