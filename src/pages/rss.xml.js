import rss from '@astrojs/rss';
import { getPosts, postUrl } from '../lib';
import { copy } from '../site.config';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: copy.site.title,
    description: copy.site.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      ...(post.data.date ? { pubDate: post.data.date } : {}),
      link: postUrl(post),
    })),
  });
}
