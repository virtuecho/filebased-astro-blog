import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib';
import { copy } from '../site.config';
import { postUrl } from '../content-workflow';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: copy.site.title,
    description: copy.site.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post.data, post.id)
    }))
  });
}
