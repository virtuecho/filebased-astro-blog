import { getPosts, groupByMonth, postUrl, tagUrl } from '../lib';

export async function GET({ site }) {
  const urls = new Set();

  if (site) {
    const posts = await getPosts();
    for (const url of [
      '/',
      '/archives/',
      '/categories/',
      '/tags/',
      '/search/',
      '/about/',
    ]) {
      urls.add(url);
    }

    for (const post of posts) {
      urls.add(postUrl(post));
      urls.add(`/category/${encodeURIComponent(post.data.category)}/`);
      for (const tag of post.data.tags) urls.add(tagUrl(tag));
    }

    for (const key of groupByMonth(posts).keys()) {
      const [year, month] = key.split('/');
      urls.add(`/archives/${year}/${month}/`);
    }
  }

  const locations = site
    ? [...urls].map(
        (url) => `  <url><loc>${new URL(url, site).toString()}</loc></url>`,
      )
    : [];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations.join('\n')}\n</urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
